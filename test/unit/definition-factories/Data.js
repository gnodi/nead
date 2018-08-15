'use strict';

const expect = require('../../expect');
const DataDefinitionFactory = require('../../../src/definition-factories/Data');

const definitionFactory = new DataDefinitionFactory();

describe('DataDefinitionFactory', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for creation options', () => {
      expect(definitionFactory.schema).to.deep.equal({
        data: {type: Object},
        schema: {type: Object, default: {}}
      });
    });
  });

  describe('"create" method', () => {
    it('should create data and sub data definition', () => {
      const definitions = definitionFactory.create('config', {
        data: {
          foo: 'bar',
          plop: {
            plip: {
              plup: 'plap'
            }
          }
        },
        schema: {}
      });

      expect(definitions).to.deep.equal([
        {
          key: 'config',
          singleton: true,
          object: {
            foo: 'bar',
            plop: {
              plip: {
                plup: 'plap'
              }
            }
          },
          need: {}
        }
      ]);
    });

    it('should handle schema validation of the data', () => {
      const definitions = definitionFactory.create('config', {
        data: {
          foo: 'bar'
        },
        schema: {
          foo: {
            type: 'string'
          }
        }
      });

      expect(definitions).to.deep.equal([
        {
          key: 'config',
          singleton: true,
          object: {
            foo: 'bar'
          },
          need: {
            foo: {
              value: {
                type: 'string'
              }
            }
          }
        }
      ]);
    });
  });
});
