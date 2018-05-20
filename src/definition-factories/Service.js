'use strict';

const DefinitionFactory = require('../DefinitionFactory');

/**
 * @class ServiceDefinitionFactory
 */
class ServiceDefinitionFactory extends DefinitionFactory {
  /** @inheritdoc */
  get schema() {
    return {
      object: {
        required: true
      },
      singleton: {
        type: 'boolean',
        default: false
      },
      dependencies: {
        type: 'object',
        default: {}
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    return [
      Object.assign({}, options, {key})
    ];
  }
}

module.exports = ServiceDefinitionFactory;
