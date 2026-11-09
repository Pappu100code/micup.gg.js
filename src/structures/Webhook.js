'use strict';

const Base = require('./Base');

class Webhook extends Base {
  constructor(client, data = {}) {
    super(client);
    this.id = data.id;
    this.type = data.type || 1;
    this.guildId = data.guild_id || null;
    this.channelId = data.channel_id;
    this.name = data.name || null;
    this.avatar = data.avatar || null;
    this.token = data.token || null;
    this.url = data.url || (this.token ? `https://micup.gg/api/v10/webhooks/${this.id}/${this.token}` : null);
  }

  async send(content, options = {}) {
    if (!this.token) {
      throw new Error('Cannot execute a webhook without a token.');
    }
    let payload = content;
    if (typeof content === 'string') {
      payload = { content, ...options };
    } else if (content && content.toJSON) {
      payload = { embeds: [content.toJSON()], ...options };
    }
    return this.client.rest.executeWebhook(this.id, this.token, payload, Boolean(options.wait));
  }

  async edit(data, reason) {
    let updated;
    if (this.token) {
      updated = await this.client.rest.modifyWebhookWithToken(this.id, this.token, data);
    } else {
      updated = await this.client.rest.modifyWebhook(this.id, data, reason);
    }
    Object.assign(this, updated);
    return this;
  }

  async delete(reason) {
    if (this.token) {
      return this.client.rest.deleteWebhookWithToken(this.id, this.token);
    }
    return this.client.rest.deleteWebhook(this.id, reason);
  }
}

module.exports = Webhook;

