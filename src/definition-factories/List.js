'use strict';

const DefinitionFactory = require('../DefinitionFactory');

/**
 * @class ListDefinitionFactory
 */
class ListDefinitionFactory extends DefinitionFactory {
  /** @inheritdoc */
  get schema() {
    return {
      items: {
        type: [Array, Object]
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    const itemKeys = Object.keys(options.items);
    const injectedItems = options.items instanceof Array
      ? Array.prototype.concat(options.items)
      : itemKeys.map(itemKey => options.items[itemKey]);

    return [{
      key,
      object: [],
      singleton: true,
      dependencies: {
        items: {
          injectedValue: injectedItems,
          injectDependency: (list, items) => {
            items.forEach(item => list.push(item));
          }
        }
      }
    }];
  }
}

module.exports = ListDefinitionFactory;
