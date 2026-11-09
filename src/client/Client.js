'use strict';

const BaseClient = require('./BaseClient');
const RESTManager = require('../rest/RESTManager');
const GatewayManager = require('../gateway/GatewayManager');
const Collection = require('../utils/Collection');
const GuildManager = require('../managers/GuildManager');
const ChannelManager = require('../managers/ChannelManager');
const UserManager = require('../managers/UserManager');
const Guild = require('../structures/Guild');
const Channel = require('../structures/Channel');
const TextChannel = require('../structures/TextChannel');
const VoiceChannel = require('../structures/VoiceChannel');
const Message = require('../structures/Message');
const User = require('../structures/User');
const Role = require('../structures/Role');
const GuildMember = require('../structures/GuildMember');
const { ChannelType } = require('../gateway/Constants');

class Client extends BaseClient {
  constructor(options = {}) {
    super(options);
    this.token = null;
    this.user = null;
    this.readyTimestamp = null;

    this.rest = new RESTManager(this);
    this.gateway = new GatewayManager(this);

    this.guilds = new GuildManager(this);
    this.channels = new ChannelManager(this);
    this.users = new UserManager(this);
    this.voiceConnections = new Collection();
  }

  get uptime() {
    return this.readyTimestamp ? Date.now() - this.readyTimestamp : 0;
  }

  get ws() {
    return this.gateway;
  }

  get ping() {
    return this.gateway.ping;
  }

  async login(token = this.token) {
    if (!token) {
      throw new Error('A bot token must be provided to login.');
    }
    this.token = token;

    this.emit('debug', '[Client] Authenticating bot token...');
    try {
      const userData = await this.rest.getCurrentUser();
      this.user = new User(this, userData);
      this.users.set(this.user.id, this.user);
      this.emit('debug', `[Client] Authenticated as ${this.user.tag} (${this.user.id})`);
    } catch (err) {
      throw new Error(`Authentication failed: ${err.message}`);
    }

    this.emit('debug', '[Client] Opening gateway connection...');
    this.gateway.connect();
    return this.token;
  }

  destroy() {
    this.gateway.destroy();
    for (const [, conn] of this.voiceConnections) {
      try { conn.disconnect(); } catch {}
    }
    this.voiceConnections.clear();
    this.guilds.clear();
    this.channels.clear();
    this.users.clear();
    this.user = null;
    this.readyTimestamp = null;
    this.emit('debug', '[Client] Destroyed successfully.');
  }

  setActivity(name, type = 0) {
    return this.gateway.setPresence({
      activities: [{ name, type }]
    });
  }

  setStatus(status = 'online') {
    return this.gateway.setPresence({ status });
  }

  async fetchGuild(id) {
    const raw = await this.rest.getGuild(id);
    const guild = new Guild(this, raw);
    this.guilds.set(guild.id, guild);
    return guild;
  }

  async fetchChannel(id) {
    const raw = await this.rest.getChannel(id);
    const channel = this._initChannel(raw);
    this.channels.set(channel.id, channel);
    return channel;
  }

  async fetchUser(id) {
    const raw = await this.rest.getUser(id);
    const user = new User(this, raw);
    this.users.set(user.id, user);
    return user;
  }

  _initChannel(data) {
    if (!data) return null;
    if (data.type === ChannelType.GUILD_VOICE || data.type === ChannelType.GUILD_STAGE_VOICE) {
      return new VoiceChannel(this, data);
    }
    if (data.type === ChannelType.GUILD_TEXT || data.type === ChannelType.GUILD_ANNOUNCEMENT) {
      return new TextChannel(this, data);
    }
    return new Channel(this, data);
  }

