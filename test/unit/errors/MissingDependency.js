'use strict';

const expect = require('../../expect');
const MissingDependencyError = require('../../../src/errors/MissingDependency');

describe('MissingDependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message', () => {
      const error = new MissingDependencyError();
      expect(error.message).to.equal('Dependency has not been injected');
    });
  });
});
