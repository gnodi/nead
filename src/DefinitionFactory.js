'use strict';

const MissingImplementationError = require('./errors/MissingImplementation');

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
    throw new MissingImplementationError(this, 'create');
  }
}

module.exports = DefinitionFactory;
