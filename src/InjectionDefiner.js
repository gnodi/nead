'use strict';

const BadDependencyError = require('./errors/BadDependency');
const MissingDependencyError = require('./errors/MissingDependency');

const throwBadDependencyError = Symbol('throwBadDependencyError');
const throwMissingDependencyError = Symbol('throwMissingDependencyError');

/**
 * @class InjectionDefiner
 * @abstract
 */
class InjectionDefiner {
  /**
   * Validation schema for dependency definition.
   * @type {Object}
   */
  get schema() {
    return {};
  }

  /**
   * Get the target property to which the value will be set.
   * @param {string} name - The dependency name.
   * @param {*} definition - The dependency definition.
   * @returns {string} The property name.
   */
  getTargetProperty(name, definition) { // eslint-disable-line no-unused-vars
    return name;
  }

  /**
   * Get the values to validate.
   * @param {Array<*>} values - The original values.
   * @param {*} definition - The dependency definition.
   * @returns {Array<*>} definition - The values.
   */
  getValues(values, definition) { // eslint-disable-line no-unused-vars
    return values;
  }

  /**
   * Validate one of the value of a dependency.
   * @param {*} value - The value.
   * @param {*} definition - The dependency definition.
   * @returns {*} The validated value.
   * @throws BadDependencyError On bad dependency.
   */
  validate(value, definition) { // eslint-disable-line no-unused-vars
    return value;
  }

  /**
   * Get a validated dependency.
   * @param {*} value - The original dependency value.
   * @param {Array<*>} validatedValues - The validated values.
   * @param {*} definition - The dependency definition.
   * @returns {*} The validated dependency.
   */
  getValidatedDependency(value, validatedValues, definition) { // eslint-disable-line no-unused-vars
    return value;
  }

  /**
   * Throw a bad dependency error.
   * @param {Error|string} error - The original error or message.
   * @throws BadDependencyError
   */
  [throwBadDependencyError](error) {
    throw new BadDependencyError(error);
  }

  /**
   * Throw a missing dependency error.
   * @throws MissingDependencyError
   */
  [throwMissingDependencyError]() {
    throw new MissingDependencyError();
  }
}

InjectionDefiner.throwBadDependencyError = throwBadDependencyError;
InjectionDefiner.throwMissingDependencyError = throwMissingDependencyError;

module.exports = InjectionDefiner;
