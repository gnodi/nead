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
  getValues(values, definition) {
    const value = values[0];
    if (!definition && values.length <= 1 && (value === null || value === undefined)) {
      this[ValidationProcessor.throwMissingDependencyError]();
    }
    return values;
  }
}

module.exports = OptionalValidationProcessor;
