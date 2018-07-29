'use strict';

const expect = require('../../expect');
const ValueInjectionDefiner = require('../../../src/injection-definers/Value');
const BadDependencyError = require('../../../src/errors/BadDependency');
const BadTypeError = require('../../../src/errors/BadType');

const validator = require('../../fixtures/validator');

const injectionDefiner = new ValueInjectionDefiner();

describe('ValueInjectionDefiner', () => {
  describe('"validator" setter', () => {
    it('should accept a validator', () => {
      injectionDefiner.validator = validator;
    });

    it('should only accept a validator', () => {
      expect(() => { injectionDefiner.validator = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.deep.equal({type: 'object', required: false});
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
    it('should return a validated value', () => {
      const validatedValue = injectionDefiner.validate('foo', {
        type: 'string',
        default: 'foo'
      });

      expect(validatedValue).to.equal('foo');
    });

    it('should failed on bad value', () => {
      expect(() => injectionDefiner.validate(1, {type: 'string'}))
        .to.throw(BadDependencyError);
    });

    it('should not throw an error on null value', () => {
      const validatedValue = injectionDefiner.validate(null, {
        type: 'string'
      });

      expect(validatedValue).to.equal(null);
    });

    it('should not throw an error on undefined value', () => {
      const validatedValue = injectionDefiner.validate(null, {
        type: 'string'
      });

      expect(validatedValue).to.equal(null);
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
