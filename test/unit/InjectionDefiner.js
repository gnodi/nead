'use strict';

const expect = require('../expect');
const InjectionDefiner = require('../../src/InjectionDefiner');

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

  describe('"validate" method', () => {
    it('should throw a missing implementation error', () => {
      expect(() => injectionDefiner.validate('foo', {})).to.throw(
        Error,
        '\'validate\' method must be implemented'
      );
    });
  });
});
