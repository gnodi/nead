'use strict';

const expect = require('../../expect');
const RegistryDefinitionFactory = require('../../../src/definition-factories/Registry');
const BadTypeError = require('../../../src/errors/BadType');

const functionSerializer = require('../../fixtures/functionSerializer');

const definitionFactory = new RegistryDefinitionFactory();
const registryObject = {
  setType: true,
  get: true,
  set: true,
  getList: true,
  getMap: true
};
class Registry {
  constructor() {
    this.items = {};
  }
  setType(value) { this.type = value; }
  getType() { return this.type; }
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
      expect(definitionFactory.schema).to.deep.equal({
        type: {type: 'string', required: false},
        items: {type: Object}
      });
    });
  });

  describe('"create" method', () => {
    it('should create items and registry definitions', () => {
      const definitions = definitionFactory.create('items', {
        type: 'element',
        items: {
          foo: {plop: 1},
          bar: {plip: 2},
          foobar: '#plap'
        }
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'items',
          object: {
            setType: true,
            get: true,
            set: true,
            getList: true,
            getMap: true
          },
          dependencies: {
            type: {
              injectedValue: 'element',
              injectDependency: 'function'
            },
            items: {
              injectedValue: {
                foo: {plop: 1},
                bar: {plip: 2},
                foobar: '#plap'
              },
              injectDependency: 'function'
            }
          }
        }
      ]);

      const injectedRegistry = new Registry();
      const injectedType = definitions[0].dependencies.type.injectedValue;
      definitions[0].dependencies.type.injectDependency(
        injectedRegistry,
        injectedType
      );
      expect(injectedRegistry.getType()).to.equal('element');
      const injectedItems = definitions[0].dependencies.items.injectedValue;
      definitions[0].dependencies.items.injectDependency(
        injectedRegistry,
        injectedItems
      );
      expect(injectedRegistry.get('foobar')).to.deep.equal('#plap');
    });

    it('should automatically generate item type from service key when no type is specified', () => {
      const definitions = definitionFactory.create('superIncredibleObjectRegistry', {
        items: {
          foo: {plop: 1},
          bar: {plip: 2},
          foobar: '#plap'
        }
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'superIncredibleObjectRegistry',
          object: {
            setType: true,
            get: true,
            set: true,
            getList: true,
            getMap: true
          },
          dependencies: {
            type: {
              injectedValue: 'super incredible object',
              injectDependency: 'function'
            },
            items: {
              injectedValue: {
                foo: {plop: 1},
                bar: {plip: 2},
                foobar: '#plap'
              },
              injectDependency: 'function'
            }
          }
        }
      ]);
    });
  });
});
