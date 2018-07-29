'use strict';

/**
 * @class MissingItemError
 */
module.exports = class MissingItemError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} type - The item type.
   * @param {string} key - The item key.
   */
  constructor(type, key) {
    super(`No ${type} found for '${key}' key`);

    this.name = 'NeadMissingItemError';
  }
};
