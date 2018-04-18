'use strict';

const expect = require('../../expect');
const UnexpectedError = require('../../../src/errors/Unexpected');

let error;
const unexpectedError = new Error('foo');

describe('UnexpectedError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      error = new UnexpectedError(unexpectedError);
      expect(error.message).to.equal('Unexpected error (foo)');
    });
  });

  describe('"error" getter', () => {
    it('should return the original unexpected error', () => {
      expect(error.error).to.equal(unexpectedError);
    });
  });
});
