'use strict';

/**
 * @class MissingDependencyError
 */
module.exports = class MissingDependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} name - The dependency name.
   */
  constructor() {
    super('Dependency has not been injected');

    this.name = 'MissingDependencyError';
  }
};
