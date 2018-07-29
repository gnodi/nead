'use strict';

const expect = require('../../expect');
const FactoryProxyInjector = require('../../../src/proxy-injectors/Factory');
const BadTypeError = require('../../../src/errors/BadType');

const factory = require('../../fixtures/factory');
const valueWrapper = require('../../fixtures/valueValidationWrapper');

const proxyInjector = new FactoryProxyInjector();

class Foo {}

describe('FactoryProxyInjector', () => {
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
      factory.init(Foo);
      const values = proxyInjector.getValues(factory);

      expect(values.length).to.equal(1);
      expect(values[0]).to.be.an.instanceOf(Foo);
    });

    it('should check proxy type', () => {
      expect(() => proxyInjector.getValues('foo')).to.throw(
        BadTypeError,
        'Expected a factory, got string instead'
      );
    });
  });

  describe('"getPrototype" method', () => {
    it('should return a new object prototype', () => {
      const prototype = proxyInjector.getPrototype(factory);

      expect(prototype).to.equal(factory);
    });
  });
});
