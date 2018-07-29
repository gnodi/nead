'use strict';

// Force tests execution order.
require('./errors/MissingImplementation');

const expect = require('../expect');
const ProxyInjector = require('../../src/ProxyInjector');
const MissingImplementationError = require('../../src/errors/MissingImplementation');

const proxyInjector = new ProxyInjector();

describe('InjectionDefiner', () => {
  describe('"getValues" method', () => {
    it('should throw a missing implementation error', () => {
      expect(() => proxyInjector.getValues({})).to.throw(
        MissingImplementationError,
        '\'getValues\' method must be implemented by \'ProxyInjector\''
      );
    });
  });

  describe('"getValidatedDependency" method', () => {
    it('should throw a missing implementation error', () => {
      expect(() => proxyInjector.getPrototype('dumb')).to.throw(
        MissingImplementationError,
        '\'getPrototype\' method must be implemented by \'ProxyInjector\''
      );
    });
  });
});
