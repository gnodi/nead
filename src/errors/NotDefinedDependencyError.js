'use strict';

/**
 * @class errors/NotDefinedDependencyError
 */
class NotDefinedDependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {string} name - The dependency name.
   * @param {Array<string>} neededDependencies - The names of the needed dependencies.
   */
  constructor(name, neededDependencies) {
    super(`'${name}' dependency is not defined in the list of needed dependencies ['${neededDependencies.join('\', \'')}']`);
  }
}

module.exports = NotDefinedDependencyError;
