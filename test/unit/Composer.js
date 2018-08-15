'use strict';

const expect = require('../expect');
const Composer = require('../../src/Composer');
const BadTypeError = require('../../src/errors/BadType');

const containerBuilder = require('../fixtures/containerBuilder');
const referenceResolver = require('../fixtures/referenceResolver');

const composer = new Composer();

describe('Composer', () => {
  describe('"referenceResolver" setter', () => {
    it('should accept a reference resolver', () => {
      composer.referenceResolver = referenceResolver;
    });

    it('should only accept a reference resolver', () => {
      expect(() => { composer.referenceResolver = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"compose" method', () => {
    it('should compose a traget container with an extension container', () => {
      const targetContainer = containerBuilder.build([
        {
          key: 'foo',
          object: {},
          dependencies: {
            plop: '#plop',
            plip: 'plip'
          }
        }
      ]);
      const extensionContainer = containerBuilder.build([
        {
          key: 'bar',
          object: {},
          dependencies: {
            plap: 'plap',
            plup: '#plup'
          }
        }
      ]);

      const composedContainer = composer.compose(
        'namespace',
        targetContainer,
        extensionContainer
      );

      expect(composedContainer).to.equal(targetContainer);
      expect(composedContainer.definitions).to.deep.equal([
        {
          key: 'foo',
          object: {},
          dependencies: {
            plop: '#plop',
            plip: 'plip'
          }
        },
        {
          key: 'namespace.bar',
          object: {},
          dependencies: {
            plap: 'plap',
            plup: '#namespace.plup'
          }
        }
      ]);
    });
  });
});
