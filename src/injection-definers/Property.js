'use strict';

const InjectionDefiner = require('../InjectionDefiner');

/**
 * @class PropertyInjectionDefiner
 */
class PropertyInjectionDefiner extends InjectionDefiner {
  /** @inheritdoc */
  get schema() {
    return {
      type: 'string',
      required: false
    };
  }

  /** @inheritdoc */
  getTargetProperty(name, definition) {
    return definition;
  }
}

module.exports = PropertyInjectionDefiner;
