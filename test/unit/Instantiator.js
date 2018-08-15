'use strict';

const expect = require('../expect');
const Instantiator = require('../../src/Instantiator');

const instantiator = new Instantiator();

describe('Instantiator', () => {
  describe('"instantiate" method', () => {
    it('should instantiate a service from an object', () => {
      const prototype = {foo: 'bar'};
      const instance = instantiator.instantiate(prototype);

      expect(instance.foo).to.equal('bar');
      expect(Object.getPrototypeOf(instance)).to.equal(prototype);
    });

    it('should instantiate a service from a constructor', () => {
      class Class {
        get foo() { return 'bar'; }
      }
      const instance = instantiator.instantiate(Class);

      expect(instance.foo).to.equal('bar');
      expect(Object.getPrototypeOf(instance)).to.equal(Class.prototype);
    });

    it('should instantiate a service from a singleton', () => {
      const singleton = {foo: 'bar'};
      const instance = instantiator.instantiate(singleton, true);

      expect(instance.foo).to.equal('bar');
      expect(instance).to.equal(singleton);
    });

    it('should handle function service', () => {
      function foo() {
        return 'bar';
      }
      const instance = instantiator.instantiate(foo, true);

      expect(instance()).to.equal('bar');
      expect(instance).to.equal(foo);
    });
  });
});
