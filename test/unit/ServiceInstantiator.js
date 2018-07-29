'use strict';

const expect = require('../expect');
const ServiceInstantiator = require('../../src/ServiceInstantiator');

const serviceInstantiator = new ServiceInstantiator();

describe('ServiceInstantiator', () => {
  describe('"instantiate" method', () => {
    it('should instantiate a service from an object', () => {
      const prototype = {foo: 'bar'};
      const instance = serviceInstantiator.instantiate(prototype);

      expect(instance.foo).to.equal('bar');
      expect(Object.getPrototypeOf(instance)).to.equal(prototype);
    });

    it('should instantiate a service from a constructor', () => {
      class Class {
        get foo() { return 'bar'; }
      }
      const instance = serviceInstantiator.instantiate(Class);

      expect(instance.foo).to.equal('bar');
      expect(Object.getPrototypeOf(instance)).to.equal(Class.prototype);
    });

    it('should instantiate a service from a singleton', () => {
      const singleton = {foo: 'bar'};
      const instance = serviceInstantiator.instantiate(singleton, true);

      expect(instance.foo).to.equal('bar');
      expect(instance).to.equal(singleton);
    });

    it('should handle function service', () => {
      function foo() {
        return 'bar';
      }
      const instance = serviceInstantiator.instantiate(foo, true);

      expect(instance()).to.equal('bar');
      expect(instance).to.equal(foo);
    });
  });
});
