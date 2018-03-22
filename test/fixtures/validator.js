'use strict';

module.exports = {
  compile: function compile(schema) {
    return {
      validate: function validate(value) {
        if (value === 'unexpected') {
          throw new Error('unexpected');
        }

        if (typeof value !== schema.type) { // eslint-disable-line valid-typeof
          const error = new TypeError('bad type');
          error.expectedType = schema.type;
          throw error;
        }

        return value;
      }
    };
  },
  validate: function validate() {
    return 1;
  }
};
