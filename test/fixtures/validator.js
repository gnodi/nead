'use strict';

module.exports = {
  compile: function compile(schema) {
    return {
      validate: function validate(value) {
        return Object.keys(value).reduce((map, key) => {
          if (value[key] === 'unexpected') {
            throw new Error('unexpected');
          }

          if (typeof value[key] !== schema[key].type) { // eslint-disable-line valid-typeof
            const error = new TypeError('bad type');
            error.expectedType = schema[key].type;
            throw error;
          }

          map[key] = value[key]; // eslint-disable-line no-param-reassign
          return map;
        }, {});
      }
    };
  },
  validate: function validate() {
    return 1;
  }
};
