'use strict';

const DefinitionFactory = require('../DefinitionFactory');

/**
 * @class DataDefinitionFactory
 */
class DataDefinitionFactory extends DefinitionFactory {
  /** @inheritdoc */
  get schema() {
    return {
      data: {
        type: Object
      },
      schema: {
        type: Object,
        default: {}
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    const need = Object.keys(options.schema).reduce((map, property) => {
      map[property] = { // eslint-disable-line no-param-reassign
        value: options.schema[property]
      };
      return map;
    }, {});

    return [{
      key,
      object: options.data,
      singleton: true,
      need
    }];
  }
}

module.exports = DataDefinitionFactory;
