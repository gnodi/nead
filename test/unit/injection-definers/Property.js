'use strict';

const expect = require('../../expect');
const PropertyInjectionDefiner = require('../../../src/injection-definers/Property');

const injectionDefiner = new PropertyInjectionDefiner();

describe('PropertyInjectionDefiner', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.deep.equal({type: 'string'});
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

    it('should retrieve original property name on no defined target property', () => {
      const propertyName = injectionDefiner.getTargetProperty(
        'foo'
      );

      expect(propertyName).to.equal('foo');
    });
  });
});
