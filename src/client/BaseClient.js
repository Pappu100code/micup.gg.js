'use strict';

const EventEmitter = require('events');

class BaseClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      apiBaseUrl: 'https://micup.gg/api/v10',
      gatewayUrl: 'wss://micup.gg/gateway?v=10&encoding=json',
      intents: 3276799,
      ...options
    };
  }
}

module.exports = BaseClient;

