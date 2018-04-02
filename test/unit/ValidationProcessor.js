'use strict';

const expect = require('../expect');
const ValidationProcessor = require('../../src/ValidationProcessor');

const validationProcessor = new ValidationProcessor();

describe('ValidationProcessor', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(validationProcessor.schema).to.deep.equal({});
    });
  });

  describe('"validate" method', () => {
    it('should throw a missing implementation error', () => {
      expect(() => validationProcessor.validate('foo', {})).to.throw(
        Error,
        '\'validate\' method must be implemented'
      );
    });
  });
});
