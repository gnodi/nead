'use strict';

const expect = require('../expect');
const Registry = require('../../src/Registry');
const MissingItemError = require('../../src/errors/MissingItem');

const registry = new Registry('item');

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
});
