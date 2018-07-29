'use strict';

const expect = require('../../expect');
const MissingItemError = require('../../../src/errors/MissingItem');

let error;

describe('MissingItemError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      error = new MissingItemError('object', 'foo');
      expect(error.message).to.equal('No object found for \'foo\' key');
    });
  });
});
