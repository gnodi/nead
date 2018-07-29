'use strict';

module.exports = {
  injectSet: function injectSet(object, dependencies) {
    return Object.assign({}, object, dependencies);
  }
};
