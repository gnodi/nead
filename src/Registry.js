'use strict';

const BadTypeError = require('./errors/BadType');
const MissingItemError = require('./errors/MissingItem');

const type = Symbol('type');
const items = Symbol('items');

/**
 * @class Registry
 */
class Registry {
  /**
   * @constructs Registry
   * @param {string} [type_='item'] - The item type.
   */
  constructor(type_ = 'item') {
    this.setType(type_);
    this[items] = {};
  }

  /**
   * Set item type.
   * @param {string} value - The type.
   */
  setType(value) {
    if (typeof value !== 'string') {
      throw new BadTypeError(value, 'a string as first argument');
    }

    this[type] = value;
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
      throw new MissingItemError(this[type], key);
    }
    return this[items][key];
  }

  /**
   * Get item map.
   * @returns {Object<string,*>} The item map.
   */
  getMap() {
    return Object.assign({}, this[items]);
  }

  /**
   * Get item list.
   * @returns {Array<*>} The item list.
   */
  getList() {
    return Object.keys(this[items]).map(key => this[items][key]);
  }
}

module.exports = Registry;
