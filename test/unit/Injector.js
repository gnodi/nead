'use strict';

const expect = require('../expect');
const Injector = require('../../src/Injector');

const validator = require('../fixtures/validator');
const propertyInjectionDefiner = require('../fixtures/propertyInjectionDefiner');

const injector = new Injector();

describe('Injector', () => {
  describe('"validator" setter', () => {
    it('should accept a validator', () => {
      injector.validator = validator;
    });

    it('should only accept a validator', () => {
      expect(() => { injector.validator = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"setInjectionDefiner" method', () => {
    it('should set an injection definer', () => {
      injector.setInjectionDefiner('property', propertyInjectionDefiner);
    });

    it('should only accept a name as first argument', () => {
      expect(() => { injector.setInjectionDefiner(1, propertyInjectionDefiner); }).to.throw(TypeError);
    });

    it('should only accept an injection definer as second argument', () => {
      expect(() => { injector.setInjectionDefiner('property', 'bar'); }).to.throw(TypeError);
    });
  });

  describe('"inject" method', () => {
    it('should inject a dependency to an object', () => {
      const injectedObject = injector.inject(
        {},
        'foo',
        'bar'
      );

      expect(injectedObject.foo).to.equal('bar');
    });

    it('should be immutable for the original object', () => {
      const originalObject = {
        f: function() {
          return this.foo || 'foo';
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      expect(originalObject.f()).to.equal('foo');
      expect(injectedObject.f()).to.equal('bar');
    });

    it('should use needed dependencies definition', () => {
      const originalObject = {
        need: {
          foo: {
            property: true
          }
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject._foo).to.equal('bar');
    });
  });
});
