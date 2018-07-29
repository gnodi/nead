'use strict';

const expect = require('../../expect');
const UnresolvableReference = require('../../../src/errors/UnresolvableReference');

describe('UnresolvableReferenceError', () => {
  describe('constructor', () => {
    it('should build an explicit message', () => {
      const error = new UnresolvableReference('foo');
      expect(error.message).to.equal('Cannot resolve \'foo\' reference');
    });
  });
});
