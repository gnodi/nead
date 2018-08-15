'use strict';

const expect = require('../expect');
const nead = require('../..');
const Container = require('../../src/Container');
const CyclicDependencyError = require('../../src/errors/CyclicDependency');

// Force injection integration tests execution before.
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

    it('should handle all default definition factories', () => {
      const container = nead.createContainer();
      container.createSet({
        data: {
          factory: 'data',
          data: {
            plop: {
              foo: 'foo'
            },
            plip: 'plip'
          },
          schema: {
            plop: {
              type: Object,
              properties: {
                foo: {
                  type: 'string'
                },
                bar: {
                  type: 'string',
                  default: 'bar'
                }
              }
            },
            plip: {
              type: 'string'
            }
          }
        },
        factory: {
          factory: 'factory',
          object: {plip: 'plip'},
          dependencies: {
            bar: '#data.plop.bar'
          }
        },
        list: {
          factory: 'list',
          items: [
            '#data.plop.foo',
            '#data.plop.bar',
            '#data.plop.foo#data.plop.bar'
          ]
        },
        registry: {
          factory: 'registry',
          type: 'element',
          items: {
            data: '#data',
            factory: '#factory',
            list: '#list',
            service: '#service',
            setRegistry: '#setRegistry',
            setList: '#setList'
          }
        },
        service: {
          factory: 'service',
          object: {plap: 'plap'},
          dependencies: {
            foo: 'foo',
            bar: '#data.plop.bar'
          }
        },
        set: {
          factory: 'set',
          items: {
            plop: {
              object: {plop: 'plop'},
              dependencies: {
                foo: '#data.plop.foo'
              }
            },
            plip: {
              object: {plip: 'plip'},
              dependencies: {
                foo: 'plip'
              }
            }
          },
          dependencies: {
            bar: '#data.plop.bar'
          },
          registry: 'setRegistry',
          list: 'setList'
        }
      }, true);

      expect(container.get('data')).to.deep.equal({
        plop: {
          foo: 'foo',
          bar: 'bar'
        },
        plip: 'plip'
      });
      const registry = container.get('registry');
      expect(registry.get('factory').create({plop: 'plop'})).to.deep.equal({
        plop: 'plop',
        plip: 'plip',
        bar: 'bar'
      });
      expect(registry.get('list')[2]).to.deep.equal('foobar');
      expect(registry.get('service')).to.deep.equal({
        plap: 'plap',
        foo: 'foo',
        bar: 'bar'
      });
      expect(registry.get('setRegistry').get('plop')).to.deep.equal({
        plop: 'plop',
        foo: 'foo',
        bar: 'bar'
      });
      expect(registry.get('setList')[1]).to.deep.equal({
        plip: 'plip',
        foo: 'plip',
        bar: 'bar'
      });
      expect(container.get('set.plop')).to.deep.equal({
        plop: 'plop',
        foo: 'foo',
        bar: 'bar'
      });
    });
  });
});
