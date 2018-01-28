'use strict';

const MissingDependencyError = require('./errors/MissingDependencyError');
const NotDefinedDependencyError = require('./errors/NotDefinedDependencyError');

const validator = Symbol('validator');
const injectionDefiners = Symbol('injectionDefiners');

const getDependenciesDefinitions = Symbol('getDependenciesDefinitions');
const getTargetProperty = Symbol('getTargetProperty');
const injectDependencies = Symbol('injectDependencies');

/**
 * @class Injector
 */
class Injector {
  /**
   * Constructor.
   * @constructs
   */
  constructor() {
    this[injectionDefiners] = {};
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
      !value.getValues ||
      !value.validate
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
    return this[injectDependencies](object, {[property]: dependency});
  }

  /**
   * Inject a set of dependencies.
   * @param {Object} object - The object.
   * @param {Object<*>} dependencies - The dependencies indexed by property name.
   * @param {boolean} validate - Whether or not to validate dependencies.
   * @returns {*} The injected object.
   * @throws {Error} On validation failure.
   */
  injectSet(object, dependencies, validate) {
    const injectedObject = this[injectDependencies](object, dependencies);

    if (validate) {
      this.validate(injectedObject);
    }

    return injectedObject;
  }

  /**
   * Validate dependencies.
   * @param {Object} object - The object.
   * @throws {Error} On validation failure.
   */
  validate(object) {
    const needed = this[getDependenciesDefinitions](object);

    if (!needed) {
      return;
    }

    Object.keys(needed).forEach((property) => {
      const propertyDefinition = needed[property];
      const propertyName = this[getTargetProperty](propertyDefinition, property);

      if (!(propertyName in object)) {
        throw new MissingDependencyError(property);
      }

      Object.keys(this[injectionDefiners]).forEach(
        key => this[injectionDefiners][key].validate(
          object[propertyName],
          propertyDefinition[key]
        ),
      );
    });
  }

  /**
   * Get dependencies definitions of an object.
   * @param {Object} object - The object.
   * @returns {Object|null} The definitions or null if no one is defined.
   * @private
   */
  [getDependenciesDefinitions](object) {
    if (!('need' in object)) {
      return null;
    }

    return typeof object.need === 'function'
      ? object.need()
      : object.need;
  }

  /**
   * Get target property name.
   * @param {Object} propertyDefinition - The property definition.
   * @param {Object} defaultPropertyName - The default propertyName.
   * @returns {string} The property name.
   * @private
   */
  [getTargetProperty](propertyDefinition, defaultPropertyName) {
    if (!propertyDefinition) {
      return defaultPropertyName;
    }

    return Object.keys(this[injectionDefiners]).reduce(
      (value, key) => this[injectionDefiners][key].getTargetProperty(value, propertyDefinition),
      defaultPropertyName
    );
  }

  /**
   * Inject dependencies into an object.
   * @param {Object} object - The object.
   * @param {Object<string,*>} dependencies - The dependencies indexed by property name.
   * @returns {Object} The injected object.
   * @private
   */
  [injectDependencies](object, dependencies) {
    return Object.keys(dependencies).reduce((obj, property) => {
      const needed = this[getDependenciesDefinitions](object);

      if (needed && !(property in needed)) {
        throw new NotDefinedDependencyError(property, Object.keys(object.need));
      }

      const propertyDefinition = needed && needed[property];
      const targetProperty = this[getTargetProperty](propertyDefinition, property);
      obj[targetProperty] = dependencies[property]; // eslint-disable-line no-param-reassign

      return obj;
    }, Object.create(object));
  }
}

Injector.validator = validator;
Injector.injectionDefiners = injectionDefiners;

module.exports = Injector;
