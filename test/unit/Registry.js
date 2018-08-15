'use strict';

const expect = require('../expect');
const Registry = require('../../src/Registry');
const BadTypeError = require('../../src/errors/BadType');
const MissingItemError = require('../../src/errors/MissingItem');

const registry = new Registry();

describe('Registry', () => {
  describe('"set" and "get" methods', () => {
    it('should allow to register and retrieve an item', () => {
      registry.set('foo', 'bar');
      registry.set('plop', 'plip');
      expect(registry.get('foo')).to.equal('bar');
      expect(registry.get('plop')).to.equal('plip');
    });

    it('should failed to retrieve an item not registered', () => {
      expect(() => registry.get('bar')).to.throw(
        MissingItemError,
        'No item found for \'bar\' key'
      );
    });
  });

  describe('"setType" method', () => {
    it('should accept a string', () => {
      registry.setType('element');

      expect(() => registry.get('bar')).to.throw(
        MissingItemError,
        'No element found for \'bar\' key'
      );
    });

    it('should only accept a string', () => {
      expect(() => { registry.setType(1); }).to.throw(BadTypeError);
    });
  });

  describe('"getMap" methods', () => {
    it('should return the map of registered item values', () => {
      expect(registry.getMap()).to.deep.equal({foo: 'bar', plop: 'plip'});
    });
  });

  describe('"getList" methods', () => {
    it('should return the list of registered item values', () => {
      expect(registry.getList()).to.deep.equal(['bar', 'plip']);
    });
  });

  describe('constructor', () => {
    it('should allow to specify item type', () => {
      const typedRegistry = new Registry('state');

      expect(() => typedRegistry.get('foo')).to.throw(
        MissingItemError,
        'No state found for \'foo\' key'
      );
    });
  });
});
