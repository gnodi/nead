'use strict';

const error = Symbol('error');

/**
 * @class BadDependencyError
 */
module.exports = class BadDependencyError extends TypeError {
  /**
   * Constructor.
   * @constructs
   * @param {Error} originalError - The original validation error or message.
   */
  constructor(originalError) {
    const message = originalError instanceof Error ? originalError.message : originalError;
    super(`Bad dependency: ${message}`);

    this.name = 'NeadBadDependencyError';
    if (originalError instanceof Error) {
      this[error] = originalError;
    }
  }

  /**
   * Original error.
   * @type {Error}
   */
  get error() {
    return this[error];
  }
};
