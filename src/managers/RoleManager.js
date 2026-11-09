'use strict';

const BaseManager = require('./BaseManager');
const Role = require('../structures/Role');

class RoleManager extends BaseManager {
  constructor(guild) {
    super(guild.client, Role);
    this.guild = guild;
  }

  async fetch(id) {
    if (!id) {
      const rawRoles = await this.client.rest.getGuildRoles(this.guild.id);
      this.cache.clear();
      for (const raw of rawRoles) {
        const role = new Role(this.client, raw, this.guild.id);
        this.cache.set(role.id, role);
      }
      return this.cache;
    }

    const roleId = this.resolveId(id);
    const existing = this.cache.get(roleId);
    if (existing) return existing;

    await this.fetch();
    return this.cache.get(roleId) || null;
  }

  async create(data = {}, reason) {
    const raw = await this.client.rest.createGuildRole(this.guild.id, data, reason);
    const role = new Role(this.client, raw, this.guild.id);
    this.cache.set(role.id, role);
    return role;
  }

  async delete(id, reason) {
    const roleId = this.resolveId(id);
    await this.client.rest.deleteGuildRole(this.guild.id, roleId, reason);
    const existing = this.cache.get(roleId);
    this.cache.delete(roleId);
    return existing || null;
  }

  async edit(id, data, reason) {
    const roleId = this.resolveId(id);
    const raw = await this.client.rest.modifyGuildRole(this.guild.id, roleId, data, reason);
    const role = new Role(this.client, raw, this.guild.id);
    this.cache.set(role.id, role);
    return role;
  }
}

module.exports = RoleManager;

