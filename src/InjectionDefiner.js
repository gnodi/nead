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
   * Validation schema for property definition.
   * @type {Object}
   */
  get schema() {
    return {};
  }

  /**
   * Get the target property to which the value will be set.
   * @param {string} name - The property name.
   * @param {*} definition - The property definition.
   */
  getTargetProperty(name, definition) { // eslint-disable-line no-unused-vars
    return name;
  }

  /**
   * Get the values to validate.
   * @param {Array<*>} values - The original values.
   * @param {*} definition - The property definition.
   * @returns {Array<*>} definition - The values.
   */
  getValues(values, definition) { // eslint-disable-line no-unused-vars
    return values;
  }

  /**
   * Validate the property value.
   * @param {string} value - The property value.
   * @param {*} definition - The property definition.
   * @throws Error On validation failure.
   */
  validate(value, definition) { // eslint-disable-line no-unused-vars
    throw new Error('\'validate\' method must be implemented');
  }

  /**
   * Throw a bad dependency error.
   * @param {Error|string} error - The original error or message.
   * @throws BadDependencyError
   */
  [throwBadDependencyError](error) {
    const err = typeof error === 'string' ? new Error(error) : error;
    throw new BadDependencyError(err);
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
