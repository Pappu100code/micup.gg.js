'use strict';

const BaseManager = require('./BaseManager');
const User = require('../structures/User');

class UserManager extends BaseManager {
  constructor(client) {
    super(client, User);
  }

  async fetch(id) {
    const userId = this.resolveId(id);
    const raw = await this.client.rest.getUser(userId);
    const user = new User(this.client, raw);
    this.cache.set(user.id, user);
    return user;
  }

  async createDM(id) {
    const userId = this.resolveId(id);
    const raw = await this.client.rest.createDM(userId);
    return this.client.channels.resolve(raw.id) || raw;
  }
}

module.exports = UserManager;

