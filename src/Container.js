'use strict';

const validator = Symbol('validator');
const definitions = Symbol('definitions');
const definitionFactories = Symbol('definitionFactories');
const definitionValidators = Symbol('definitionValidators');
const services = Symbol('services');

const getDefinitionFactory = Symbol('getDefinitionFactory');

/**
 * @class Container
 */
class Container {
  /**
   * Constructor.
   * @constructs
   */
  constructor() {
    this[definitions] = [];
    this[definitionFactories] = {};
    this[definitionValidators] = {};
    this[services] = {};
  }

  /**
   * Validator.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set validator(value) {
    if (typeof value !== 'object' || !value.compile || !value.validate) {
      throw new TypeError(`Expected a validator, got ${typeof value} instead`);
    }

    this[validator] = value;
  }

  /**
   * Set an injection definer.
   * @param {string} key - The property name.
   * @param {Object} value - The definer.
   * @throws {TypeError} On unexpected arguments.
   */
  setDefinitionFactory(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError(`Expected a string key as first argument, got ${typeof value} instead`);
    }
    if (
      typeof value !== 'object' ||
      !value.schema ||
      !value.create
    ) {
      throw new TypeError(`Expected a definition factory as second argument, got ${typeof value} instead`);
    }

    this[definitionFactories][key] = value;
    this[definitionValidators][key] = this[validator].compile(value.schema);
  }

  /**
   * Create service definitions.
   * @param {string} factoryKey - The factory key.
   * @param {string} serviceKey - The service key.
   * @param {Object} [options={}] - The options.
   * @returns {Array<*>} The list of created definitions.
   * @throws {Error} On not defined factory.
   */
  create(factoryKey, serviceKey, options = {}) {
    const factory = this[getDefinitionFactory](factoryKey);
    const newDefinitions = factory.create(serviceKey, options);
    this[definitions] = this[definitions].concat(newDefinitions);

    return definitions;
  }

  /**
   * Instantiate and inject services into each others.
   * @returns {Array<*>} The list of instantiated services.
   */
  build() {
    this[services] = this[definitions].reduce((map, definition) => {
      let object;
      if (definition.singleton === true) {
        object = definition.object;
      } else if (definition.object instanceof Function) {
        object = new definition.object(); // eslint-disable-line new-cap
      } else {
        object = Object.create(definition.object);
      }
      map[definition.key] = object; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    return this[services];
  }

  /**
   * Get a service.
   * @param {string} key - The service key.
   * @returns {*} The service.
   * @throws {Error} On not instantiated service.
   */
  get(key) {
    if (!(key in this[services])) {
      throw new Error(`No '${key}' instantiated service`);
    }

    return this[services][key];
  }

  /**
   * Get definition factory.
   * @param {string} key - The factory key.
   * @returns {DefinitionFactory} The factory.
   * @throws {Error} On not defined factory.
   * @protected
   */
  [getDefinitionFactory](key) {
    if (!(key in this[definitionFactories])) {
      throw new Error(`No '${key}' defined definition factory`);
    }

    return this[definitionFactories][key];
  }
}

Container.validator = validator;
Container.definitionFactories = definitionFactories;
Container.getDefinitionFactory = getDefinitionFactory;

module.exports = Container;
