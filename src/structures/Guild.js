'use strict';

const Base = require('./Base');
const Collection = require('../utils/Collection');
const Role = require('./Role');
const TextChannel = require('./TextChannel');
const VoiceChannel = require('./VoiceChannel');
const Channel = require('./Channel');
const GuildMember = require('./GuildMember');
const Webhook = require('./Webhook');
const RoleManager = require('../managers/RoleManager');
const GuildMemberManager = require('../managers/GuildMemberManager');
const { ChannelType } = require('../gateway/Constants');

class Guild extends Base {
  constructor(client, data = {}) {
    super(client);
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon || null;
    this.banner = data.banner || null;
    this.splash = data.splash || null;
    this.ownerId = data.owner_id;
    this.afkChannelId = data.afk_channel_id || null;
    this.afkTimeout = data.afk_timeout || 0;
    this.systemChannelId = data.system_channel_id || null;
    this.rulesChannelId = data.rules_channel_id || null;
    this.verificationLevel = data.verification_level || 0;
    this.features = data.features || [];
    this.vanityUrlCode = data.vanity_url_code || null;
    this.memberCount = data.member_count || (Array.isArray(data.members) ? data.members.length : 0);

    this.channels = new Collection();
    this.roles = new RoleManager(this);
    this.members = new GuildMemberManager(this);
    this.voiceStates = new Collection();

    if (Array.isArray(data.voice_states)) {
      for (const vs of data.voice_states) {
        this.voiceStates.set(vs.user_id, {
          userId: vs.user_id,
          channelId: vs.channel_id,
          sessionId: vs.session_id,
          mute: Boolean(vs.mute),
          deaf: Boolean(vs.deaf),
          selfMute: Boolean(vs.self_mute),
          selfDeaf: Boolean(vs.self_deaf)
        });
      }
    }

    if (Array.isArray(data.roles)) {
      for (const r of data.roles) {
        this.roles.set(r.id, new Role(client, r, this.id));
      }
    }

    if (Array.isArray(data.channels)) {
      for (const c of data.channels) {
        const channelInstance = this._createChannelInstance(c);
        this.channels.set(c.id, channelInstance);
        this.client.channels.set(c.id, channelInstance);
      }
    }

    if (Array.isArray(data.members)) {
      for (const m of data.members) {
        const memberInstance = new GuildMember(client, m, this.id);
        this.members.set(memberInstance.id, memberInstance);
      }
    }
  }

  _createChannelInstance(channelData) {
    channelData.guild_id = this.id;
    return this.client._initChannel(channelData);
  }

  get owner() {
    return this.members.get(this.ownerId);
  }

  get systemChannel() {
    return this.systemChannelId ? this.channels.get(this.systemChannelId) : null;
  }

  get voiceConnection() {
    return this.client.voiceConnections ? this.client.voiceConnections.get(this.id) || null : null;
  }

  async fetch() {
    const data = await this.client.rest.getGuild(this.id);
    this.name = data.name;
    this.icon = data.icon;
    this.ownerId = data.owner_id;
    this.verificationLevel = data.verification_level;
    this.features = data.features;
    return this;
  }

  async edit(data, reason) {
    const updated = await this.client.rest.modifyGuild(this.id, data, reason);
    Object.assign(this, updated);
    return this;
  }

  async delete() {
    return this.client.rest.deleteGuild(this.id);
  }

  async createChannel(name, options = {}, reason) {
    const payload = {
      name,
      type: options.type ?? ChannelType.GUILD_TEXT,
      topic: options.topic,
      bitrate: options.bitrate,
      user_limit: options.userLimit,
      rate_limit_per_user: options.rateLimitPerUser,
      parent_id: options.parentId || options.parent,
      nsfw: options.nsfw
    };
    const raw = await this.client.rest.createGuildChannel(this.id, payload, reason);
    const channel = this._createChannelInstance(raw);
    this.channels.set(channel.id, channel);
    this.client.channels.set(channel.id, channel);
    return channel;
  }

  async createRole(data = {}, reason) {
    const raw = await this.client.rest.createGuildRole(this.id, data, reason);
    const role = new Role(this.client, raw, this.id);
    this.roles.set(role.id, role);
    return role;
  }

  async fetchChannels() {
    const raw = await this.client.rest.getGuildChannels(this.id);
    this.channels.clear();
    for (const c of raw) {
      const channel = this._createChannelInstance(c);
      this.channels.set(channel.id, channel);
      this.client.channels.set(channel.id, channel);
    }
    return this.channels;
  }

  async fetchRoles() {
    const raw = await this.client.rest.getGuildRoles(this.id);
    this.roles.clear();
    for (const r of raw) {
      const role = new Role(this.client, r, this.id);
      this.roles.set(role.id, role);
    }
    return this.roles;
  }

  async fetchMembers(options = { limit: 100 }) {
    const raw = await this.client.rest.getGuildMembers(this.id, options);
    for (const m of raw) {
      const member = new GuildMember(this.client, m, this.id);
      this.members.set(member.id, member);
    }
    return this.members;
  }

  async fetchAuditLogs(options = {}) {
    return this.client.rest.getGuildAuditLog(this.id, options);
  }

  async fetchInvites() {
    return this.client.rest.getGuildInvites(this.id);
  }

  async fetchWebhooks() {
    const raw = await this.client.rest.getGuildWebhooks(this.id);
    return raw.map(w => new Webhook(this.client, w));
  }

  async fetchBans() {
    return this.client.rest.getGuildBans(this.id);
  }

  async ban(userId, options = {}) {
    const id = typeof userId === 'object' ? userId.id : userId;
    return this.client.rest.createGuildBan(this.id, id, options);
  }

  async unban(userId, reason) {
    const id = typeof userId === 'object' ? userId.id : userId;
    return this.client.rest.removeGuildBan(this.id, id, reason);
  }

  async kick(userId, reason) {
    const id = typeof userId === 'object' ? userId.id : userId;
    return this.client.rest.removeGuildMember(this.id, id, reason);
  }

  async leave() {
    return this.client.rest.leaveGuild(this.id);
  }

  iconURL(options = { format: 'png', size: 256 }) {
    if (!this.icon) return null;
    return `https://micup.gg/icons/${this.id}/${this.icon}.${options.format}?size=${options.size}`;
  }

  bannerURL(options = { format: 'png', size: 1024 }) {
    if (!this.banner) return null;
    return `https://micup.gg/banners/${this.id}/${this.banner}.${options.format}?size=${options.size}`;
  }

  toString() {
    return this.name;
  }
}

module.exports = Guild;

