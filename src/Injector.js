'use strict';

const BadDefinitionError = require('./errors/BadDefinition');
const BadDependencyError = require('./errors/BadDependency');
const DependencyError = require('./errors/Dependency');
const MissingDependencyError = require('./errors/MissingDependency');
const NotDefinedDependencyError = require('./errors/NotDefinedDependency');
const UnexpectedError = require('./errors/Unexpected');

const validator = Symbol('validator');
const injectionDefiners = Symbol('injectionDefiners');
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
      typeof value !== 'object'
      || !value.schema
      || !value.getTargetProperty
      || !value.validate
    ) {
      throw new TypeError(`Expected a definer as second argument, got ${typeof value} instead`);
    }

    this[injectionDefiners][key] = value;
    this[definitionValidator] = this[compileDefinitionValidator]();
  }

  /**
   * Inject a dependency.
   * @param {Object} object - The object.
   * @param {string} property - The property name.
   * @param {*} dependency - The dependency.
   * @returns {*} The injected object.
   * @throws {DependencyError} On error related to a dependency.
   * @throws {UnexpectedError} On unexpected error.
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
   * @throws {DependencyError} On error related to a dependency.
   * @throws {UnexpectedError} On unexpected error.
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
   * @throws {DependencyError} On error related to a dependency.
   * @throws {UnexpectedError} On unexpected error.
   */
  validate(object) {
    const needed = this[getDependenciesDefinitions](object);

    if (!needed) {
      return;
    }

    Object.keys(needed).forEach((property) => {
      const propertyDefinition = this[getDependencyDefinition](object, property);
      const propertyName = this[getTargetProperty](propertyDefinition, property);

      // Retrieve dependency values to validate.
      const values = Object.keys(this[injectionDefiners]).reduce((list, key) => {
        try {
          return this[injectionDefiners][key].getValues(
            list,
            propertyDefinition[key]
          );
        } catch (error) {
          if (error instanceof MissingDependencyError) {
            throw new DependencyError(property, error);
          }
          throw new UnexpectedError(error);
        }
      }, [object[propertyName]]);

      // Validate dependency values.
      Object.keys(this[injectionDefiners]).forEach((key) => {
        try {
          values.forEach((value) => {
            this[injectionDefiners][key].validate(
              value,
              propertyDefinition[key]
            );
          });
        } catch (error) {
          if (error instanceof BadDependencyError) {
            throw new DependencyError(property, error);
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
   * @throws {DependencyError} On error related to a dependency.
   * @protected
   */
  [getDependencyDefinition](object, property) {
    try {
      const needed = this[getDependenciesDefinitions](object);

      if (!needed) {
        return null;
      }

      if (needed && !(property in needed)) {
        throw new NotDefinedDependencyError(Object.keys(needed));
      }

      return this[definitionValidator].validate(needed[property]);
    } catch (error) {
      const forwardedError = error instanceof NotDefinedDependencyError
        ? error
        : new BadDefinitionError(error);
      throw new DependencyError(property, forwardedError);
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
    const schema = Object.keys(this[injectionDefiners]).reduce((map, key) => {
      map[key] = this[injectionDefiners][key].schema; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    return this[validator].compile(schema);
  }
}

Injector.validator = validator;
Injector.injectionDefiners = injectionDefiners;
Injector.getDependenciesDefinitions = getDependenciesDefinitions;
Injector.getDependencyDefinition = getDependencyDefinition;
Injector.compileDefinitionValidator = compileDefinitionValidator;

module.exports = Injector;
