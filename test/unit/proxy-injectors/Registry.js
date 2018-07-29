'use strict';

const expect = require('../../expect');
const RegistryProxyInjector = require('../../../src/proxy-injectors/Registry');
const BadTypeError = require('../../../src/errors/BadType');

const registry = require('../../fixtures/registry');
const valueWrapper = require('../../fixtures/valueValidationWrapper');

function Registry() {
  this.items = {};
}
Registry.prototype = Object.create(registry);
Registry.prototype.constructor = Registry;

const proxyInjector = new RegistryProxyInjector();

describe('RegistryProxyInjector', () => {
  describe('"valueWrapper" setter', () => {
    it('should accept a value wrapper', () => {
      proxyInjector.valueWrapper = valueWrapper;
    });

    it('should only accept a value wrapper', () => {
      expect(() => { proxyInjector.valueWrapper = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"getValues" method', () => {
    it('should retrieve proxyfied values', () => {
      registry.init();
      registry.set('foo', 'bar');
      registry.set('bar', 'foo');
      const values = proxyInjector.getValues(registry);

      expect(values.map(({value}) => value)).to.deep.equal(['bar', 'foo']);

      registry.init();
      values[0].setValidatedValue(registry);
      expect(registry.getMap()).to.deep.equal({foo: 'bar'});
    });

    it('should check proxy type', () => {
      expect(() => proxyInjector.getValues('foo')).to.throw(
        BadTypeError,
        'Expected a registry, got string instead'
      );
    });
  });

  describe('"getPrototype" method', () => {
    it('should return an empty registry', () => {
      registry.init();
      registry.set('foo', 'bar');
      registry.set('bar', 'foo');

      expect(registry.getMap()).to.deep.equal({foo: 'bar', bar: 'foo'});

      const prototype = proxyInjector.getPrototype(registry);
      prototype.init();

      expect(prototype.getMap()).to.deep.equal({});
      expect(registry.getMap()).to.deep.equal({foo: 'bar', bar: 'foo'});
    });

    it('should handle registry class', () => {
      const registryInstance = new Registry();
      registryInstance.init();
      registryInstance.set('foo', 'bar');
      registryInstance.set('bar', 'foo');

      expect(registryInstance.getMap()).to.deep.equal({foo: 'bar', bar: 'foo'});

      const prototype = proxyInjector.getPrototype(registryInstance);
      prototype.init();

      expect(prototype.getMap()).to.deep.equal({});
      expect(registryInstance.getMap()).to.deep.equal({foo: 'bar', bar: 'foo'});
    });
  });
});
