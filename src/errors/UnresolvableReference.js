'use strict';

/**
 * @class UnresolvableReference
 */
module.exports = class UnresolvableReference extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} reference - The reference string.
   */
  constructor(reference) {
    super(`Cannot resolve '${reference}' reference`);

    this.name = 'NeadUnresolvableReference';
  }
};
