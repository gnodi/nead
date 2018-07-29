'use strict';

const error = Symbol('error');

/**
 * @class BadDefinitionError
 */
module.exports = class BadDefinitionError extends TypeError {
  /**
   * Constructor.
   * @constructs
   * @param {Error} originalError - The original validation error.
   */
  constructor(originalError) {
    super(`Bad need definition: ${originalError.message}`);

    this.name = 'NeadBadDefinitionError';
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
