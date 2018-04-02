'use strict';

const InjectionDefiner = require('../InjectionDefiner');

/**
 * @class PropertyInjectionDefiner
 */
class PropertyInjectionDefiner extends InjectionDefiner {
  /** @inheritdoc */
  get schema() {
    return {type: 'string'};
  }

  /** @inheritdoc */
  getTargetProperty(name, definition) {
    return definition || name;
  }
}

module.exports = PropertyInjectionDefiner;
