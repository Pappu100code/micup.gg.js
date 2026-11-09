'use strict';

class Base {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client, writable: false });
  }

  _patch(data) {
    return data;
  }
}

module.exports = Base;

