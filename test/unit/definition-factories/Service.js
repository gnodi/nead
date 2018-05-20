'use strict';

const expect = require('../../expect');
const ServiceDefinitionFactory = require('../../../src/definition-factories/Service');

const definitionFactory = new ServiceDefinitionFactory();

describe('ServiceDefinitionFactory', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for creation options', () => {
      expect(definitionFactory.schema).to.deep.equal({
        object: {
          required: true
        },
        singleton: {
          type: 'boolean',
          default: false
        },
        dependencies: {
          type: 'object',
          default: {}
        }
      });
    });
  });

  describe('"create" method', () => {
    it('should create service definition', () => {
      const definitions = definitionFactory.create('foo', {
        object: {bar: 1},
        singleton: true,
        dependencies: {
          plop: 'plip'
        }
      });

      expect(definitions).to.deep.equal([
        {
          key: 'foo',
          object: {bar: 1},
          singleton: true,
          dependencies: {
            plop: 'plip'
          }
        }
      ]);
    });
  });
});
