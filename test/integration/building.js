'use strict';

const expect = require('../expect');
const nead = require('../..');
const Container = require('../../src/Container');
const CyclicDependencyError = require('../../src/errors/CyclicDependency');

require('./injection');

function Foo() {
}
Foo.prototype.plop = 'plip';

const bar = {
  f: function f() {
    return this.foo.plop;
  }
};

const foobar = {
  g: function g() {
    return `${this.foo.plop}-${this.foo.f()}-${this.foo.foo.plop}`;
  }
};

describe('nead', () => {
  describe('"createContainer" method', () => {
    it('should create a new dependency injection container', () => {
      const container = nead.createContainer();
      expect(container).to.be.an.instanceOf(Container);
    });
  });

  describe('container', () => {
    it('should instantiate a service from a definition', () => {
      const container = nead.createContainer();
      container.create('service', 'foo', {
        object: Foo
      });
      container.build();
      const foo = container.get('foo');
      expect(foo).to.be.an.instanceOf(Foo);
      expect(foo.plop).to.equal('plip');
    });

    it('should instantiate and inject service dependencies in the right order', () => {
      const container = nead.createContainer();
      container.create('service', 'foo', {
        object: Foo
      });
      container.create('service', 'foobar', {
        object: foobar,
        singleton: true,
        dependencies: {
          foo: '#foo#bar'
        }
      });
      container.create('service', 'bar', {
        object: bar,
        dependencies: {
          foo: '#foo'
        }
      });
      container.build();
      const foobarInstance = container.get('foobar');
      expect(foobarInstance.g()).equal('plip-plip-plip');
      const barInstance = container.get('bar');
      expect(barInstance.f()).to.equal('plip');
    });

    it('should fail on cyclic dependency', () => {
      const container = nead.createContainer();
      container.create('service', 'foo', {
        object: Foo,
        dependencies: {
          bar: '#bar'
        }
      });
      container.create('service', 'foobar', {
        object: foobar,
        singleton: true,
        dependencies: {
          foo: '#foo#bar'
        }
      });
      container.create('service', 'bar', {
        object: bar,
        dependencies: {
          foo: '#foo'
        }
      });

      expect(() => container.build()).to.throw(
        CyclicDependencyError,
        'Cyclic dependency [\'foo\' < \'bar\' < \'foo\']'
      );
    });
  });
});
