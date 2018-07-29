'use strict';

const expect = require('../../expect');
const OptionalInjectionDefiner = require('../../../src/injection-definers/Optional');
const MissingDependencyError = require('../../../src/errors/MissingDependency');

const injectionDefiner = new OptionalInjectionDefiner();

describe('OptionalInjectionDefiner', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.deep.equal({type: 'boolean', default: false});
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
    it('should return input value', () => {
      const value = {};
      const validatedValues = ['foo'];
      const validatedDependency = injectionDefiner.getValidatedDependency(
        value,
        validatedValues,
        false
      );

      expect(validatedDependency).to.equal(value);
    });

    it('should throw a missing dependency error on null dependency', () => {
      const value = null;
      const validatedValues = [null];

      expect(() => injectionDefiner.getValidatedDependency(value, validatedValues, false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should throw a missing dependency error on undefined dependency', () => {
      const value = undefined;
      const validatedValues = [];

      expect(
        () => injectionDefiner.getValidatedDependency(value, validatedValues, false)
      ).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should not throw a missing dependency error on not null validated dependency', () => {
      const value = null;
      const validatedValues = ['foo'];

      expect(
        () => injectionDefiner.getValidatedDependency(value, validatedValues, false)
      ).to.not.throw(Error);
    });

    it('should not throw an error on multiple null and undefined validated values', () => {
      const value = undefined;
      const validatedValues = ['null', 'undefined'];

      expect(
        () => injectionDefiner.getValidatedDependency(value, validatedValues, true)
      ).to.not.throw(Error);
    });

    it('should not throw an error on defined but falsy value', () => {
      const validatedValues = [false];

      expect(
        () => injectionDefiner.getValidatedDependency('', validatedValues, false)
      ).to.not.throw(Error);
    });

    it('should not throw an error on authorized optional value', () => {
      const value = undefined;
      const validatedValues = [];

      expect(
        () => injectionDefiner.getValidatedDependency(value, validatedValues, true)
      ).to.not.throw(Error);
    });
  });
});
