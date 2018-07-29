'use strict';

const InjectionDefiner = require('../InjectionDefiner');
const BadTypeError = require('../errors/BadType');
const InaccessibleMemberError = require('../errors/InaccessibleMember');

const throwBadDependencyError = InjectionDefiner.throwBadDependencyError;

/**
 * @class InterfaceInjectionDefiner
 */
class InterfaceInjectionDefiner extends InjectionDefiner {
  /** @inheritdoc */
  get schema() {
    return {
      type: 'object',
      required: false,
      properties: {
        methods: {
          type: Array,
          items: {
            type: 'string'
          },
          default: []
        },
        getters: {
          type: Array,
          items: {
            type: 'string'
          },
          default: []
        },
        setters: {
          type: Array,
          items: {
            type: 'string'
          },
          default: []
        }
      }
    };
  }

  /** @inheritdoc */
  validate(value, definition) { // eslint-disable-line no-unused-vars
    if (value === null || value === undefined) {
      return value;
    }

    if (!value || typeof value !== 'object') {
      this[throwBadDependencyError](new BadTypeError(value, 'an object'));
    }

    let proto = value;
    const prototypes = [];
    let properties = [];
    while (proto) {
      prototypes.push(proto);
      properties = properties.concat(Object.getOwnPropertyNames(proto));
      proto = Object.getPrototypeOf(proto);
    }

    // Find missing methods.
    const missingMethods = definition.methods.reduce((list, property) => {
      const hasMethod = prototypes.some((prototype) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
        return descriptor && typeof descriptor.value === 'function';
      });

      if (!hasMethod) {
        list.push(property);
      }

      return list;
    }, []);

    // Find missing getters.
    const missingGetters = definition.getters.reduce((list, property) => {
      const hasGetter = prototypes.some((prototype) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
        return descriptor && typeof descriptor.get === 'function';
      });

      if (!hasGetter) {
        list.push(property);
      }

      return list;
    }, []);

    // Find missing setters.
    const missingSetters = definition.setters.reduce((list, property) => {
      const hasSetter = prototypes.some((prototype) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
        return descriptor && typeof descriptor.set === 'function';
      });

      if (!hasSetter) {
        list.push(property);
      }

      return list;
    }, []);

    // Throw bad type on missing implementation.
    if (
      missingMethods.length !== 0 ||
      missingGetters.length !== 0 ||
      missingSetters.length !== 0
    ) {
      let expected = 'an object implementing ';
      expected += missingMethods.length !== 0
        ? `[${definition.methods.join(', ')}] methods (missing: ${missingMethods.join(', ')}), `
        : `[${definition.methods.join(', ')}] methods, `;
      expected += missingGetters.length !== 0
        ? `[${definition.getters.join(', ')}] getters (missing: ${missingGetters.join(', ')}), `
        : `[${definition.getters.join(', ')}] getters, `;
      expected += missingSetters.length !== 0
        ? `[${definition.setters.join(', ')}] setters (missing: ${missingSetters.join(', ')})`
        : `[${definition.setters.join(', ')}] setters`;

      this[throwBadDependencyError](new BadTypeError(value, expected));
    }

    // Restrict object accessibility.
    return properties.reduce((object, property) => {
      if (property === 'constructor') {
        return object;
      }

      const descriptor = {};

      const hasMethod = definition.methods.includes(property);
      const hasGetter = definition.getters.includes(property);
      const hasSetter = definition.setters.includes(property);

      if (hasSetter) {
        descriptor.set = function set(propertyValue) {
          value[property] = propertyValue; // eslint-disable-line no-param-reassign
        };
      } else {
        descriptor.set = function set() {
          throw new InaccessibleMemberError(object, property);
        };
      }
      if (hasGetter || hasMethod) {
        descriptor.get = function get() {
          return value[property];
        };
      } else {
        descriptor.get = function get() {
          throw new InaccessibleMemberError(object, property);
        };
      }

      Object.defineProperty(object, property, descriptor);

      return object;
    }, Object.create(value));
  }
}

module.exports = InterfaceInjectionDefiner;
