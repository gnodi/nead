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
  getValues(values, definition) {
    const value = values[0];
    if (!definition && values.length <= 1 && (value === null || value === undefined)) {
      this[InjectionDefiner.throwMissingDependencyError]();
    }
    return values;
  }
}

module.exports = OptionalInjectionDefiner;
