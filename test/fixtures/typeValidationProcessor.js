'use strict';

module.exports = {
  schema: {
    type: 'string'
  },
  validate: function validate(value, propertyDefinition) {
    if (!value) {
      throw new Error('unexpected');
    }
    if (typeof value !== propertyDefinition) { // eslint-disable-line valid-typeof
      const error = new TypeError('bad type');
      error.expectedType = propertyDefinition;
      throw error;
    }
  }
};
