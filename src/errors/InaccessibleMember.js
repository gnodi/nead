'use strict';

/**
 * @class InaccessibleMemberError
 */
module.exports = class InaccessibleMemberError extends Error {
  /**
   * Constructor.
   * @constructs
   * @param {Object} object - The object.
   * @param {string} member - The member name.
   */
  constructor(object, member) {
    super(`'${member}' member of '${object.constructor.name}' is behind an interface and is therefore inaccessible`);

    this.name = 'NeadInaccessibleMemberError';
  }
};
