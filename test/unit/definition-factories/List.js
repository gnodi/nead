'use strict';

const expect = require('../../expect');
const ListDefinitionFactory = require('../../../src/definition-factories/List');

const functionSerializer = require('../../fixtures/functionSerializer');

const definitionFactory = new ListDefinitionFactory();

describe('ListDefinitionFactory', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for creation options', () => {
      expect(definitionFactory.schema).to.deep.equal({items: {type: [Array, Object]}});
    });
  });

  describe('"create" method', () => {
    it('should create list definition', () => {
      const definitions = definitionFactory.create('items', {
        items: ['foo', '#bar']
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'items',
          singleton: true,
          object: [],
          dependencies: {
            items: {
              injectedValue: ['foo', '#bar'],
              injectDependency: 'function'
            }
          }
        }
      ]);
    });

    it('should create list definition from an item object', () => {
      const definitions = definitionFactory.create('items', {
        items: {
          foo: '#bar',
          plop: 'plip'
        }
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'items',
          singleton: true,
          object: [],
          dependencies: {
            items: {
              injectedValue: ['#bar', 'plip'],
              injectDependency: 'function'
            }
          }
        }
      ]);
      const injectedValue = definitions[0].dependencies.items.injectedValue;
      const injectedList = [];
      definitions[0].dependencies.items.injectDependency(injectedList, injectedValue);
      expect(injectedList).to.deep.equal(['#bar', 'plip']);
      expect(injectedValue).to.deep.equal(['#bar', 'plip']);
      expect(injectedList).to.not.equal(injectedValue);
    });
  });
});
