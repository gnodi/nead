'use strict';

const expect = require('../../expect');
const ListProxyInjector = require('../../../src/proxy-injectors/List');
const BadTypeError = require('../../../src/errors/BadType');

const valueWrapper = require('../../fixtures/valueValidationWrapper');

const proxyInjector = new ListProxyInjector();

describe('ListProxyInjector', () => {
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
      const values = proxyInjector.getValues(['foo', 'bar']);
      const proxy = [];

      expect(values.map(({value}) => value)).to.deep.equal(['foo', 'bar']);

      values[0].setValidatedValue(proxy);
      expect(proxy).to.deep.equal(['foo']);
    });

    it('should check proxy type', () => {
      expect(() => proxyInjector.getValues('foo')).to.throw(
        BadTypeError,
        'Expected an array, got string instead'
      );
    });
  });

  describe('"getPrototype" method', () => {
    it('should return an empty array', () => {
      const list = ['foo', 'bar'];
      const prototype = proxyInjector.getPrototype(list);

      expect(prototype).to.not.equal(list);
      expect(prototype.length).to.equal(0);
    });
  });
});
