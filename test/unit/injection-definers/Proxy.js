'use strict';

const expect = require('../../expect');
const ProxyInjectionDefiner = require('../../../src/injection-definers/Proxy');

const prefixProxyInjector = require('../../fixtures/prefixProxyInjector');
const suffixProxyInjector = require('../../fixtures/suffixProxyInjector');

const injectionDefiner = new ProxyInjectionDefiner();

function expected(type, values) {
  return `${type}-${values.join('.')}`;
}

describe('ProxyInjectionDefiner', () => {
  describe('"setProxy" method', () => {
    it('should set a proxy injector', () => {
      injectionDefiner.setProxy('prefix', prefixProxyInjector);
      injectionDefiner.setProxy('suffix', suffixProxyInjector);
    });

    it('should only accept a name as first argument', () => {
      expect(
        () => { injectionDefiner.setProxy(1, prefixProxyInjector); }
      ).to.throw(TypeError);
    });

    it('should only accept an injection definer as second argument', () => {
      expect(
        () => { injectionDefiner.setProxy('property', 'bar'); }
      ).to.throw(TypeError);
    });
  });

  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.have.property('type', 'string');
      expect(injectionDefiner.schema).to.have.property('validate').that.is.a('function');
      const validate = injectionDefiner.schema.validate;
      expect(validate('prefix', expected)).to.equal('prefix');
      expect(validate('dumb', expected)).to.equal('proxy injector key-prefix.suffix');
    });
  });

  describe('"getValues" method', () => {
    it('should return proxyfied values to validate', () => {
      const values = injectionDefiner.getValues(['foo', 'bar'], 'prefix');

      expect(values).to.deep.equal(['..foo', '...foo', '..bar', '...bar']);
    });

    it('should return original values on no defined proxy', () => {
      const values = injectionDefiner.getValues(['foo', 'bar'], false);

      expect(values).to.deep.equal(['foo', 'bar']);
    });
  });
});
