'use strict';

const expect = require('../../expect');
const DirectProxyInjector = require('../../../src/proxy-injectors/Direct');

const proxyInjector = new DirectProxyInjector();

describe('DirectProxyInjector', () => {
  describe('"getValues" method', () => {
    it('should return proxy as value', () => {
      const value = {foo: 'bar'};
      const values = proxyInjector.getValues([value]);

      expect(values.length).to.equal(1);
      expect(values[0]).to.equal(value);
    });
  });

  describe('"getPrototype" method', () => {
    it('should return original value', () => {
      const value = {};
      const prototype = proxyInjector.getPrototype(value);

      expect(prototype).to.equal(null);
    });
  });
});
