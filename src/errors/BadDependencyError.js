'use strict';

const error = Symbol('error');

/**
 * @class errors/BadDependencyError
 */
module.exports = class BadDependencyError extends TypeError {
  /**
   * Constructor.
   * @constructs
   * @param {Error} originalError - The original validation error.
   */
  constructor(originalError) {
    super(`Bad dependency (${originalError.message})`);

    this.name = 'BadDependencyError';
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
