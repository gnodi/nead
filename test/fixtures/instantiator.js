'use strict';

module.exports = {
  instantiate: function instantiate(object, isSingleton = false) {
    return isSingleton ? object : Object.create(object);
  }
};