  _handleRawDispatch(t, d, eventName) {
    switch (t) {
      case 'READY': {
        if (d.user) {
          this.user = new User(this, d.user);
          this.users.set(this.user.id, this.user);
        }
        if (Array.isArray(d.guilds)) {
          for (const g of d.guilds) {
            if (!this.guilds.has(g.id)) {
              this.guilds.set(g.id, new Guild(this, g));
            }
          }
        }
        this.emit('ready', this);
        break;
      }

      case 'GUILD_CREATE': {
        const guild = new Guild(this, d);
        this.guilds.set(guild.id, guild);
        this.emit('guildCreate', guild);
        break;
      }

      case 'GUILD_UPDATE': {
        const existing = this.guilds.get(d.id);
        const updated = new Guild(this, d);
        this.guilds.set(d.id, updated);
        this.emit('guildUpdate', existing, updated);
        break;
      }

      case 'GUILD_DELETE': {
        const existing = this.guilds.get(d.id);
        this.guilds.delete(d.id);
        this.emit('guildDelete', existing || { id: d.id, unavailable: Boolean(d.unavailable) });
        break;
      }

      case 'MESSAGE_CREATE': {
        const message = new Message(this, d);
        this.emit('messageCreate', message);
        break;
      }

      case 'MESSAGE_UPDATE': {
        const message = new Message(this, d);
        this.emit('messageUpdate', message);
        break;
      }

      case 'MESSAGE_DELETE': {
        this.emit('messageDelete', {
          id: d.id,
          channelId: d.channel_id,
          guildId: d.guild_id,
          channel: this.channels.get(d.channel_id),
          guild: this.guilds.get(d.guild_id)
        });
        break;
      }

      case 'MESSAGE_DELETE_BULK': {
        this.emit('messageDeleteBulk', {
          ids: d.ids,
          channelId: d.channel_id,
          guildId: d.guild_id,
          channel: this.channels.get(d.channel_id),
          guild: this.guilds.get(d.guild_id)
        });
        break;
      }

      case 'GUILD_MEMBER_ADD': {
        const member = new GuildMember(this, d, d.guild_id);
        const guild = this.guilds.get(d.guild_id);
        if (guild) guild.members.set(member.id, member);
        this.emit('guildMemberAdd', member);
        break;
      }

      case 'GUILD_MEMBER_REMOVE': {
        const guild = this.guilds.get(d.guild_id);
        const existing = guild ? guild.members.get(d.user.id) : null;
        if (guild) guild.members.delete(d.user.id);
        const user = new User(this, d.user);
        this.emit('guildMemberRemove', existing || { guild, user, guildId: d.guild_id });
        break;
      }

      case 'GUILD_ROLE_CREATE': {
        const role = new Role(this, d.role, d.guild_id);
        const guild = this.guilds.get(d.guild_id);
        if (guild) guild.roles.set(role.id, role);
        this.emit('roleCreate', role);
        break;
      }

      case 'GUILD_ROLE_UPDATE': {
        const role = new Role(this, d.role, d.guild_id);
        const guild = this.guilds.get(d.guild_id);
        const oldRole = guild ? guild.roles.get(role.id) : null;
        if (guild) guild.roles.set(role.id, role);
        this.emit('roleUpdate', oldRole, role);
        break;
      }

      case 'GUILD_ROLE_DELETE': {
        const guild = this.guilds.get(d.guild_id);
        const oldRole = guild ? guild.roles.get(d.role_id) : null;
        if (guild) guild.roles.delete(d.role_id);
        this.emit('roleDelete', oldRole || { id: d.role_id, guildId: d.guild_id });
        break;
      }

      case 'CHANNEL_CREATE': {
        const channel = this._initChannel(d);
        this.channels.set(channel.id, channel);
        const guild = this.guilds.get(d.guild_id);
        if (guild) guild.channels.set(channel.id, channel);
        this.emit('channelCreate', channel);
        break;
      }

      case 'CHANNEL_UPDATE': {
        const channel = this._initChannel(d);
        const oldChannel = this.channels.get(d.id);
        this.channels.set(channel.id, channel);
        const guild = this.guilds.get(d.guild_id);
        if (guild) guild.channels.set(channel.id, channel);
        this.emit('channelUpdate', oldChannel, channel);
        break;
      }

      case 'CHANNEL_DELETE': {
        const oldChannel = this.channels.get(d.id);
        this.channels.delete(d.id);
        const guild = this.guilds.get(d.guild_id);
        if (guild) guild.channels.delete(d.id);
        this.emit('channelDelete', oldChannel || { id: d.id, guildId: d.guild_id });
        break;
      }

      case 'VOICE_STATE_UPDATE': {
        const guild = this.guilds.get(d.guild_id);
        const oldState = guild ? guild.voiceStates.get(d.user_id) : null;
        let newState = null;
        if (guild) {
          if (d.channel_id) {
            newState = {
              userId: d.user_id,
              channelId: d.channel_id,
              sessionId: d.session_id,
              mute: Boolean(d.mute),
              deaf: Boolean(d.deaf),
              selfMute: Boolean(d.self_mute),
              selfDeaf: Boolean(d.self_deaf)
            };
            guild.voiceStates.set(d.user_id, newState);
          } else {
            guild.voiceStates.delete(d.user_id);
          }
        }
        this.emit('voiceStateUpdate', oldState, newState || d);
        this.emit('raw', { t, d });
        break;
      }

      case 'VOICE_SERVER_UPDATE': {
        this.emit('voiceServerUpdate', d);
        this.emit('raw', { t, d });
        break;
      }

      default: {
        this.emit(eventName, d);
        this.emit('raw', { t, d });
        break;
      }
    }
  }
}

module.exports = Client;
