'use strict';

const felv = require('felv');
const Container = require('./src/Container');
const Injector = require('./src/Injector');
const DependencySorter = require('./src/DependencySorter');
const ReferenceResolver = require('./src/ReferenceResolver');
const ServiceInstantiator = require('./src/ServiceInstantiator');
const ValueValidationWrapper = require('./src/ValueValidationWrapper');
const InterfaceInjectionDefiner = require('./src/injection-definers/Interface');
const OptionalInjectionDefiner = require('./src/injection-definers/Optional');
const PropertyInjectionDefiner = require('./src/injection-definers/Property');
const ProxyInjectionDefiner = require('./src/injection-definers/Proxy');
const ValueInjectionDefiner = require('./src/injection-definers/Value');
const RegistryDefinitionFactory = require('./src/definition-factories/Registry');
const ServiceDefinitionFactory = require('./src/definition-factories/Service');
const DirectProxyInjector = require('./src/proxy-injectors/Direct');
const FactoryProxyInjector = require('./src/proxy-injectors/Factory');
const ListProxyInjector = require('./src/proxy-injectors/List');
const RegistryProxyInjector = require('./src/proxy-injectors/Registry');

const valueValidationWrapper = new ValueValidationWrapper();

const directProxyInjector = new DirectProxyInjector();
const factoryProxyInjector = new FactoryProxyInjector();
const listProxyInjector = new ListProxyInjector();
listProxyInjector.valueWrapper = valueValidationWrapper;
const registryProxyInjector = new RegistryProxyInjector();
registryProxyInjector.valueWrapper = valueValidationWrapper;

const interfaceInjectionDefiner = new InterfaceInjectionDefiner();
const optionalInjectionDefiner = new OptionalInjectionDefiner();
const propertyInjectionDefiner = new PropertyInjectionDefiner();
const proxyInjectionDefiner = new ProxyInjectionDefiner();
proxyInjectionDefiner.setProxy('direct', directProxyInjector);
proxyInjectionDefiner.setProxy('factory', factoryProxyInjector);
proxyInjectionDefiner.setProxy('list', listProxyInjector);
proxyInjectionDefiner.setProxy('registry', registryProxyInjector);
const valueInjectionDefiner = new ValueInjectionDefiner();
valueInjectionDefiner.validator = felv;

const registryDefinitionFactory = new RegistryDefinitionFactory();
const serviceDefinitionFactory = new ServiceDefinitionFactory();

const injector = new Injector();
injector.validator = felv;
injector.setInjectionDefiner('interface', interfaceInjectionDefiner);
injector.setInjectionDefiner('optional', optionalInjectionDefiner);
injector.setInjectionDefiner('property', propertyInjectionDefiner);
injector.setInjectionDefiner('proxy', proxyInjectionDefiner);
injector.setInjectionDefiner('value', valueInjectionDefiner);

const dependencySorter = new DependencySorter();

const referenceResolver = new ReferenceResolver();

const serviceInstantiator = new ServiceInstantiator();

/**
 * Inject a dependency.
 * @param {Object} object - The object.
 * @param {string} property - The property name.
 * @param {*} dependency - The dependency.
 * @returns {*} The injected object.
 */
exports.inject = function inject(object, property, dependency) {
  return injector.inject(object, property, dependency);
};

/**
 * Inject a set of dependencies.
 * @param {Object} object - The object.
 * @param {Object<*>} dependencies - The dependencies indexed by property name.
 * @param {boolean} validate - Whether or not to validate dependencies.
 * @returns {*} The injected object.
 * @throws {Error} On validation failure.
 */
exports.injectSet = function injectSet(object, dependencies, validate) {
  return injector.injectSet(object, dependencies, validate);
};

/**
 * Validate dependencies.
 * @param {Object} object - The object.
 * @throws {Error} On validation failure.
 */
exports.validate = function validate(object) {
  return injector.validate(object);
};

/**
 * Create a dependency injection container.
 * @param {Object} options - The creation options.
 */
exports.createContainer = function createContainer(options) {
  const container = new Container(options);

  container.injector = injector;
  container.validator = felv;
  container.dependencySorter = dependencySorter;
  container.referenceResolver = referenceResolver;
  container.serviceInstantiator = serviceInstantiator;
  container.setDefinitionFactory('registry', registryDefinitionFactory);
  container.setDefinitionFactory('service', serviceDefinitionFactory);

  return container;
};
