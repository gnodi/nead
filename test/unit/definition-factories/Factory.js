'use strict';

const expect = require('../../expect');
const FactoryDefinitionFactory = require('../../../src/definition-factories/Factory');
const BadTypeError = require('../../../src/errors/BadType');

const functionSerializer = require('../../fixtures/functionSerializer');

const definitionFactory = new FactoryDefinitionFactory();
const factoryObject = {
  create: true,
  setObjectPrototype: true,
  getObjectPrototype: true,
  setDependency: true
};
class Factory {
  constructor() {
    this.dependencies = {};
    this.proto = {};
  }
  create(dependencies) {
    return Object.assign(
      {},
      this.getObjectPrototype(),
      this.dependencies,
      dependencies
    );
  }
  setObjectPrototype(value) { this.proto = value; }
  getObjectPrototype() { return this.proto; }
  setDependency(key, dependency) { this.dependencies[key] = dependency; }
}
class Random {
}

describe('FactoryDefinitionFactory', () => {
  describe('"factoryObject" setter', () => {
    it('should accept a factory class', () => {
      definitionFactory.factoryObject = Factory;
    });

    it('should accept a factory object', () => {
      definitionFactory.factoryObject = factoryObject;
    });

    it('should only accept a factory class or object', () => {
      expect(() => { definitionFactory.factoryObject = Random; }).to.throw(BadTypeError);
      expect(() => { definitionFactory.factoryObject = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"schema" getter', () => {
    it('should retrieve validation schema for creation options', () => {
      expect(definitionFactory.schema).to.deep.equal({
        object: {
          type: [Function, Object],
          required: true
        },
        dependencies: {
          type: Object,
          default: {}
        }
      });
    });
  });

  describe('"create" method', () => {
    it('should create items and factory definitions', () => {
      const definitions = definitionFactory.create('factory', {
        object: {plup: 'plup'},
        dependencies: {
          foo: {plop: 1},
          bar: {plip: 2},
          foobar: '#plap'
        }
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'factory',
          object: {
            create: true,
            setObjectPrototype: true,
            getObjectPrototype: true,
            setDependency: true
          },
          dependencies: {
            dependencies: {
              injectedValue: {
                foo: {plop: 1},
                bar: {plip: 2},
                foobar: '#plap'
              },
              injectDependency: 'function'
            },
            prototype: {
              injectedValue: {plup: 'plup'},
              injectDependency: 'function'
            }
          }
        }
      ]);

      const injectedFactory = new Factory();
      const injectedDependencies = definitions[0].dependencies.dependencies.injectedValue;
      definitions[0].dependencies.dependencies.injectDependency(
        injectedFactory,
        injectedDependencies
      );
      expect(injectedFactory.create({plep: 'plep'})).to.deep.equal({
        plep: 'plep',
        foo: {plop: 1},
        bar: {plip: 2},
        foobar: '#plap'
      });
      const injectedPrototype = definitions[0].dependencies.prototype.injectedValue;
      definitions[0].dependencies.prototype.injectDependency(
        injectedFactory,
        injectedPrototype
      );
      expect(injectedFactory.getObjectPrototype()).to.deep.equal({plup: 'plup'});
    });
  });
});
