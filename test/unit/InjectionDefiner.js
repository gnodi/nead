'use strict';

// Force tests execution order.
require('./errors/MissingImplementation');

const expect = require('../expect');
const InjectionDefiner = require('../../src/InjectionDefiner');
const BadDependencyError = require('../../src/errors/BadDependency');
const MissingDependencyError = require('../../src/errors/MissingDependency');

const injectionDefiner = new InjectionDefiner();

describe('InjectionDefiner', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.deep.equal({});
    });
  });

  describe('"getTargetProperty" method', () => {
    it('should retrieve original property name', () => {
      const propertyName = injectionDefiner.getTargetProperty(
        'foo',
        'bar'
      );

      expect(propertyName).to.equal('foo');
    });
  });

  describe('"getValues" method', () => {
    it('should return not altered input values', () => {
      const values = [1, 2, 3];
      const injectedValues = injectionDefiner.getValues(values, {});

      expect(injectedValues).to.equal(values);
    });
  });

  describe('"validate" method', () => {
    it('should return input value', () => {
      const value = {};
      const validatedValue = injectionDefiner.validate(value, {});

      expect(value).to.equal(validatedValue);
    });
  });

  describe('"getValidatedDependency" method', () => {
    it('should return original value', () => {
      const value = {};
      const changeMap = new Map();
      changeMap.set(value, {foo: 'bar'});
      const validatedValue = injectionDefiner.getValidatedDependency(value, changeMap);

      expect(value).to.equal(validatedValue);
    });
  });

  describe('"InjectionDefiner.throwBadDependencyError" method', () => {
    it('should help to throw a bad dependency error', () => {
      expect(() => injectionDefiner[InjectionDefiner.throwBadDependencyError]()).to.throw(
        BadDependencyError
      );
    });
  });

  describe('"InjectionDefiner.throwMissingDependencyError" method', () => {
    it('should help to throw a missing dependency error', () => {
      expect(() => injectionDefiner[InjectionDefiner.throwMissingDependencyError]()).to.throw(
        MissingDependencyError
      );
    });
  });
});
