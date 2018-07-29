'use strict';

const expect = require('../../expect');
const RegistryDefinitionFactory = require('../../../src/definition-factories/Registry');

const definitionFactory = new RegistryDefinitionFactory();
const registryObject = {get: true};
class Registry {
  get() {}
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
      expect(() => { definitionFactory.registryObject = Random; }).to.throw(TypeError);
      expect(() => { definitionFactory.registryObject = 'foo'; }).to.throw(TypeError);
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
          bar: {plip: 2}
        }
      });

      expect(definitions).to.deep.equal([
        {
          key: 'items.foo',
          object: {plop: 1}
        },
        {
          key: 'items.bar',
          object: {plip: 2}
        },
        {
          key: 'items',
          object: {get: true},
          dependencies: {
            items: {
              foo: '#items.foo',
              bar: '#items.bar'
            }
          }
        }
      ]);
    });
  });
});