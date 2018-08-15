'use strict';

const BadDefinitionError = require('./errors/BadDefinition');
const BadDependencyError = require('./errors/BadDependency');
const BadTypeError = require('./errors/BadType');
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
const getDefinerKeys = Symbol('getDefinerKeys');
const handleValidationError = Symbol('handleValidationError');

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
      throw new BadTypeError(value, 'a validator');
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
      throw new BadTypeError(value, 'a string key as first argument');
    }
    if (
      typeof value !== 'object'
      || !value.schema
      || !value.getTargetProperty
      || !value.validate
      || !value.getValidatedDependency
    ) {
      throw new BadTypeError(value, 'a definer as second argument');
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
   * @returns {object} The injected object.
   * @throws {DependencyError} On error related to a dependency.
   * @throws {UnexpectedError} On unexpected error.
   */
  injectSet(object, dependencies, validate) {
    const injectedObject = this[injectDependencies](object, dependencies);

    return validate
      ? this.validate(injectedObject)
      : injectedObject;
  }

  /**
   * Validate dependencies.
   * @param {Object} object - The object.
   * @returns {object} The validated object.
   * @throws {DependencyError} On error related to a dependency.
   * @throws {UnexpectedError} On unexpected error.
   */
  validate(object) {
    const needed = this[getDependenciesDefinitions](object);

    if (!needed) {
      return object;
    }

    const validatedDependencies = Object.keys(needed).reduce((dependencies, property) => {
      const propertyDefinition = this[getDependencyDefinition](object, property);
      const propertyName = this[getTargetProperty](propertyDefinition, property);
      const definerKeys = this[getDefinerKeys](propertyDefinition);
      const propertyValue = object[propertyName];

      // Retrieve dependency values to validate.
      const values = definerKeys.reduce((list, key) => {
        try {
          return this[injectionDefiners][key].getValues(
            list,
            propertyDefinition[key]
          );
        } catch (error) {
          return this[handleValidationError](error, property);
        }
      }, [propertyValue]);

      // Validate dependency values.
      const validatedValues = values.map((value) => {
        try {
          const validatedValue = definerKeys.reduce((val, key) => (
            this[injectionDefiners][key].validate(
              val,
              propertyDefinition[key]
            )
          ), value && value.isWrappedValue ? value.value : value);

          if (value && value.isWrappedValue) {
            value.value = validatedValue; // eslint-disable-line no-param-reassign
            return value;
          }

          return validatedValue;
        } catch (error) {
          return this[handleValidationError](error, property);
        }
      });

      // Impact validated values in dependencies.
      // eslint-disable-next-line no-param-reassign
      dependencies[property] = definerKeys.reduce((value, key) => {
        try {
          return this[injectionDefiners][key].getValidatedDependency(
            value,
            validatedValues,
            propertyDefinition[key]
          );
        } catch (error) {
          return this[handleValidationError](error, property);
        }
      }, propertyValue);

      return dependencies;
    }, {});

    return this[injectDependencies](object, validatedDependencies);
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

      return this[definitionValidator].validate(
        needed[property],
        {namespace: `${object.constructor.name}.${property}`}
      );
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

    return this[getDefinerKeys](propertyDefinition).reduce(
      (value, key) => this[injectionDefiners][key].getTargetProperty(
        value,
        propertyDefinition[key]
      ),
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
    const injectedObject = Array.isArray(object)
      ? Array.prototype.concat(object)
      : Object.create(object);

    return Object.keys(dependencies).reduce((obj, property) => {
      const definition = this[getDependencyDefinition](object, property);

      const targetProperty = this[getTargetProperty](definition, property);
      const dependency = dependencies[property];
      const hasAccessor = dependency
        && typeof dependency === 'object'
        && dependency.injectedValue !== undefined
        && dependency.injectDependency;

      if (hasAccessor) {
        dependency.injectDependency(obj, dependency.injectedValue);
      } else {
        obj[targetProperty] = dependencies[property]; // eslint-disable-line no-param-reassign
      }

      return obj;
    }, injectedObject);
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

    return this[validator].compile(schema, {
      immutable: true,
      required: true
    });
  }

  /**
   * Get definition keys from a property definition.
   * @param {Object} propertyDefinition - The property definition.
   * @returns {Array<string>} The keys.
   * @private
   */
  [getDefinerKeys](propertyDefinition) {
    return Object.keys(this[injectionDefiners]).filter(key => key in propertyDefinition);
  }

  /**
   * Handle a validation error.
   * @param {Error} propertyDefinition - The property definition.
   * @param {string} propertyName - The property name.
   * @throws {DependencyError} On validation error.
   * @throws {UnexpectedError} On unexpected error.
   * @private
   */
  [handleValidationError](error, propertyName) {
    if (
      error instanceof MissingDependencyError
      || error instanceof BadDependencyError
    ) {
      throw new DependencyError(propertyName, error);
    }
    throw new UnexpectedError(error);
  }
}

Injector.validator = validator;
Injector.injectionDefiners = injectionDefiners;
Injector.getDependenciesDefinitions = getDependenciesDefinitions;
Injector.getDependencyDefinition = getDependencyDefinition;
Injector.compileDefinitionValidator = compileDefinitionValidator;

module.exports = Injector;
