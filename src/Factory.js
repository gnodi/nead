'use strict';

const BadTypeError = require('./errors/BadType');

const dependencies = Symbol('dependencies');
const injector = Symbol('injector');
const instantiator = Symbol('instantiator');
const prototype = Symbol('prototype');

/**
 * @class Factory
 */
class Factory {
  /**
   * @constructs Factory
   */
  constructor() {
    this[dependencies] = {};
  }

  /**
   * Instantiator.
   * @type {Instantiator}
   * @throws {TypeError} On unexpected value.
   */
  set instantiator(value) {
    if (typeof value !== 'object' || !value.instantiate) {
      throw new BadTypeError(value, 'an instantiator');
    }

    this[instantiator] = value;
  }

  /**
   * Injector.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set injector(value) {
    if (typeof value !== 'object' || !value.injectSet) {
      throw new BadTypeError(value, 'an injector');
    }

    this[injector] = value;
  }

  /**
   * Set a dependency for all instances.
   * @param {string} key - The identifier key.
   * @param {Object} dependency - The dependency.
   */
  setDependency(key, dependency) {
    this[dependencies][key] = dependency;
  }

  /**
   * Create an instance.
   * @param {Object<string,*>} [specificDependencies={}] - The instance specific dependencies.
   * @returns {Object} The instance.
   */
  create(specificDependencies = {}) {
    const object = this[instantiator].instantiate(this.getObjectPrototype());
    const allDependencies = Object.assign(
      {},
      this[dependencies],
      specificDependencies
    );

    return this[injector].injectSet(object, allDependencies);
  }

  /**
   * Set object prototype/constructor.
   * @param {Object|Function} value - The prototype/constructor.
   */
  setObjectPrototype(value) {
    this[prototype] = value;
  }

  /**
   * Get object prototype/constructor.
   * @returns {Object|Function} The prototype/constructor.
   */
  getObjectPrototype() {
    return this[prototype];
  }
}

module.exports = Factory;
