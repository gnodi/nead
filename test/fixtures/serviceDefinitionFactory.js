'use strict';

module.exports = {
  schema: {
    object: {
      type: 'object'
    }
  },
  create: function create(key, options) {
    return [Object.assign({key}, options)];
  }
};
