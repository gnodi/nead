'use strict';

const expect = require('../expect');
const nead = require('../..');

const functionSerializer = require('../fixtures/functionSerializer');

// Force building integration tests execution before.
require('./building');

describe('nead', () => {
  describe('"compose" method', () => {
    it('should compose two container in the target container with namespaced definitions of the extension container', () => {
      const extensionContainer = nead.createContainer();
      extensionContainer.addDefinitions([
        {
          key: 'foo',
          object: {g: function g() { return this.bar.plop; }},
          dependencies: {
            bar: '#bar'
          },
          dependencyKeys: ['bar']
        },
        {
          key: 'bar',
          object: {},
          dependencies: {
            plop: 'plop'
          },
          dependencyKeys: []
        }
      ]);

      const targetContainer = nead.createContainer();
      targetContainer.addDefinitions([
        {
          key: 'foo',
          object: {f: function f() { return this.ext.bar.plop; }},
          dependencies: {
            ext: {
              bar: '#ext.bar'
            }
          },
          dependencyKeys: ['ext.bar']
        },
        {
          key: 'ext.bar',
          object: {},
          dependencies: {
            plop: 'plip'
          },
          dependencyKeys: []
        }
      ]);

      const composedContainer = nead.compose('ext', targetContainer, extensionContainer);

      expect(composedContainer).to.equal(targetContainer);
      expect(functionSerializer.serialize(composedContainer.definitions)).to.deep.equal([
        {
          key: 'foo',
          object: {f: 'function'},
          dependencies: {
            ext: {
              bar: '#ext.bar'
            }
          },
          dependencyKeys: ['ext.bar']
        },
        {
          key: 'ext.foo',
          object: {g: 'function'},
          dependencies: {
            bar: '#ext.bar'
          },
          dependencyKeys: ['ext.bar']
        },
        {
          key: 'ext.bar',
          object: {},
          dependencies: {
            plop: 'plop'
          },
          dependencyKeys: []
        }
      ]);

      composedContainer.build();

      const foo = composedContainer.get('foo');
      expect(foo.f()).to.equal('plop');

      const extFoo = composedContainer.get('ext.foo');
      expect(extFoo.g()).to.equal('plop');
    });
  });
});
