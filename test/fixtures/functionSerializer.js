'use strict';

module.exports = {
  serialize: function serialize(object) {
    return Object.keys(object).reduce((obj, key) => {
      const value = object[key];
      if (value && typeof value === 'object') {
        obj[key] = this.serialize(value); // eslint-disable-line no-param-reassign
      } else {
        obj[key] = typeof value === 'function' ? 'function' : value; // eslint-disable-line no-param-reassign
      }
      return obj;
    }, object instanceof Array ? [] : {});
  }
};
