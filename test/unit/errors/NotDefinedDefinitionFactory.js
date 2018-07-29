'use strict';

const expect = require('../../expect');
const NotDefinedDefinitionFactoryError = require('../../../src/errors/NotDefinedDefinitionFactory');

describe('NotDefinedDefinitionFactoryError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      const error = new NotDefinedDefinitionFactoryError('plup', ['plop', 'plip']);
      expect(error.message).to.equal('No \'plup\' definition factory defined in the list [\'plop\', \'plip\'] of available factories');
    });
  });
});
