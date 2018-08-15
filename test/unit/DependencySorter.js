'use strict';

// Force tests execution order.
require('./errors/CyclicDependency');

const expect = require('../expect');
const DependencySorter = require('../../src/DependencySorter');
const CyclicDependencyError = require('../../src/errors/CyclicDependency');

const dependencySorter = new DependencySorter();

describe('DependencySorter', () => {
  describe('"sort" method', () => {
    it('should keep definitions order with no dependencyKeys', () => {
      const orderedKeys = dependencySorter.sort([
        {key: 'a', dependencyKeys: []},
        {key: 'b', dependencyKeys: []},
        {key: 'c', dependencyKeys: []}
      ]);

      expect(orderedKeys).to.deep.equal([
        {key: 'a', dependencyKeys: []},
        {key: 'b', dependencyKeys: []},
        {key: 'c', dependencyKeys: []}
      ]);
    });

    it('should sort definitions in dependency order', () => {
      const orderedKeys = dependencySorter.sort([
        {key: 'a', dependencyKeys: ['b']},
        {key: 'b', dependencyKeys: ['c']},
        {key: 'c', dependencyKeys: []}
      ]);

      expect(orderedKeys).to.deep.equal([
        {key: 'c', dependencyKeys: []},
        {key: 'b', dependencyKeys: ['c']},
        {key: 'a', dependencyKeys: ['b']}
      ]);
    });

    it('should sort definitions in dependency order for complex dependency tree', () => {
      const orderedKeys = dependencySorter.sort([
        {key: 'a', dependencyKeys: ['b', 'c', 'f']},
        {key: 'b', dependencyKeys: ['c']},
        {key: 'c', dependencyKeys: []},
        {key: 'd', dependencyKeys: ['c', 'a']},
        {key: 'e', dependencyKeys: []},
        {key: 'f', dependencyKeys: ['e']}
      ]);

      expect(orderedKeys).to.deep.equal([
        {key: 'c', dependencyKeys: []},
        {key: 'e', dependencyKeys: []},
        {key: 'b', dependencyKeys: ['c']},
        {key: 'f', dependencyKeys: ['e']},
        {key: 'a', dependencyKeys: ['b', 'c', 'f']},
        {key: 'd', dependencyKeys: ['c', 'a']}
      ]);
    });

    it('should failed to sort cyclic dependency keys', () => {
      expect(() => dependencySorter.sort([
        {key: 'a', dependencyKeys: ['b']},
        {key: 'b', dependencyKeys: ['c']},
        {key: 'c', dependencyKeys: ['a']}
      ])).to.throw(CyclicDependencyError, 'Cyclic dependency [\'a\' < \'b\' < \'c\' < \'a\']');
    });

    it('should failed to sort self dependency keys', () => {
      expect(() => dependencySorter.sort([
        {key: 'a', dependencyKeys: ['a']}
      ])).to.throw(CyclicDependencyError, 'Cyclic dependency [\'a\' < \'a\']');
    });

    it('should not show not involved service in the error dependency cycle', () => {
      expect(() => dependencySorter.sort([
        {key: 'a', dependencyKeys: ['c']},
        {key: 'b', dependencyKeys: ['a', 'c']},
        {key: 'c', dependencyKeys: ['a']}
      ])).to.throw(CyclicDependencyError, 'Cyclic dependency [\'a\' < \'c\' < \'a\']');
    });
  });
});
