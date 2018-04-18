'use strict';

const BadDependencyError = require('./errors/BadDependency');
const MissingDependencyError = require('./errors/MissingDependency');

const throwBadDependencyError = Symbol('throwBadDependencyError');
const throwMissingDependencyError = Symbol('throwMissingDependencyError');

/**
 * @class ValidationProcessor
 * @abstract
 */
class ValidationProcessor {
  /**
   * Validation schema for property definition.
   * @type {Object}
   */
  get schema() {
    return {};
  }

  /**
   * Validate the property value.
   * @param {string} value - The property value.
   * @param {Object} definition - The property definition.
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

ValidationProcessor.throwBadDependencyError = throwBadDependencyError;
ValidationProcessor.throwMissingDependencyError = throwMissingDependencyError;

module.exports = ValidationProcessor;
