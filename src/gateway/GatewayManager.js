'use strict';

const EventEmitter = require('events');
const User = require('../structures/User');
const { GatewayOpcodes, VoiceOpcodes } = require('./Opcodes');
const { GatewayEvents } = require('./Constants');

// Use native WebSocket or fallback to 'ws' if available
const WS = typeof WebSocket !== 'undefined' ? WebSocket : (() => {
  try {
    return require('ws');
  } catch {
    throw new Error('WebSocket is not available in your environment.');
  }
})();

class GatewayManager extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.ws = null;
    this.heartbeatInterval = null;
    this.lastHeartbeatAck = true;
    this.sequence = null;
    this.sessionId = null;
    this.resumeGatewayUrl = null;
    this.ping = -1;
    this.lastHeartbeatSent = 0;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.isConnecting = false;
    this.isDestroyed = false;
  }

  connect(url = null) {
    if (this.isDestroyed) return;
    this.isConnecting = true;

    const gatewayUrl = url || this.resumeGatewayUrl || this.client.options.gatewayUrl || 'wss://micup.gg/gateway?v=10&encoding=json';
    this.client.emit('debug', `[Gateway] Connecting to ${gatewayUrl}`);

    try {
      this.ws = new WS(gatewayUrl);
    } catch (err) {
      this.client.emit('error', err);
      return this._handleDisconnect();
    }

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.client.emit('debug', '[Gateway] WebSocket connection established.');
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this._handleMessage(payload);
      } catch (err) {
        this.client.emit('error', new Error(`Failed to parse gateway message: ${err.message}`));
      }
    };

    this.ws.onerror = (err) => {
      this.client.emit('error', err);
    };

    this.ws.onclose = (event) => {
      this.client.emit('debug', `[Gateway] Connection closed: ${event.code} (${event.reason || 'No reason'})`);
      this._cleanup();
      this._handleDisconnect();
    };
  }

  _handleMessage(payload) {
    const { op, d, s, t } = payload;

    if (s !== null && s !== undefined) {
      this.sequence = s;
    }

    switch (op) {
      case GatewayOpcodes.HELLO: {
        const interval = d.heartbeat_interval;
        this.client.emit('debug', `[Gateway] Received HELLO with heartbeat interval ${interval}ms`);
        this._startHeartbeat(interval);

        if (this.sessionId && this.sequence !== null) {
          this._resume();
        } else {
          this._identify();
        }
        break;
      }

      case GatewayOpcodes.HEARTBEAT_ACK: {
        this.lastHeartbeatAck = true;
        this.ping = Date.now() - this.lastHeartbeatSent;
        this.client.emit('debug', `[Gateway] Heartbeat ACK received. Ping: ${this.ping}ms`);
        break;
      }

      case GatewayOpcodes.HEARTBEAT: {
        this._sendHeartbeat();
        break;
      }

      case GatewayOpcodes.RECONNECT: {
        this.client.emit('debug', '[Gateway] Server requested reconnect.');
        this.reconnect();
        break;
      }

      case GatewayOpcodes.INVALID_SESSION: {
        this.client.emit('debug', `[Gateway] Invalid session (resumable: ${d})`);
        if (!d) {
          this.sessionId = null;
          this.sequence = null;
        }
        setTimeout(() => this._identify(), 1500);
        break;
      }

      case GatewayOpcodes.DISPATCH: {
        this._handleDispatch(t, d);
        break;
      }
    }
  }

  _identify() {
    this.client.emit('debug', '[Gateway] Sending IDENTIFY...');
    const payload = {
      op: GatewayOpcodes.IDENTIFY,
      d: {
        token: this.client.token,
        intents: this.client.options.intents || 3276799,
        properties: {
          os: process.platform,
          browser: 'micup.gg.js',
          device: 'micup.gg.js'
        },
        presence: this.client.options.presence || {
          status: 'online',
          activities: [{ name: 'micup.gg', type: 0 }]
        }
      }
    };
    this.send(payload);
  }

  _resume() {
    this.client.emit('debug', `[Gateway] Attempting to RESUME with session ${this.sessionId}...`);
    const payload = {
      op: GatewayOpcodes.RESUME,
      d: {
        token: this.client.token,
        session_id: this.sessionId,
        seq: this.sequence
      }
    };
    this.send(payload);
  }

  _startHeartbeat(interval) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.lastHeartbeatAck = true;

    // First jitter
    const jitter = Math.random();
    setTimeout(() => {
      this._sendHeartbeat();
      this.heartbeatInterval = setInterval(() => {
        if (!this.lastHeartbeatAck) {
          this.client.emit('debug', '[Gateway] Heartbeat ACK missed! Reconnecting...');
          return this.reconnect();
        }
        this.lastHeartbeatAck = false;
        this._sendHeartbeat();
      }, interval);
    }, interval * jitter);
  }

  _sendHeartbeat() {
    this.lastHeartbeatSent = Date.now();
    this.send({
      op: GatewayOpcodes.HEARTBEAT,
      d: this.sequence
    });
  }

  _handleDispatch(type, data) {
    if (type === 'READY') {
      this.sessionId = data.session_id;
      this.resumeGatewayUrl = data.resume_gateway_url || null;
      if (this.client.user && typeof this.client.user._patch === 'function') {
        Object.assign(this.client.user, data.user);
      } else {
        this.client.user = new User(this.client, data.user);
      }
      this.client.readyTimestamp = Date.now();
      this.client.emit('debug', `[Gateway] READY received. Logged in as ${this.client.user.tag} (${data.user.id})`);
    }

    if (type === 'RESUMED') {
      this.client.emit('debug', '[Gateway] RESUMED successfully.');
      this.client.emit('resumed');
      return;
    }

    const eventName = GatewayEvents[type] || type.toLowerCase();
    this.client._handleRawDispatch(type, data, eventName);
  }

  send(data) {
    if (this.ws && this.ws.readyState === 1) { // 1 = OPEN
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  sendVoiceStateUpdate(guildId, channelId = null, selfMute = false, selfDeaf = false) {
    return this.send({
      op: GatewayOpcodes.VOICE_STATE_UPDATE,
      d: {
        guild_id: guildId,
        channel_id: channelId,
        self_mute: selfMute,
        self_deaf: selfDeaf
      }
    });
  }

  setPresence({ status = 'online', activities = [], afk = false } = {}) {
    return this.send({
      op: GatewayOpcodes.PRESENCE_UPDATE,
      d: {
        since: null,
        activities,
        status,
        afk
      }
    });
  }

  reconnect() {
    this._cleanup();
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
    this._handleDisconnect();
  }

  _handleDisconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.client.emit('error', new Error('Gateway reconnection limit exceeded.'));
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    this.client.emit('debug', `[Gateway] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
    setTimeout(() => this.connect(), delay);
  }

  _cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  destroy() {
    this.isDestroyed = true;
    this._cleanup();
    if (this.ws) {
      try { this.ws.close(1000, 'Client destroyed'); } catch {}
      this.ws = null;
    }
  }
}

module.exports = GatewayManager;
