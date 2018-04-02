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
});
