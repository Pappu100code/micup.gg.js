'use strict';

const Base = require('./Base');
const User = require('./User');
const { Permissions } = require('../utils/Permissions');

class GuildMember extends Base {
  constructor(client, data = {}, guildId = null) {
    super(client);
    this.guildId = guildId || data.guild_id;
    this.user = data.user instanceof User ? data.user : (data.user ? new User(client, data.user) : null);
    this.id = this.user ? this.user.id : (data.id || data.user_id);
    this.nick = data.nick || null;
    this.avatar = data.avatar || null;
    this.roleIds = Array.isArray(data.roles) ? [...data.roles] : [];
    this.joinedAt = data.joined_at ? new Date(data.joined_at) : null;
    this.mute = Boolean(data.mute);
    this.deaf = Boolean(data.deaf);
    this.communicationDisabledUntil = data.communication_disabled_until ? new Date(data.communication_disabled_until) : null;
  }

  get guild() {
    return this.client.guilds.get(this.guildId);
  }

  get voice() {
    if (!this.guild) return null;
    const vs = this.guild.voiceStates.get(this.id);
    if (!vs || !vs.channelId) return null;
    return {
      channelId: vs.channelId,
      channel: this.guild.channels.get(vs.channelId) || null,
      sessionId: vs.sessionId,
      mute: Boolean(vs.mute),
      deaf: Boolean(vs.deaf),
      selfMute: Boolean(vs.selfMute),
      selfDeaf: Boolean(vs.selfDeaf)
    };
  }

  get displayName() {
    return this.nick || (this.user ? (this.user.globalName || this.user.username) : this.id);
  }

  get mention() {
    return `<@${this.id}>`;
  }

  get permissions() {
    if (!this.guild) return new Permissions(0);
    if (this.id === this.guild.ownerId) return new Permissions(18446744073709551615n);

    let bits = 0n;
    const everyoneRole = this.guild.roles.get(this.guildId);
    if (everyoneRole) bits |= everyoneRole.permissions.bitfield;

    for (const roleId of this.roleIds) {
      const role = this.guild.roles.get(roleId);
      if (role) bits |= role.permissions.bitfield;
    }

    return new Permissions(bits);
  }

  async addRole(roleId, reason) {
    const id = typeof roleId === 'object' ? roleId.id : roleId;
    await this.client.rest.addGuildMemberRole(this.guildId, this.id, id, reason);
    if (!this.roleIds.includes(id)) this.roleIds.push(id);
    return this;
  }

  async removeRole(roleId, reason) {
    const id = typeof roleId === 'object' ? roleId.id : roleId;
    await this.client.rest.removeGuildMemberRole(this.guildId, this.id, id, reason);
    this.roleIds = this.roleIds.filter(r => r !== id);
    return this;
  }

  async kick(reason) {
    return this.client.rest.removeGuildMember(this.guildId, this.id, reason);
  }

  async ban(options = {}) {
    return this.client.rest.createGuildBan(this.guildId, this.id, options);
  }

  async timeout(durationMs, reason) {
    const until = durationMs ? new Date(Date.now() + durationMs).toISOString() : null;
    return this.client.rest.modifyGuildMember(this.guildId, this.id, { communication_disabled_until: until }, reason);
  }

  async setNickname(nick, reason) {
    return this.client.rest.modifyGuildMember(this.guildId, this.id, { nick }, reason);
  }

  toString() {
    return this.mention;
  }
}

module.exports = GuildMember;

