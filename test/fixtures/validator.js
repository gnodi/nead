'use strict';

module.exports = {
  compile: function compile(schema) {
    return {
      validate: value => this.validate(value, schema)
    };
  },
  validate: function validate(value, schema) {
    return Object.keys(value).reduce((map, key) => {
      if (value[key] === 'unexpected') {
        throw new Error('unexpected');
      }

      if (typeof value[key] !== schema[key].type) { // eslint-disable-line valid-typeof
        const error = new TypeError('bad type');
        error.expectedType = schema[key].type;
        throw error;
      }

      if (!value[key] && 'default' in schema[key]) {
        map[key] = schema[key].default; // eslint-disable-line no-param-reassign
      } else {
        map[key] = value[key]; // eslint-disable-line no-param-reassign
      }

      return map;
    }, {});
  }
};
