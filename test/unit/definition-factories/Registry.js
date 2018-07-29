'use strict';

const expect = require('../../expect');
const RegistryDefinitionFactory = require('../../../src/definition-factories/Registry');
const BadTypeError = require('../../../src/errors/BadType');

const functionSerializer = require('../../fixtures/functionSerializer');

const definitionFactory = new RegistryDefinitionFactory();
const registryObject = {
  get: true,
  set: true,
  getList: true,
  getMap: true
};
class Registry {
  constructor() {
    this.items = {};
  }
  get(key) { return this.items[key]; }
  set(key, value) { this.items[key] = value; }
  getList() {}
  getMap() {}
}
class Random {
}

describe('RegistryDefinitionFactory', () => {
  describe('"registryObject" setter', () => {
    it('should accept a registry class', () => {
      definitionFactory.registryObject = Registry;
    });

    it('should accept a registry object', () => {
      definitionFactory.registryObject = registryObject;
    });

    it('should only accept a registry class or object', () => {
      expect(() => { definitionFactory.registryObject = Random; }).to.throw(BadTypeError);
      expect(() => { definitionFactory.registryObject = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"schema" getter', () => {
    it('should retrieve validation schema for creation options', () => {
      expect(definitionFactory.schema).to.deep.equal({items: {type: Object}});
    });
  });

  describe('"create" method', () => {
    it('should create items and registry definitions', () => {
      const definitions = definitionFactory.create('items', {
        items: {
          foo: {plop: 1},
          bar: {plip: 2},
          foobar: '#plap'
        }
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'items.foo',
          object: {plop: 1}
        },
        {
          key: 'items.bar',
          object: {plip: 2}
        },
        {
          key: 'items.foobar',
          object: '#plap'
        },
        {
          key: 'items',
          object: {
            get: true,
            set: true,
            getList: true,
            getMap: true
          },
          dependencies: {
            items: {
              injectedValue: {
                foo: '#items.foo',
                bar: '#items.bar',
                foobar: '#items.foobar'
              },
              injectDependency: 'function'
            }
          }
        }
      ]);
      const injectedValue = definitions[3].dependencies.items.injectedValue;
      const injectedRegistry = new Registry();
      definitions[3].dependencies.items.injectDependency(injectedRegistry, injectedValue);
      expect(injectedRegistry.get('bar')).to.deep.equal('#items.bar');
    });
  });
});
