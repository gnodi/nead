'use strict';

const expect = require('../../expect');
const PropertyInjectionDefiner = require('../../../src/injection-definers/Property');

const injectionDefiner = new PropertyInjectionDefiner();

describe('PropertyInjectionDefiner', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.deep.equal({type: 'string', required: false});
    });
  });

  describe('"getTargetProperty" method', () => {
    it('should retrieve defined target property', () => {
      const propertyName = injectionDefiner.getTargetProperty(
        'foo',
        'bar'
      );

      expect(propertyName).to.equal('bar');
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
});
