'use strict';

const BadTypeError = require('./errors/BadType');
const NotDefinedDefinitionFactoryError = require('./errors/NotDefinedDefinitionFactory');
const NotInstantiatedServiceError = require('./errors/NotInstantiatedService');

const injector = Symbol('injector');
const validator = Symbol('validator');
const dependencySorter = Symbol('dependencySorter');
const referenceResolver = Symbol('referenceResolver');
const instantiator = Symbol('instantiator');
const definitions = Symbol('definitions');
const definitionFactories = Symbol('definitionFactories');
const definitionValidators = Symbol('definitionValidators');
const services = Symbol('services');

const getDefinitionFactory = Symbol('getDefinitionFactory');
const instantiateService = Symbol('instantiateService');

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
   * Injector.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set injector(value) {
    if (typeof value !== 'object' || !value.injectSet) {
      throw new BadTypeError(value, 'an injector');
    }

    this[injector] = value;
  }

  /**
   * Validator.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set validator(value) {
    if (typeof value !== 'object' || !value.compile || !value.validate) {
      throw new BadTypeError(value, 'a validator');
    }

    this[validator] = value;
  }

  /**
   * Dependency sorter.
   * @type {DependencySorter}
   * @throws {TypeError} On unexpected value.
   */
  set dependencySorter(value) {
    if (typeof value !== 'object' || !value.sort) {
      throw new BadTypeError(value, 'a dependency sorter');
    }

    this[dependencySorter] = value;
  }

  /**
   * Reference resolver.
   * @type {ReferenceResolver}
   * @throws {TypeError} On unexpected value.
   */
  set referenceResolver(value) {
    if (typeof value !== 'object' || !value.find || !value.resolve) {
      throw new BadTypeError(value, 'a reference resolver');
    }

    this[referenceResolver] = value;
  }

  /**
   * Service instantiator.
   * @type {Instantiator}
   * @throws {TypeError} On unexpected value.
   */
  set instantiator(value) {
    if (typeof value !== 'object' || !value.instantiate) {
      throw new BadTypeError(value, 'a service instantiator');
    }

    this[instantiator] = value;
  }
  }

  /**
   * Set an injection definer.
   * @param {string} key - The property name.
   * @param {Object} value - The definer.
   * @throws {TypeError} On unexpected arguments.
   */
  setDefinitionFactory(key, value) {
    if (typeof key !== 'string') {
      throw new BadTypeError(value, 'a string key as first argument');
    }
    if (
      typeof value !== 'object' ||
      !value.schema ||
      !value.create
    ) {
      throw new BadTypeError(value, 'a definition factory as second argument');
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
    const newDefinitions = factory.create(serviceKey, options).map(definition => Object.assign(
      {dependencies: {}},
      definition,
      {dependencyKeys: this[referenceResolver].find(definition)}
    ));

    this[definitions] = this[definitions].concat(newDefinitions);

    return newDefinitions;
  }

  /**
   * Instantiate and inject services into each others.
   * @returns {Array<string,Object>} The list of instantiated services.
   */
  build() {
    const dependencySortedDefinitions = this[dependencySorter].sort(this[definitions]);
    let references = {};

    this[services] = dependencySortedDefinitions.reduce((map, definition) => {
      // Instantiate service object.
      const service = this[instantiator].instantiate(
        definition.object,
        definition.singleton
      );

      // Resolve service references.
      const resolvedDefinition = this[referenceResolver].resolve(
        definition,
        references
      );

      // Merge service need with definition need.
      if (definition.need && !Object.getOwnPropertyDescriptor(service, 'need')) {
        Object.defineProperty(service, 'need', {
          value: Object.assign({}, service.need, definition.need),
          enumerable: false
        });
      }

      // Inject service dependencies.
      const injectedService = this[injector].injectSet(
        service,
        resolvedDefinition.dependencies,
        true
      );

      // Add service to the service map.
      // eslint-disable-next-line no-param-reassign
      map[definition.key] = injectedService;

      // Add service to reference map.
      references = Object.assign(
        {},
        this[referenceResolver].build(definition.key, injectedService),
        references
      );

      return map;
    }, {});

    return this[services];
  }

  /**
   * Get a service.
   * @param {string} key - The service key.
   * @returns {Object} The service.
   * @throws {NotInstantiatedServiceError} On not instantiated service.
   */
  get(key) {
    if (!(key in this[services])) {
      throw new NotInstantiatedServiceError(key);
    }

    return this[services][key];
  }

  /**
   * Get definition factory.
   * @param {string} key - The factory key.
   * @returns {DefinitionFactory} The factory.
   * @throws {NotDefinedDefinitionFactoryError} On not defined factory.
   * @protected
   */
  [getDefinitionFactory](key) {
    if (!(key in this[definitionFactories])) {
      throw new NotDefinedDefinitionFactoryError(key, Object.keys(this[definitionFactories]));
    }

    return this[definitionFactories][key];
  }
}

Container.injector = injector;
Container.validator = validator;
Container.dependencySorter = dependencySorter;
Container.referenceResolver = referenceResolver;
Container.instantiator = instantiator;
Container.definitionFactories = definitionFactories;
Container.getDefinitionFactory = getDefinitionFactory;
Container.instantiateService = instantiateService;

module.exports = Container;
