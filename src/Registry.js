'use strict';

const type = Symbol('type');
const items = Symbol('items');

/**
 * @class Registry
 */
class Registry {
  /**
   * @constructs Registry
   * @param {string} type_ - The item type.
   */
  constructor(type_) {
    this[type] = type_;
    this[items] = {};
  }

  /**
   * Set an item.
   * @param {string} key - The identifier key.
   * @param {*} item - The item.
   */
  set(key, item) {
    this[items][key] = item;
  }

  /**
   * Get an item.
   * @param {string} key - The identifier key.
   * @returns {*} The item.
   * @throws {Error} On unknown key.
   */
  get(key) {
    if (!(key in this[items])) {
      throw new Error(`No ${this[type]} found for '${key}' key`);
    }
    return this[items][key];
  }

  /**
   * Get item list.
   * @returns {Array<*>} The item list.
   */
  getAll() {
    return Object.keys(this[items]).map(key => this[items][key]);
  }
}

module.exports = Registry;
