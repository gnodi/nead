'use strict';

const expect = require('../../expect');
const CyclicDependencyError = require('../../../src/errors/CyclicDependency');

describe('CyclicDependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      const error = new CyclicDependencyError(['plop', 'plip', 'plup', 'plop']);
      expect(error.message).to.equal('Cyclic dependency [\'plop\' < \'plip\' < \'plup\' < \'plop\']');
    });
  });
});
