'use strict';

const BaseManager = require('./BaseManager');
const Guild = require('../structures/Guild');

class GuildManager extends BaseManager {
  constructor(client) {
    super(client, Guild);
  }

  async fetch(id) {
    if (!id) {
      const rawGuilds = await this.client.rest.getCurrentUserGuilds();
      for (const raw of rawGuilds) {
        if (!this.cache.has(raw.id)) {
          this.cache.set(raw.id, new Guild(this.client, raw));
        }
      }
      return this.cache;
    }

    const guildId = this.resolveId(id);
    const raw = await this.client.rest.getGuild(guildId);
    const guild = new Guild(this.client, raw);
    this.cache.set(guild.id, guild);
    return guild;
  }
}

module.exports = GuildManager;

