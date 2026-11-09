'use strict';

const BaseManager = require('./BaseManager');
const GuildMember = require('../structures/GuildMember');

class GuildMemberManager extends BaseManager {
  constructor(guild) {
    super(guild.client, GuildMember);
    this.guild = guild;
  }

  async fetch(idOrOptions) {
    if (typeof idOrOptions === 'string') {
      const raw = await this.client.rest.getGuildMember(this.guild.id, idOrOptions);
      const member = new GuildMember(this.client, raw, this.guild.id);
      this.cache.set(member.id, member);
      return member;
    }

    const options = idOrOptions || { limit: 100 };
    const rawMembers = await this.client.rest.getGuildMembers(this.guild.id, options);
    for (const raw of rawMembers) {
      const member = new GuildMember(this.client, raw, this.guild.id);
      this.cache.set(member.id, member);
    }
    return this.cache;
  }

  async search(query, limit = 20) {
    const raw = await this.client.rest.searchGuildMembers(this.guild.id, query, limit);
    const results = [];
    for (const data of raw) {
      const member = new GuildMember(this.client, data, this.guild.id);
      this.cache.set(member.id, member);
      results.push(member);
    }
    return results;
  }

  async ban(user, options = {}) {
    const id = this.resolveId(user);
    return this.client.rest.createGuildBan(this.guild.id, id, options);
  }

  async unban(user, reason) {
    const id = this.resolveId(user);
    return this.client.rest.removeGuildBan(this.guild.id, id, reason);
  }

  async kick(user, reason) {
    const id = this.resolveId(user);
    return this.client.rest.removeGuildMember(this.guild.id, id, reason);
  }
}

module.exports = GuildMemberManager;

