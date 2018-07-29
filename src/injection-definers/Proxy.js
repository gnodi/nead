'use strict';

const InjectionDefiner = require('../InjectionDefiner');
const BadTypeError = require('../errors/BadType');

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
      throw new BadTypeError(value, 'a string key as first argument');
    }
    if (
      typeof value !== 'object'
      || !value.getValues
    ) {
      throw new BadTypeError(value, 'a proxy injector as second argument');
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
      },
      default: 'direct'
    };
  }

  /** @inheritdoc */
  getValues(values, definition) {
    const proxy = this[proxies][definition];
    return values.reduce(
      (list, value) => list.concat(proxy.getValues(value)),
      []
    );
  }

  /** @inheritdoc */
  getValidatedDependency(value, validatedValues, definition) {
    const proxy = this[proxies][definition];
    const proxyPrototype = proxy.getPrototype(value);

    if (!proxyPrototype) {
      return validatedValues[0];
    }

    return validatedValues.reduce((prototype, validatedValue) => {
      if (validatedValue && validatedValue.isWrappedValue) {
        validatedValue.setValidatedValue(prototype);
      }
      return prototype;
    }, proxyPrototype);
  }
}

module.exports = ProxyInjectionDefiner;
