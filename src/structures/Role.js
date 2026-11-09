'use strict';

const Base = require('./Base');
const { Permissions } = require('../utils/Permissions');

class Role extends Base {
  constructor(client, data = {}, guildId = null) {
    super(client);
    this.id = data.id;
    this.guildId = guildId || data.guild_id;
    this.name = data.name;
    this.color = data.color || 0;
    this.hoist = Boolean(data.hoist);
    this.position = data.position || 0;
    this.permissions = new Permissions(data.permissions || 0);
    this.managed = Boolean(data.managed);
    this.mentionable = Boolean(data.mentionable);
    this.icon = data.icon || null;
    this.unicodeEmoji = data.unicode_emoji || null;
  }

  get guild() {
    return this.client.guilds.get(this.guildId);
  }

  get mention() {
    return `<@&${this.id}>`;
  }

  async edit(data, reason) {
    const updated = await this.client.rest.modifyGuildRole(this.guildId, this.id, data, reason);
    Object.assign(this, {
      name: updated.name,
      color: updated.color,
      hoist: updated.hoist,
      permissions: new Permissions(updated.permissions),
      mentionable: updated.mentionable
    });
    return this;
  }

  async delete(reason) {
    await this.client.rest.deleteGuildRole(this.guildId, this.id, reason);
    if (this.guild && this.guild.roles) {
      this.guild.roles.delete(this.id);
    }
    return this;
  }

  toString() {
    return this.mention;
  }
}

module.exports = Role;

