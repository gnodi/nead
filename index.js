'use strict';

const felv = require('felv');
const Container = require('./src/Container');
const Injector = require('./src/Injector');
const OptionalInjectionDefiner = require('./src/injection-definers/Optional');
const PropertyInjectionDefiner = require('./src/injection-definers/Property');
const RegistryDefinitionFactory = require('./src/definition-factories/Registry');
const ServiceDefinitionFactory = require('./src/definition-factories/Service');

const optionalInjectionDefiner = new OptionalInjectionDefiner();
const propertyInjectionDefiner = new PropertyInjectionDefiner();

const registryDefinitionFactory = new RegistryDefinitionFactory();
const serviceDefinitionFactory = new ServiceDefinitionFactory();

const injector = new Injector();
injector.validator = felv;
injector.setInjectionDefiner('optional', optionalInjectionDefiner);
injector.setInjectionDefiner('property', propertyInjectionDefiner);

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
  return injector.inject(object);
};

/**
 * Create a dependency injection container.
 * @param {Object} options - The creation options.
 */
exports.createContainer = function createContainer(options) {
  const container = new Container(options);

  container.validator = felv;
  container.setDefinitionFactory('registry', registryDefinitionFactory);
  container.setDefinitionFactory('service', serviceDefinitionFactory);

  return container;
};
