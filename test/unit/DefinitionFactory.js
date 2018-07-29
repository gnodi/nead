'use strict';

// Force tests execution order.
require('./errors/MissingImplementation');

const expect = require('../expect');
const DefinitionFactory = require('../../src/DefinitionFactory');
const MissingImplementationError = require('../../src/errors/MissingImplementation');

const definitionFactory = new DefinitionFactory();

describe('DefinitionFactory', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(definitionFactory.schema).to.deep.equal({});
    });
  });

  describe('"create" method', () => {
    it('should throw a missing implementation error', () => {
      expect(() => definitionFactory.create('foo', {})).to.throw(
        MissingImplementationError,
        '\'create\' method must be implemented by \'DefinitionFactory\''
      );
    });
  });
});
