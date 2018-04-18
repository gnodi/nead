'use strict';

/**
 * @class NotDefinedDependencyError
 */
module.exports = class NotDefinedDependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {Array<string>} neededDependencies - The names of the needed dependencies.
   */
  constructor(neededDependencies) {
    super(`Dependency is not defined in the list of needed dependencies ['${neededDependencies.join('\', \'')}']`);

    this.name = 'NotDefinedDependencyError';
  }
};
