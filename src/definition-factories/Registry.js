'use strict';

const DefinitionFactory = require('../DefinitionFactory');
const BadTypeError = require('../errors/BadType');

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
      || (!value.set && !value.prototype.set)
      || (!value.getList && !value.prototype.getList)
      || (!value.getMap && !value.prototype.getMap)
    ) {
      throw new BadTypeError(value, 'a registry object/class');
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
    const definitions = itemKeys.map(itemKey => ({
      key: `${key}.${itemKey}`,
      object: options.items[itemKey]
    }));

    // Create definition of registry.
    definitions.push({
      key,
      object: this[registryObject],
      dependencies: {
        items: {
          injectedValue: itemKeys.reduce((map, itemKey) => Object.assign(
            map,
            {[itemKey]: `#${key}.${itemKey}`}
          ), {}),
          injectDependency: (registry, items) => {
            Object.keys(items).forEach(itemKey => registry.set(itemKey, items[itemKey]));
          }
        }
      }
    });

    return definitions;
  }
}

module.exports = RegistryDefinitionFactory;
