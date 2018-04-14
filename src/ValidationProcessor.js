'use strict';

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
}

module.exports = ValidationProcessor;
