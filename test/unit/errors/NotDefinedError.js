'use strict';

const expect = require('../../expect');
const NotDefinedDependencyError = require('../../../src/errors/NotDefinedDependencyError');

describe('NotDefinedDependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      const error = new NotDefinedDependencyError('foo', ['plop', 'plip']);
      expect(error.message).to.equal('\'foo\' dependency is not defined in the list of needed dependencies [\'plop\', \'plip\']');
    });
  });
});
