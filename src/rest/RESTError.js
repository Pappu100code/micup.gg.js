'use strict';

class RESTError extends Error {
  constructor(message, status, code, method, url) {
    super(message);
    this.name = 'MicUpRESTError';
    this.status = status;
    this.code = code;
    this.method = method;
    this.url = url;
  }
}

module.exports = RESTError;

