'use strict';

const DefinitionFactory = require('../DefinitionFactory');

const registryObject = Symbol('registryObject');

/**
 * @class RegistryDefinitionFactory
 */
class RegistryDefinitionFactory extends DefinitionFactory {
  /**
   * Registry object/class.
   * @type {Function|Object}
   * @throws {TypeError} On unexpected value.
   */
  set registryObject(value) {
    if (
      !value
      || !['function', 'object'].includes(typeof value)
      || (!value.get && !value.prototype.get)
    ) {
      throw new TypeError(`Expected a registry object/class, got ${typeof value} instead`);
    }

    this[registryObject] = value;
  }

  /** @inheritdoc */
  get schema() {
    return {
      items: {
        type: Object
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    const itemKeys = Object.keys(options.items);
    // Create definitions of items.
    const items = itemKeys.map(itemKey => ({
      key: `${key}.${itemKey}`,
      object: options.items[itemKey]
    }));

    // Create definition of registry.
    items.push({
      key,
      object: this[registryObject],
      dependencies: {
        items: itemKeys.reduce((map, itemKey) => Object.assign(
          map,
          {[itemKey]: `#${key}.${itemKey}`}
        ), {})
      }
    });

    return items;
  }
}

module.exports = RegistryDefinitionFactory;
