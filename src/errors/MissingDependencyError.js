'use strict';

/**
 * @class errors/MissingDependencyError
 */
class MissingDependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} name - The dependency name.
   */
  constructor(name) {
    super(`'${name}' dependency has not been injected`);
  }
}

module.exports = MissingDependencyError;
