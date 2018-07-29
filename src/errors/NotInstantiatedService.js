'use strict';

/**
 * @class NotInstantiatedServiceError
 */
module.exports = class NotInstantiatedServiceError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} service - The service key.
   */
  constructor(service) {
    super(`No '${service}' service instantiated`);

    this.name = 'NeadNotInstantiatedServiceError';
  }
};
