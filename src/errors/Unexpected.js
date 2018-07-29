'use strict';

const error = Symbol('error');

/**
 * @class UnexpectedError
 */
module.exports = class UnexpectedError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {Error} originalError - The original unexpected error.
   */
  constructor(originalError) {
    super(`Unexpected error (${originalError.message})`);

    this.name = 'NeadUnexpectedError';
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
