'use strict';

const expect = require('../../expect');
const BadDependencyError = require('../../../src/errors/BadDependency');

let error;
const validationError = new Error('foo');

describe('BadDependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      error = new BadDependencyError(validationError);
      expect(error.message).to.equal('Bad dependency (foo)');
    });
  });

  describe('"error" getter', () => {
    it('should return the original validation error', () => {
      expect(error.error).to.equal(validationError);
    });
  });
});
