'use strict';

const expect = require('../../expect');
const UnmergeableReferences = require('../../../src/errors/UnmergeableReferences');

describe('UnmergeableReferencesError', () => {
  describe('constructor', () => {
    it('should build an explicit message', () => {
      const error = new UnmergeableReferences(['foo', 'bar']);
      expect(error.message).to.equal('Cannot merge [\'foo\', \'bar\'] references');
    });
  });
});
