'use strict';

const Base = require('./Base');
const User = require('./User');
const GuildMember = require('./GuildMember');

class Message extends Base {
  constructor(client, data = {}) {
    super(client);
    this.id = data.id;
    this.channelId = data.channel_id;
    this.guildId = data.guild_id || null;
    this.content = data.content || '';
    this.author = data.author ? new User(client, data.author) : null;
    this.member = data.member && this.guildId
      ? new GuildMember(client, { ...data.member, user: data.author }, this.guildId)
      : null;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
    this.tts = Boolean(data.tts);
    this.mentionEveryone = Boolean(data.mention_everyone);
    this.mentions = Array.isArray(data.mentions) ? data.mentions.map(u => new User(client, u)) : [];
    this.mentionRoles = data.mention_roles || [];
    this.attachments = data.attachments || [];
    this.embeds = data.embeds || [];
    this.pinned = Boolean(data.pinned);
    this.type = data.type || 0;
  }

  get channel() {
    return this.client.channels.get(this.channelId);
  }

  get guild() {
    return this.guildId ? this.client.guilds.get(this.guildId) : null;
  }

  async reply(content) {
    const payload = typeof content === 'string'
      ? { content }
      : (content?.toJSON ? { embeds: [content.toJSON()] } : { ...content });
    payload.message_reference = { message_id: this.id };
    const raw = await this.client.rest.createMessage(this.channelId, payload);
    return new Message(this.client, raw);
  }

  async edit(content) {
    const raw = await this.client.rest.editMessage(this.channelId, this.id, content);
    Object.assign(this, raw);
    return this;
  }

  async delete(reason) {
    return this.client.rest.deleteMessage(this.channelId, this.id, reason);
  }

  async react(emoji) {
    return this.client.rest.createReaction(this.channelId, this.id, emoji);
  }

  async pin(reason) {
    return this.client.rest.pinMessage(this.channelId, this.id, reason);
  }

  async unpin(reason) {
    return this.client.rest.unpinMessage(this.channelId, this.id, reason);
  }
}

module.exports = Message;

