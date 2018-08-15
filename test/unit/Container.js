'use strict';

// Force tests execution order.
require('./errors/BadType');
require('./errors/NotDefinedDefinitionFactory');
require('./errors/NotInstantiatedService');

const expect = require('../expect');
const Container = require('../../src/Container');
const BadTypeError = require('../../src/errors/BadType');
const NotDefinedDefinitionFactoryError = require('../../src/errors/NotDefinedDefinitionFactory');
const NotInstantiatedServiceError = require('../../src/errors/NotInstantiatedService');

const injector = require('../fixtures/injector');
const validator = require('../fixtures/validator');
const dependencySorter = require('../fixtures/dependencySorter');
const referenceResolver = require('../fixtures/referenceResolver');
const instantiator = require('../fixtures/instantiator');
const serviceDefinitionFactory = require('../fixtures/serviceDefinitionFactory');

const container = new Container();

describe('Container', () => {
  describe('"injector" setter', () => {
    it('should accept an injector', () => {
      container.injector = injector;
    });

    it('should only accept an injector', () => {
      expect(() => { container.injector = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"validator" setter', () => {
    it('should accept a validator', () => {
      container.validator = validator;
    });

    it('should only accept a validator', () => {
      expect(() => { container.validator = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"dependencySorter" setter', () => {
    it('should accept a dependency sorter', () => {
      container.dependencySorter = dependencySorter;
    });

    it('should only accept a dependency sorter', () => {
      expect(() => { container.dependencySorter = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"referenceResolver" setter', () => {
    it('should accept a reference resolver', () => {
      container.referenceResolver = referenceResolver;
    });

    it('should only accept a reference resolver', () => {
      expect(() => { container.referenceResolver = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"instantiator" setter', () => {
    it('should accept a service instantiator', () => {
      container.instantiator = instantiator;
    });

    it('should only accept a service instantiator', () => {
      expect(() => { container.instantiator = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"setDefinitionFactory" method', () => {
    it('should set a definition factory', () => {
      container.setDefinitionFactory('service', serviceDefinitionFactory);
    });

    it('should only accept a name as first argument', () => {
      expect(
        () => { container.setDefinitionFactory(1, serviceDefinitionFactory); }
      ).to.throw(TypeError);
    });

    it('should only accept a definition factory as second argument', () => {
      expect(
        () => { container.setDefinitionFactory('property', 'bar'); }
      ).to.throw(TypeError);
    });
  });

  describe('"create" method', () => {
    it('should create a definition', () => {
      const definitions = container.create('service', 'foo', {
        object: {foo: 'bar'},
        singleton: true,
        dependencies: {bar: 'foo'}
      });

      expect(definitions).to.deep.equal([{
        key: 'foo',
        object: {
          foo: 'bar'
        },
        singleton: true,
        dependencies: {bar: 'foo'},
        dependencyKeys: []
      }]);
    });

    it('should failed to create a definition from a not defined factory', () => {
      expect(() => container.create('dumb', 'foo')).to.throw(
        NotDefinedDefinitionFactoryError,
        'No \'dumb\' definition factory defined in the list [\'service\'] of available factories'
      );
    });
  });

  describe('"build" method', () => {
    it('should instantiate services and inject them into each others', () => {
      container.create('service', 'bar', {
        object: {bar: 'foo'},
        singleton: true
      });

      const services = container.build();

      expect(services).to.deep.equal({
        foo: {
          foo: 'bar',
          bar: 'foo'
        },
        bar: {
          bar: 'foo'
        }
      });
    });
  });

  describe('"get" method', () => {
    it('should retrieve an instantiated service', () => {
      const foo = container.get('foo');

      expect(foo.foo).to.equal('bar');
    });

    it('should failed to retrieve a not instantiated service', () => {
      expect(() => container.get('foobar')).to.throw(
        NotInstantiatedServiceError,
        'No \'foobar\' service instantiated'
      );
    });
  });

  describe('"createSet" method', () => {
    it('should create a set of definitions', () => {
      const definitions = container.createSet({
        foo: {
          factory: 'service',
          object: {foo: 'bar'},
          singleton: true,
          dependencies: {bar: 'foo'}
        },
        bar: {
          factory: 'service',
          object: {bar: 'foo'}
        }
      });

      expect(definitions).to.deep.equal([
        {
          key: 'foo',
          object: {
            foo: 'bar'
          },
          singleton: true,
          dependencies: {bar: 'foo'},
          dependencyKeys: []
        },
        {
          key: 'bar',
          object: {
            bar: 'foo'
          },
          dependencies: {},
          dependencyKeys: []
        }
      ]);
    });

    it('should allow to build container', () => {
      const services = container.createSet({
        foo: {
          factory: 'service',
          object: {foo: 'bar'},
          singleton: true,
          dependencies: {bar: 'foo'}
        },
        bar: {
          factory: 'service',
          object: {bar: 'foo'}
        }
      }, true);

      expect(services).to.deep.equal({
        foo: {
          foo: 'bar',
          bar: 'foo'
        },
        bar: {
          bar: 'foo'
        }
      });
      expect(container.get('bar').bar).to.equal('foo');
    });

    it('should failed to create a definition from a not defined factory', () => {
      expect(() => container.createSet({
        foo: {
          factory: 'dumb',
          object: {foo: 'bar'},
          singleton: true,
          dependencies: {bar: 'foo'}
        }
      })).to.throw(
        NotDefinedDefinitionFactoryError,
        'No \'dumb\' definition factory defined in the list [\'service\'] of available factories'
      );
    });
  });
});
