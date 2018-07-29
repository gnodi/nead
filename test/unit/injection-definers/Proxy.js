'use strict';

const expect = require('../../expect');
const ProxyInjectionDefiner = require('../../../src/injection-definers/Proxy');
const BadTypeError = require('../../../src/errors/BadType');

const directProxyInjector = require('../../fixtures/directProxyInjector');
const prefixProxyInjector = require('../../fixtures/prefixProxyInjector');
const suffixProxyInjector = require('../../fixtures/suffixProxyInjector');

const injectionDefiner = new ProxyInjectionDefiner();

function expected(type, values) {
  return `${type}-${values.join('.')}`;
}

describe('ProxyInjectionDefiner', () => {
  describe('"setProxy" method', () => {
    it('should set a proxy injector', () => {
      injectionDefiner.setProxy('direct', directProxyInjector);
      injectionDefiner.setProxy('prefix', prefixProxyInjector);
      injectionDefiner.setProxy('suffix', suffixProxyInjector);
    });

    it('should only accept a name as first argument', () => {
      expect(
        () => { injectionDefiner.setProxy(1, prefixProxyInjector); }
      ).to.throw(BadTypeError);
    });

    it('should only accept an injection definer as second argument', () => {
      expect(
        () => { injectionDefiner.setProxy('property', 'bar'); }
      ).to.throw(BadTypeError);
    });
  });

  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.have.property('type', 'string');
      expect(injectionDefiner.schema).to.have.property('validate').that.is.a('function');
      const validate = injectionDefiner.schema.validate;
      expect(validate('prefix', expected)).to.equal('prefix');
      expect(validate('dumb', expected)).to.equal('proxy injector key-direct.prefix.suffix');
    });
  });

  describe('"getValues" method', () => {
    it('should return proxyfied values to validate', () => {
      const values = injectionDefiner.getValues(['foo', 'bar'], 'prefix');

      expect(values).to.deep.equal(['..foo', '...foo', '..bar', '...bar']);
    });
  });

  describe('"validate" method', () => {
    it('should return input value', () => {
      const value = {};
      const validatedValue = injectionDefiner.validate(value, {});

      expect(value).to.equal(validatedValue);
    });
  });

  describe('"getValidatedDependency" method', () => {
    it('should return new validated proxy value', () => {
      const value = 'plop';
      const validatedValues = [
        '..plop',
        {isWrappedValue: true, setValidatedValue: proxy => proxy.push('....plop')}
      ];
      const validatedDependency = injectionDefiner.getValidatedDependency(value, validatedValues, 'prefix');

      expect(validatedDependency).to.deep.equal(['....plop']);
    });

    it('should handle direct value proxies', () => {
      const value = 'plop';
      const validatedValues = [
        'plip'
      ];
      const validatedDependency = injectionDefiner.getValidatedDependency(value, validatedValues, 'direct');

      expect(validatedDependency).to.deep.equal('plip');
    });
  });
});
