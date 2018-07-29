'use strict';

const expect = require('../../expect');
const BadDefinitionError = require('../../../src/errors/BadDefinition');

let error;
const validationError = new Error('foo');

describe('BadDefinitionError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      error = new BadDefinitionError(validationError);
      expect(error.message).to.equal('Bad need definition: foo');
    });
  });

  describe('"error" getter', () => {
    it('should return the original validation error', () => {
      expect(error.error).to.equal(validationError);
    });
  });
});
