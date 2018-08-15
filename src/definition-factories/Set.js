'use strict';

const DefinitionFactory = require('../DefinitionFactory');
const BadTypeError = require('../errors/BadType');

const registryObject = Symbol('registryObject');

/**
 * @class SetDefinitionFactory
 */
class SetDefinitionFactory extends DefinitionFactory {
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
        type: Object,
        items: {
          type: Object,
          properties: {
            object: {
              required: true
            },
            singleton: {
              type: 'boolean',
              required: false
            },
            dependencies: {
              type: Object,
              required: false
            },
            need: {
              type: Object,
              required: false
            }
          }
        }
      },
      singleton: {
        type: 'boolean',
        default: false
      },
      dependencies: {
        type: Object,
        default: {}
      },
      need: {
        type: Object,
        required: false
      },
      registry: {
        type: 'string',
        required: false
      },
      list: {
        type: 'string',
        required: false
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    // Create definitions of items.
    const definitions = Object.keys(options.items).map((itemKey) => {
      const item = options.items[itemKey];
      const singleton = typeof item.singleton === 'boolean'
        ? item.singleton
        : options.singleton;
      const dependencies = Object.assign({}, options.dependencies, item.dependencies);
      const need = (options.need || item.need) && Object.assign({}, options.need, item.need);

      const definition = {
        key: `${key}.${itemKey}`,
        object: item.object,
        dependencies
      };

      if (singleton !== undefined) {
        definition.singleton = singleton;
      }
      if (need !== undefined) {
        definition.need = need;
      }

      return definition;
    });

    const itemReferences = Object.keys(options.items).reduce((map, itemKey) => {
      map[itemKey] = `#${key}.${itemKey}`; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    // Create definition of registry.
    if (options.registry) {
      definitions.push({
        key: options.registry,
        object: this[registryObject],
        dependencies: {
          items: {
            injectedValue: itemReferences,
            injectDependency: (registry, items) => {
              Object.keys(items).forEach(itemKey => registry.set(itemKey, items[itemKey]));
            }
          }
        }
      });
    }

    // Create definition of list.
    if (options.list) {
      definitions.push({
        key: options.list,
        object: [],
        singleton: true,
        dependencies: {
          items: {
            injectedValue: Object.keys(itemReferences).reduce((list, itemKey) => {
              list.push(itemReferences[itemKey]);
              return list;
            }, []),
            injectDependency: (list, items) => {
              items.forEach(item => list.push(item));
            }
          }
        }
      });
    }

    return definitions;
  }
}

module.exports = SetDefinitionFactory;
