'use strict';

const InjectionDefiner = require('../InjectionDefiner');

const proxies = Symbol('proxies');

/**
 * @class ProxyInjectionDefiner
 */
class ProxyInjectionDefiner extends InjectionDefiner {
  /**
   * Constructor.
   * @constructs
   */
  constructor() {
    super();
    this[proxies] = {};
  }

  /**
   * Set a proxy injector.
   * @param {string} key - The proxy key.
   * @param {Object} value - The proxy.
   * @throws {TypeError} On unexpected arguments.
   */
  setProxy(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError(`Expected a string key as first argument, got ${typeof value} instead`);
    }
    if (
      typeof value !== 'object' ||
      !value.getValues
    ) {
      throw new TypeError(`Expected a proxy injector as second argument, got ${typeof value} instead`);
    }

    this[proxies][key] = value;
  }

  /** @inheritdoc */
  get schema() {
    return {
      type: 'string',
      validate: (value, expected) => {
        const keys = Object.keys(this[proxies]);
        if (!keys.includes(value)) {
          return expected('proxy injector key', keys);
        }
        return value;
      }
    };
  }

  /** @inheritdoc */
  getValues(values, definition) {
    if (!definition) {
      return values;
    }

    const proxy = this[proxies][definition];
    return values.reduce(
      (list, value) => list.concat(proxy.getValues(value)),
      []
    );
  }
}

module.exports = ProxyInjectionDefiner;
