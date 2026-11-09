'use strict';

const Base = require('./Base');

class User extends Base {
  constructor(client, data = {}) {
    super(client);
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator || '0000';
    this.globalName = data.global_name || null;
    this.avatar = data.avatar || null;
    this.bot = Boolean(data.bot);
    this.flags = data.flags || 0;
  }

  get tag() {
    return this.discriminator && this.discriminator !== '0000' && this.discriminator !== '0'
      ? `${this.username}#${this.discriminator}`
      : this.username;
  }

  get mention() {
    return `<@${this.id}>`;
  }

  async createDM() {
    const channelData = await this.client.rest.createDM(this.id);
    return this.client.channels.resolve(channelData.id) || channelData;
  }

  async send(content) {
    const dm = await this.createDM();
    return this.client.rest.createMessage(dm.id || dm, content);
  }

  avatarURL(options = { format: 'png', size: 256 }) {
    if (!this.avatar) return null;
    return `https://micup.gg/avatars/${this.id}/${this.avatar}.${options.format}?size=${options.size}`;
  }

  toString() {
    return this.mention;
  }
}

module.exports = User;

