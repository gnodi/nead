'use strict';

const BadDependencyError = require('../../src/errors/BadDependency');
const MissingDependencyError = require('../../src/errors/MissingDependency');

module.exports = {
  schema: {
    type: 'string'
  },
  getTargetProperty: function getTargetProperty(name) {
    return name;
  },
  getValues: function getValues(values) {
    if (values[0] === 'failed') {
      throw new Error('failed');
    }
    if (values[0] === undefined) {
      throw new MissingDependencyError();
    }
    return values;
  },
  validate: function validate(value, definition) {
    if (value === 'unexpected') {
      throw new Error('unexpected');
    }
    if (typeof value !== definition) { // eslint-disable-line valid-typeof
      const error = new BadDependencyError(new Error('bad type'));
      throw error;
    }
    return value;
  },
  getValidatedDependency(value) {
    if (value === 'unexpected value') {
      throw new Error('unexpected value');
    }
    return value;
  }
};
