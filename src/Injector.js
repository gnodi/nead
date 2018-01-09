'use strict';

const validator = Symbol('validator');
const injectionDefiners = Symbol('injectionDefiners');

/**
 * @class Injector
 */
class Injector {
  /**
   * Constructor.
   * @constructs
   */
  constructor() {
    this[injectionDefiners] = {};
  }

  /**
   * Validator.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set validator(value) {
    if (typeof value !== 'object' || !value.compile || !value.validate) {
      throw new TypeError(`Expected a validator, got ${typeof value} instead`);
    }
    this[validator] = value;
  }

  /**
   * Set an injection definer.
   * @param {string} key - The property name.
   * @param {Object} value - The definer.
   * @throws {TypeError} On unexpected arguments.
   */
  setInjectionDefiner(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError(`Expected a key string as first argument, got ${typeof value} instead`);
    }
    if (
      typeof value !== 'object' ||
      !value.schema ||
      !value.getTargetProperty ||
      !value.getValues ||
      !value.check
    ) {
      throw new TypeError(`Expected a definer as second argument, got ${typeof value} instead`);
    }

    this[injectionDefiners][key] = value;
  }

  /**
   * Inject a dependency.
   * @param {Object} object - The object.
   * @param {string} property - The property name.
   * @param {*} dependency - The dependency.
   * @returns {*} The injected object.
   */
  inject(object, property, dependency) {
    const needed = object.need && object.need[property];
    const targetProperty = needed
      ? Object.keys(this[injectionDefiners]).reduce(
        (value, key) => this[injectionDefiners][key].getTargetProperty(value, needed[key]),
        property
      )
      : property;
    const injectedObject = Object.create(object);
    injectedObject[targetProperty] = dependency;
    return injectedObject;
  }

  /**
   * Inject a set of dependencies.
   * @param {Object} object - The object.
   * @param {Object<*>} dependencies - The dependencies indexed by property name.
   * @param {boolean} check - Whether or not to check dependencies validity.
   * @returns {*} The injected object.
   * @throws {Error} On validation failure.
   */
  injectSet(object, dependencies, check) {
    // ...
  }

  /**
   * Check dependencies validity.
   * @param {Object} object - The object.
   * @throws {Error} On validation failure.
   */
  check(object) {
    // ...
  }
};

Injector.validator = validator;
Injector.injectionDefiners = injectionDefiners;

module.exports = Injector;