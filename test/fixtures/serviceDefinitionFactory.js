'use strict';

module.exports = {
  schema: {
    object: {
      type: 'mixed'
    },
    singleton: {
      type: 'boolean'
    },
    dependencies: {
      type: 'object'
    },
    need: {
      type: 'object'
    }
  },
  create: function create(key, options) {
    return [Object.assign({key}, options)];
  }
};
