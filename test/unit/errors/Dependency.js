'use strict';

const expect = require('../../expect');
const DependencyError = require('../../../src/errors/Dependency');

let error;
const validationError = new Error('bad dependency');

describe('DependencyError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      error = new DependencyError('foo', validationError);
      expect(error.message).to.equal('[foo]: bad dependency');
    });
  });

  describe('"error" getter', () => {
    it('should return the original validation error', () => {
      expect(error.error).to.equal(validationError);
    });
  });
});
