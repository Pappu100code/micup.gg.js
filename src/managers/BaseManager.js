'use strict';

const Collection = require('../utils/Collection');

class BaseManager {
  constructor(client, holds) {
    Object.defineProperty(this, 'client', { value: client, writable: false });
    this.holds = holds;
    this.cache = new Collection();
  }

  get size() {
    return this.cache.size;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    return this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    return this.cache.clear();
  }

  forEach(fn) {
    return this.cache.forEach(fn);
  }

  find(fn) {
    return this.cache.find(fn);
  }

  filter(fn) {
    return this.cache.filter(fn);
  }

  map(fn) {
    return this.cache.map(fn);
  }

  some(fn) {
    return this.cache.some(fn);
  }

  every(fn) {
    return this.cache.every(fn);
  }

  first() {
    return this.cache.first();
  }

  last() {
    return this.cache.last();
  }

  [Symbol.iterator]() {
    return this.cache[Symbol.iterator]();
  }

  resolve(resolvable) {
    if (!resolvable) return null;
    if (resolvable instanceof this.holds) return resolvable;
    if (typeof resolvable === 'string') return this.cache.get(resolvable) || null;
    if (resolvable.id) return this.cache.get(resolvable.id) || null;
    return null;
  }

  resolveId(resolvable) {
    if (!resolvable) return null;
    if (typeof resolvable === 'string') return resolvable;
    if (resolvable.id) return resolvable.id;
    return null;
  }
}

module.exports = BaseManager;

