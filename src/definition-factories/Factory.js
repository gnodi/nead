'use strict';

const DefinitionFactory = require('../DefinitionFactory');
const BadTypeError = require('../errors/BadType');

const factoryObject = Symbol('factoryObject');

/**
 * @class FactoryDefinitionFactory
 */
class FactoryDefinitionFactory extends DefinitionFactory {
  /**
   * Factory object/class.
   * @type {Function|Object}
   * @throws {TypeError} On unexpected value.
   */
  set factoryObject(value) {
    if (
      !value
      || !['function', 'object'].includes(typeof value)
      || (!value.create && !value.prototype.create)
      || (!value.getObjectPrototype && !value.prototype.getObjectPrototype)
      || (!value.setObjectPrototype && !value.prototype.setObjectPrototype)
      || (!value.setDependency && !value.prototype.setDependency)
    ) {
      throw new BadTypeError(value, 'a factory object/class');
    }

    this[factoryObject] = value;
  }

  /** @inheritdoc */
  get schema() {
    return {
      object: {
        type: [Function, Object],
        required: true
      },
      dependencies: {
        type: Object,
        default: {}
      }
    };
  }

  /** @inheritdoc */
  create(key, options) {
    return [{
      key,
      object: this[factoryObject],
      dependencies: {
        dependencies: {
          injectedValue: options.dependencies,
          injectDependency: (factory, dependencies) => {
            Object.keys(dependencies).forEach(
              itemKey => factory.setDependency(itemKey, dependencies[itemKey])
            );
          }
        },
        prototype: {
          injectedValue: options.object,
          injectDependency: (factory, object) => {
            factory.setObjectPrototype(object);
          }
        }
      }
    }];
  }
}

module.exports = FactoryDefinitionFactory;
