'use strict';

const expect = require('../../expect');
const MissingDependencyError = require('../../../src/errors/MissingDependencyError');

describe('MissingDependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      const error = new MissingDependencyError('foo');
      expect(error.message).to.equal('\'foo\' dependency has not been injected');
    });
  });
});
