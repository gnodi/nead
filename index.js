'use strict';

const felv = require('felv');
const Injector = require('./src/Injector');
const PropertyInjectionDefiner = require('./src/injection-definers/Property');
const OptionalValidationProcessor = require('./src/validation-processors/Optional');

const propertyInjectionDefiner = new PropertyInjectionDefiner();

const optionalValidationProcessor = new OptionalValidationProcessor();

const injector = new Injector();
injector.validator = felv;
injector.setInjectionDefiner('property', propertyInjectionDefiner);
injector.setValidationProcessor('optional', optionalValidationProcessor);

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
