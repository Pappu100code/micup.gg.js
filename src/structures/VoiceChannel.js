'use strict';

const Channel = require('./Channel');
const VoiceConnection = require('../voice/VoiceConnection');

class VoiceChannel extends Channel {
  constructor(client, data = {}) {
    super(client, data);
    this.bitrate = data.bitrate || 64000;
    this.userLimit = data.user_limit || 0;
    this.rtcRegion = data.rtc_region || null;
  }

  get connection() {
    return this.client.voiceConnections ? this.client.voiceConnections.get(this.guildId) || null : null;
  }

  async join(options = {}) {
    const existing = this.client.voiceConnections ? this.client.voiceConnections.get(this.guildId) : null;
    if (existing && existing.channel.id === this.id) {
      return existing;
    }
    if (existing) {
      await existing.disconnect();
    }
    const connection = new VoiceConnection(this);
    if (this.client.voiceConnections) {
      this.client.voiceConnections.set(this.guildId, connection);
    }
    await connection.connect(options);
    return connection;
  }

  async leave() {
    const conn = this.client.voiceConnections ? this.client.voiceConnections.get(this.guildId) : null;
    if (conn) {
      await conn.disconnect();
      this.client.voiceConnections.delete(this.guildId);
    } else {
      this.client.gateway.sendVoiceStateUpdate(this.guildId, null);
    }
  }

  async setUserLimit(limit, reason) {
    return this.edit({ user_limit: limit }, reason);
  }

  async setBitrate(bitrate, reason) {
    return this.edit({ bitrate }, reason);
  }
}

module.exports = VoiceChannel;
