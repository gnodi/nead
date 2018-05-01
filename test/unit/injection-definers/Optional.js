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
    it('should return values to validate', () => {
      const values = injectionDefiner.getValues(['foo', 'bar'], true);

      expect(values).to.deep.equal(['foo', 'bar']);
    });

    it('should throw a missing dependency error on missing dependency', () => {
      expect(() => injectionDefiner.getValues([], false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should throw a missing dependency error on null dependency', () => {
      expect(() => injectionDefiner.getValues([null], false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should throw a missing dependency error on undefined dependency', () => {
      expect(() => injectionDefiner.getValues([undefined], false)).to.throw(
        MissingDependencyError,
        'Dependency has not been injected'
      );
    });

    it('should not throw an error on defined but falsy value', () => {
      const values = injectionDefiner.getValues([''], false);

      expect(values).to.deep.equal(['']);
    });

    it('should not throw an error on authoriezd optional value', () => {
      expect(() => injectionDefiner.getValues([], true)).to.not.throw(Error);
    });
  });
});
