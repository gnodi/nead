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
      || (!value.setType && !value.prototype.setType)
    ) {
      throw new BadTypeError(value, 'a registry object/class');
    }

    this[registryObject] = value;
  }

  /** @inheritdoc */
  get schema() {
    return {
      type: {
        type: 'string',
        required: false
      },
      items: {
        type: Object
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    const type = options.type
      ? options.type
      : key.replace('Registry', '').replace(/[A-Z]/g, match => ` ${match.toLowerCase()}`);

    return [{
      key,
      object: this[registryObject],
      dependencies: {
        type: {
          injectedValue: type,
          injectDependency: (registry, injectedType) => {
            registry.setType(injectedType);
          }
        },
        items: {
          injectedValue: options.items,
          injectDependency: (registry, items) => {
            Object.keys(items).forEach(itemKey => registry.set(itemKey, items[itemKey]));
          }
        }
      }
    }];
  }
}

module.exports = RegistryDefinitionFactory;
