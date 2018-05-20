'use strict';

/**
 * @class DefinitionFactory
 * @abstract
 */
class DefinitionFactory {
  /**
   * Validation schema for property definition.
   * @type {Object}
   */
  get schema() {
    return {};
  }

  /**
   * Create some definitions.
   * @param {string} key - The creation key.
   * @param {*} options - The creation options.
   * @returns {Array<Object>} The definitions.
   */
  create(key, options) { // eslint-disable-line no-unused-vars
    throw new Error('\'create\' method must be implemented');
  }
}

module.exports = DefinitionFactory;
