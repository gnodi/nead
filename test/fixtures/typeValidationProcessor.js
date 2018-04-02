'use strict';

module.exports = {
  schema: {
    type: 'string'
  },
  validate: function validate(value, definition) {
    if (!value) {
      throw new Error('unexpected');
    }
    if (typeof value !== definition) { // eslint-disable-line valid-typeof
      const error = new TypeError('bad type');
      error.expectedType = definition;
      throw error;
    }
  }
};
