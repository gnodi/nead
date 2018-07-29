'use strict';

/**
 * @class UnmergeableReferences
 */
module.exports = class UnmergeableReferences extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {Array<string>} references - The reference string list.
   */
  constructor(references) {
    super(`Cannot merge ['${references.join('\', \'')}'] references`);

    this.name = 'NeadUnmergeableReferences';
  }
};
