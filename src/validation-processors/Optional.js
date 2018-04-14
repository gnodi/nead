'use strict';

const ValidationProcessor = require('../ValidationProcessor');

/**
 * @class OptionalValidationProcessor
 */
class OptionalValidationProcessor extends ValidationProcessor {
  /** @inheritdoc */
  get schema() {
    return {
      type: 'boolean',
      default: false
    };
  }

  /** @inheritdoc */
  validate(value, definition) {
    if (value === null || value === undefined) {
      throw Error('...');
    }

    return definition || name;
  }
}

module.exports = OptionalValidationProcessor;
