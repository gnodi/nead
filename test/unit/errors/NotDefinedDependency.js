'use strict';

const expect = require('../../expect');
const NotDefinedDependencyError = require('../../../src/errors/NotDefinedDependency');

describe('NotDefinedDependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      const error = new NotDefinedDependencyError(['plop', 'plip']);
      expect(error.message).to.equal('Dependency is not defined in the list of needed dependencies [\'plop\', \'plip\']');
    });
  });
});
