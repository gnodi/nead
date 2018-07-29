'use strict';

const BadTypeError = require('./errors/BadType');
const MissingImplementationError = require('./errors/MissingImplementation');

const valueWrapper = Symbol('valueWrapper');

/**
 * @class ProxyInjector
 * @abstract
 */
class ProxyInjector {
  /**
   * Value wrapper.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set valueWrapper(value) {
    if (typeof value !== 'object' || !value.wrap) {
      throw new BadTypeError(value, 'a value wrapper');
    }

    this[valueWrapper] = value;
  }

  /**
   * Get proxyfied values.
   * @param {*} proxy - The proxy.
   * @returns {Array<*>} The proxyfied values.
   */
  getValues(proxy) { // eslint-disable-line no-unused-vars
    throw new MissingImplementationError(this, 'getValues');
  }

  /**
   * Get a proxy prototype.
   * @param {*} proxy - The original proxy.
   * @returns {*} The proxy prototype.
   */
  getPrototype(proxy) { // eslint-disable-line no-unused-vars
    throw new MissingImplementationError(this, 'getPrototype');
  }
}

ProxyInjector.valueWrapper = valueWrapper;

module.exports = ProxyInjector;
