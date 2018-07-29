'use strict';

const expect = require('../../expect');
const NotInstantiatedServiceError = require('../../../src/errors/NotInstantiatedService');

describe('NotInstantiatedServiceError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      const error = new NotInstantiatedServiceError('foo');
      expect(error.message).to.equal('No \'foo\' service instantiated');
    });
  });
});
