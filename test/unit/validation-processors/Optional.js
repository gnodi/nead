'use strict';

const expect = require('../../expect');
const OptionalValidationProcessor = require('../../../src/validation-processors/Optional');
const MissingDependencyError = require('../../../src/errors/MissingDependency');

const validationProcessor = new OptionalValidationProcessor();

describe('OptionalValidationProcessor', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(validationProcessor.schema).to.deep.equal({type: 'boolean', default: false});
    });
  });

  describe('"getValues" method', () => {
    it('should return values to validate', () => {
      const values = validationProcessor.getValues(['foo', 'bar'], true);

      expect(values).to.deep.equal(['foo', 'bar']);
    });

    it('should throw a missing dependency error on missing dependency', () => {
      expect(() => validationProcessor.getValues([], false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should throw a missing dependency error on null dependency', () => {
      expect(() => validationProcessor.getValues([null], false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should throw a missing dependency error on undefined dependency', () => {
      expect(() => validationProcessor.getValues([undefined], false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should not throw an error on defined but falsy value', () => {
      const values = validationProcessor.getValues([''], false);

      expect(values).to.deep.equal(['']);
    });

    it('should not throw an error on authoriezd optional value', () => {
      expect(() => validationProcessor.getValues([], true)).to.not.throw(Error);
    });
  });
});
