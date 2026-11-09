'use strict';

/**
 * Extended Map data structure with utility functional methods.
 */
class Collection extends Map {
  /**
   * Find first element matching predicate.
   * @param {Function} fn
   * @returns {*}
   */
  find(fn) {
    for (const [key, val] of this) {
      if (fn(val, key, this)) return val;
    }
    return undefined;
  }

  /**
   * Filter collection items matching predicate.
   * @param {Function} fn
   * @returns {Collection}
   */
  filter(fn) {
    const results = new Collection();
    for (const [key, val] of this) {
      if (fn(val, key, this)) results.set(key, val);
    }
    return results;
  }

  /**
   * Map collection elements to an array.
   * @param {Function} fn
   * @returns {Array}
   */
  map(fn) {
    const results = [];
    for (const [key, val] of this) {
      results.push(fn(val, key, this));
    }
    return results;
  }

  /**
   * Checks if some element satisfies predicate.
   * @param {Function} fn
   * @returns {boolean}
   */
  some(fn) {
    for (const [key, val] of this) {
      if (fn(val, key, this)) return true;
    }
    return false;
  }

  /**
   * Checks if all elements satisfy predicate.
   * @param {Function} fn
   * @returns {boolean}
   */
  every(fn) {
    for (const [key, val] of this) {
      if (!fn(val, key, this)) return false;
    }
    return true;
  }

  /**
   * Returns first element.
   * @returns {*}
   */
  first() {
    return this.values().next().value;
  }

  /**
   * Returns last element.
   * @returns {*}
   */
  last() {
    const arr = [...this.values()];
    return arr[arr.length - 1];
  }

  /**
   * Returns a random element.
   * @returns {*}
   */
  random() {
    const arr = [...this.values()];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Converts collection values to array.
   * @returns {Array}
   */
  toJSON() {
    return [...this.values()];
  }
}

module.exports = Collection;

