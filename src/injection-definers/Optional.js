'use strict';

const InjectionDefiner = require('../InjectionDefiner');

/**
 * @class OptionalInjectionDefiner
 */
class OptionalInjectionDefiner extends InjectionDefiner {
  /** @inheritdoc */
  get schema() {
    return {
      type: 'boolean',
      default: false
    };
  }

  /** @inheritdoc */
  getValidatedDependency(value, validatedValues, definition) {
    const validatedValue = validatedValues[0];
    if (
      !definition
      && validatedValues.length <= 1
      && (validatedValue === null || validatedValue === undefined)
    ) {
      this[InjectionDefiner.throwMissingDependencyError]();
    }
    return value;
  }
}

module.exports = OptionalInjectionDefiner;
