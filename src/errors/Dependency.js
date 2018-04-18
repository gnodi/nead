'use strict';

const error = Symbol('error');

/**
 * @class DependencyError
 */
module.exports = class DependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} name - The dependency name.
   * @param {Error} originalError - The original validation error.
   */
  constructor(name, originalError) {
    super(`[${name}]: ${originalError.message}`);

    this.name = 'DependencyError';
    this[error] = originalError;
  }

  /**
   * Original error.
   * @type {Error}
   */
  get error() {
    return this[error];
  }
};
