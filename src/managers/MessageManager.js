'use strict';

const BaseManager = require('./BaseManager');
const Message = require('../structures/Message');

class MessageManager extends BaseManager {
  constructor(channel) {
    super(channel.client, Message);
    this.channel = channel;
  }

  async fetch(idOrOptions) {
    if (typeof idOrOptions === 'string') {
      const raw = await this.client.rest.getChannelMessage(this.channel.id, idOrOptions);
      const msg = new Message(this.client, raw);
      this.cache.set(msg.id, msg);
      return msg;
    }

    const options = idOrOptions || { limit: 50 };
    const rawList = await this.client.rest.getChannelMessages(this.channel.id, options);
    const messages = [];
    for (const raw of rawList) {
      const msg = new Message(this.client, raw);
      this.cache.set(msg.id, msg);
      messages.push(msg);
    }
    return messages;
  }

  async delete(id, reason) {
    const messageId = this.resolveId(id);
    await this.client.rest.deleteMessage(this.channel.id, messageId, reason);
    this.cache.delete(messageId);
    return null;
  }
}

module.exports = MessageManager;

