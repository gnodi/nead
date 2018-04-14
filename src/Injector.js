'use strict';

const BadDefinitionError = require('./errors/BadDefinitionError');
const BadDependencyError = require('./errors/BadDependencyError');
const MissingDependencyError = require('./errors/MissingDependencyError');
const NotDefinedDependencyError = require('./errors/NotDefinedDependencyError');
const UnexpectedError = require('./errors/UnexpectedError');

const validator = Symbol('validator');
const injectionDefiners = Symbol('injectionDefiners');
const validationProcessors = Symbol('validationProcessors');
const definitionValidator = Symbol('definitionValidator');

const getDependenciesDefinitions = Symbol('getDependenciesDefinitions');
const getDependencyDefinition = Symbol('getDependencyDefinition');
const getTargetProperty = Symbol('getTargetProperty');
const injectDependencies = Symbol('injectDependencies');
const compileDefinitionValidator = Symbol('compileDefinitionValidator');

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
    this[validationProcessors] = {};
    this[definitionValidator] = null;
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
      throw new TypeError(`Expected a string key as first argument, got ${typeof value} instead`);
    }
    if (
      typeof value !== 'object' ||
      !value.schema ||
      !value.getTargetProperty
    ) {
      throw new TypeError(`Expected a definer as second argument, got ${typeof value} instead`);
    }

    this[injectionDefiners][key] = value;
    this[definitionValidator] = this[compileDefinitionValidator]();
  }

  /**
   * Set a validation processor.
   * @param {string} key - The property name.
   * @param {Object} value - The processor.
   * @throws {TypeError} On unexpected arguments.
   */
  setValidationProcessor(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError(`Expected a string key as first argument, got ${typeof value} instead`);
    }
    if (
      typeof value !== 'object' ||
      !value.schema ||
      !value.validate
    ) {
      throw new TypeError(`Expected a processor as second argument, got ${typeof value} instead`);
    }

    this[validationProcessors][key] = value;
    this[definitionValidator] = this[compileDefinitionValidator]();
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
      const propertyDefinition = this[getDependencyDefinition](object, property);
      const propertyName = this[getTargetProperty](propertyDefinition, property);

      if (!(propertyName in object)) {
        throw new MissingDependencyError(property);
      }

      Object.keys(this[validationProcessors]).forEach((key) => {
        try {
          this[validationProcessors][key].validate(
            object[propertyName],
            propertyDefinition[key]
          );
        } catch (error) {
          if (error.expectedType || error.expectedValues) {
            throw new BadDependencyError(error);
          }
          throw new UnexpectedError(error);
        }
      });
    });
  }

  /**
   * Get dependencies definitions of an object.
   * @param {Object} object - The object.
   * @returns {Object|null} The definitions or null if no one is defined.
   * @protected
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
   * Get dependency definition of an object property.
   * @param {Object} object - The object.
   * @param {string} property - The property name.
   * @returns {Object|null} The definitions or null if no one is defined.
   * @throws {NotDefinedDependencyError} On not defined dependency.
   * @throws {BadDefinitionError} On bad definition.
   * @throws {UnexpectedError} On unexpected error.
   * @protected
   */
  [getDependencyDefinition](object, property) {
    try {
      const needed = this[getDependenciesDefinitions](object);

      if (!needed) {
        return null;
      }

      if (needed && !(property in needed)) {
        throw new NotDefinedDependencyError(property, Object.keys(needed));
      }

      return this[definitionValidator].validate(needed[property]);
    } catch (error) {
      if (error.expectedType || error.expectedValues) {
        throw new BadDefinitionError(error);
      }
      if (error instanceof NotDefinedDependencyError) {
        throw error;
      }
      throw new UnexpectedError(error);
    }
  }

  /**
   * Get target property name.
   * @param {Object} propertyDefinition - The property definition.
   * @param {Object} defaultPropertyName - The default propertyName.
   * @returns {string} The property name.
   * @protected
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
   * @protected
   */
  [injectDependencies](object, dependencies) {
    return Object.keys(dependencies).reduce((obj, property) => {
      const definition = this[getDependencyDefinition](object, property);

      const targetProperty = this[getTargetProperty](definition, property);
      obj[targetProperty] = dependencies[property]; // eslint-disable-line no-param-reassign

      return obj;
    }, Object.create(object));
  }

  /**
   * Compile definition validator.
   * @returns {Object} The compiled validator.
   * @protected
   */
  [compileDefinitionValidator]() {
    const injectionSchema = Object.keys(this[injectionDefiners]).reduce((map, key) => {
      map[key] = this[injectionDefiners][key].schema; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    const validationSchema = Object.keys(this[validationProcessors]).reduce((map, key) => {
      map[key] = this[validationProcessors][key].schema; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    return this[validator].compile(Object.assign({}, injectionSchema, validationSchema));
  }
}

Injector.validator = validator;
Injector.injectionDefiners = injectionDefiners;
Injector.validationProcessors = validationProcessors;
Injector.getDependenciesDefinitions = getDependenciesDefinitions;
Injector.getDependencyDefinition = getDependencyDefinition;
Injector.compileDefinitionValidator = compileDefinitionValidator;

module.exports = Injector;
