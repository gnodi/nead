'use strict';

const expect = require('../expect');
const nead = require('../..');
const Registry = require('../../src/Registry');
const DependencyError = require('../../src/errors/Dependency');
const InaccessibleMemberError = require('../../src/errors/InaccessibleMember');
const factory = require('../fixtures/factory');

describe('nead', () => {
  describe('"inject" method', () => {
    it('should inject property to an object', () => {
      const injectedObject = nead.inject(
        {},
        'foo',
        'bar'
      );
      expect(injectedObject.foo).to.equal('bar');
    });
  });

  describe('"validate" method', () => {
    it('should check dependency validity', () => {
      const object = {
        need: {
          foo: {}
        }
      };
      expect(() => nead.validate(object)).to.throw('[foo]: Dependency has not been injected');
    });

    it('should work with injection definers', () => {
      const object = {
        need: {
          plop: {
            property: 'plep',
            value: {
              type: 'object',
              properties: {
                foo: {
                  type: 'string'
                },
                bar: {
                  type: 'number',
                  default: 2
                }
              }
            }
          },
          plip: {
            optional: true
          },
          plap: {},
          plup: {
            interface: {
              methods: ['f', 'g']
            }
          }

        }
      };

      object.plep = {
        foo: 'bar'
      };
      object.plap = 3;
      object.plup = {
        f: () => 'f',
        g: () => 'g',
        h: () => 'h'
      };
      const validatedObject = nead.validate(object);
      expect(validatedObject.plep).to.deep.equal({
        foo: 'bar',
        bar: 2
      });
      expect(validatedObject.plap).to.deep.equal(3);
      expect(validatedObject.plup.f()).to.equal('f');
      expect(() => validatedObject.plup.h()).to.throw(InaccessibleMemberError);
      expect(validatedObject.plop).to.equal(undefined);

      object.plap = undefined;

      expect(() => nead.validate(object)).to.throw(
        DependencyError,
        '[plap]: Dependency has not been injected'
      );
    });

    it('should handle proxy injectors', () => {
      const object = {
        need: {
          registry: {
            proxy: 'registry',
            value: {
              type: 'string',
              default: 'bar'
            }
          },
          list: {
            proxy: 'list',
            value: {
              type: 'string',
              default: 'bar'
            }
          },
          factory: {
            proxy: 'factory',
            value: {
              type: 'object',
              properties: {
                foo: {
                  type: 'string'
                },
                bar: {
                  default: 'bar'
                }
              }
            }
          },
          direct: {
            proxy: 'direct',
            value: {
              type: 'string',
              default: 'bar'
            },
            optional: true
          },
          no: {
            value: {
              type: 'string',
              default: 'bar'
            },
            optional: true
          }
        }
      };
      const registry = new Registry();
      registry.set('plop', 'foo');
      registry.set('plip', null);

      const list = ['foo', null];

      const Foo = function Foo() {};
      Foo.prototype.foo = 'foo';
      factory.init(Foo);

      const validatedObject = nead.injectSet(object, {
        registry,
        list,
        factory
      }, true);

      expect(validatedObject.registry.get('plop')).to.equal('foo');
      expect(validatedObject.registry.get('plip')).to.equal('bar');
      expect(registry.get('plip')).to.equal(null);
      expect(validatedObject.list[0]).to.equal('foo');
      expect(validatedObject.list[1]).to.equal('bar');
      expect(list[1]).to.equal(null);
      expect(validatedObject.factory.create().foo).to.equal('foo');
      expect(validatedObject.direct).to.equal('bar');
      expect(validatedObject.no).to.equal('bar');
    });
  });
});
