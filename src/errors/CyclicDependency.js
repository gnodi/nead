'use strict';

/**
 * @class CyclicDependencyError
 */
module.exports = class CyclicDependencyError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {Array<string>} dependencyKeys - The dependency keys.
   */
  constructor(dependencyKeys) {
    super(`Cyclic dependency ['${dependencyKeys.join('\' < \'')}']`);

    this.name = 'NeadCyclicDependencyError';
  }
};
