'use strict';

/**
 * @class NotDefinedDefinitionFactoryError
 */
module.exports = class NotDefinedDefinitionFactoryError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} factory - The factory key.
   * @param {Array<string>} availableFactories - The keys of the available factories.
   */
  constructor(factory, availableFactories) {
    super(`No '${factory}' definition factory defined in the list ['${availableFactories.join('\', \'')}'] of available factories`);

    this.name = 'NeadNotDefinedDefinitionFactoryError';
  }
};
