'use strict';

/**
 * @class InjectionDefiner
 * @abstract
 */
class InjectionDefiner {
  /**
   * Validation schema for property definition.
   * @type {Object}
   */
  get schema() {
    return {};
  }

  /**
   * Get the target property to which the value will be set.
   * @param {string} name - The property name.
   * @param {Object} definition - The property definition.
   */
  getTargetProperty(name, definition) { // eslint-disable-line no-unused-vars
    return name;
  }
}

module.exports = InjectionDefiner;
