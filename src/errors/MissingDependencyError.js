'use strict';

/**
 * @class errors/MissingDependencyError
 */
module.exports = class MissingDependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} name - The dependency name.
   */
  constructor(name) {
    super(`'${name}' dependency has not been injected`);

    this.name = 'MissingDependencyError';
  }
};
