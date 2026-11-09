'use strict';

const Base = require('./Base');
const { ChannelType } = require('../gateway/Constants');

class Channel extends Base {
  constructor(client, data = {}) {
    super(client);
    this.id = data.id;
    this.name = data.name || null;
    this.type = data.type ?? ChannelType.GUILD_TEXT;
    this.guildId = data.guild_id || null;
    this.parentId = data.parent_id || null;
    this.position = data.position || 0;
  }

  get guild() {
    return this.guildId ? this.client.guilds.get(this.guildId) : null;
  }

  get isText() {
    return this.type === ChannelType.GUILD_TEXT || this.type === ChannelType.DM || this.type === ChannelType.GUILD_ANNOUNCEMENT;
  }

  get isVoice() {
    return this.type === ChannelType.GUILD_VOICE || this.type === ChannelType.GUILD_STAGE_VOICE;
  }

  get isCategory() {
    return this.type === ChannelType.GUILD_CATEGORY;
  }

  get mention() {
    return `<#${this.id}>`;
  }

  async fetch() {
    const data = await this.client.rest.getChannel(this.id);
    this.name = data.name;
    this.position = data.position;
    this.parentId = data.parent_id;
    return this;
  }

  async delete(reason) {
    await this.client.rest.deleteChannel(this.id, reason);
    this.client.channels.delete(this.id);
    if (this.guild && this.guild.channels) {
      this.guild.channels.delete(this.id);
    }
    return this;
  }

  async edit(data, reason) {
    const updated = await this.client.rest.modifyChannel(this.id, data, reason);
    Object.assign(this, updated);
    return this;
  }

  toString() {
    return this.mention;
  }
}

module.exports = Channel;

