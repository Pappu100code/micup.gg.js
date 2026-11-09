'use strict';

const Channel = require('./Channel');
const Message = require('./Message');
const MessageManager = require('../managers/MessageManager');

class TextChannel extends Channel {
  constructor(client, data = {}) {
    super(client, data);
    this.topic = data.topic || null;
    this.nsfw = Boolean(data.nsfw);
    this.rateLimitPerUser = data.rate_limit_per_user || 0;
    this.lastMessageId = data.last_message_id || null;
    this.messages = new MessageManager(this);
  }

  async send(content) {
    const raw = await this.client.rest.createMessage(this.id, content);
    return new Message(this.client, raw);
  }

  async bulkDelete(messages, reason) {
    const ids = Array.isArray(messages)
      ? messages.map(m => (typeof m === 'object' ? m.id : m))
      : messages;
    return this.client.rest.bulkDeleteMessages(this.id, ids, reason);
  }

  async triggerTyping() {
    return this.client.rest.triggerTypingIndicator(this.id);
  }

  async fetchMessages(options = { limit: 50 }) {
    const raw = await this.client.rest.getChannelMessages(this.id, options);
    return raw.map(m => new Message(this.client, m));
  }

  async createInvite(options = {}, reason) {
    return this.client.rest.createChannelInvite(this.id, options, reason);
  }

  async createWebhook(data, reason) {
    const raw = await this.client.rest.createWebhook(this.id, data, reason);
    const Webhook = require('./Webhook');
    return new Webhook(this.client, raw);
  }

  async fetchWebhooks() {
    const raw = await this.client.rest.getChannelWebhooks(this.id);
    const Webhook = require('./Webhook');
    return raw.map(w => new Webhook(this.client, w));
  }

  async setSlowmode(seconds, reason) {
    return this.edit({ rate_limit_per_user: seconds }, reason);
  }

  async setTopic(topic, reason) {
    return this.edit({ topic }, reason);
  }
}

module.exports = TextChannel;

