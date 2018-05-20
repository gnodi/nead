'use strict';

const expect = require('../expect');
const Registry = require('../../src/Registry');

const registry = new Registry('item');

describe('Registry', () => {
  describe('"set" and "get" methods', () => {
    it('should allow to register and retrieve an item', () => {
      registry.set('foo', 'bar');
      expect(registry.get('foo')).to.equal('bar');
    });

    it('should failed to retrieve an item not registered', () => {
      expect(() => registry.get('bar')).to.throw(Error, 'No item found for \'bar\' key');
    });
  });

  describe('"getAll" methods', () => {
    it('should return the list of registered item values', () => {
      registry.set('plop', 'plip');
      expect(registry.getAll()).to.deep.equal(['bar', 'plip']);
    });
  });
});
