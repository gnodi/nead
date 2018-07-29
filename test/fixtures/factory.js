'use strict';

module.exports = {
  init: function init(constructor) {
    this.prototype = constructor.prototype;
  },
  create: function create(dependencies) {
    return Object.assign(
      Object.create(this.prototype),
      dependencies
    );
  },
  getObjectPrototype: function getObjectPrototype() {
    return Object.create(this.prototype);
  }
};
