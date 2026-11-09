'use strict';

const BaseManager = require('./BaseManager');
const Channel = require('../structures/Channel');
const TextChannel = require('../structures/TextChannel');
const VoiceChannel = require('../structures/VoiceChannel');
const { ChannelType } = require('../gateway/Constants');

class ChannelManager extends BaseManager {
  constructor(client) {
    super(client, Channel);
  }

  _createInstance(data) {
    return this.client._initChannel(data);
  }

  async fetch(id) {
    const channelId = this.resolveId(id);
    const raw = await this.client.rest.getChannel(channelId);
    const channel = this._createInstance(raw);
    this.cache.set(channel.id, channel);
    if (channel.guildId) {
      const guild = this.client.guilds.get(channel.guildId);
      if (guild && guild.channels) {
        guild.channels.set(channel.id, channel);
      }
    }
    return channel;
  }

  async delete(id, reason) {
    const channelId = this.resolveId(id);
    await this.client.rest.deleteChannel(channelId, reason);
    const existing = this.cache.get(channelId);
    this.cache.delete(channelId);
    if (existing && existing.guildId) {
      const guild = this.client.guilds.get(existing.guildId);
      if (guild && guild.channels) guild.channels.delete(channelId);
    }
    return existing || null;
  }
}

module.exports = ChannelManager;

