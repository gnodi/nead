'use strict';

module.exports = {
  getValues: function getValues(proxy) {
    return [`..${proxy}`, `...${proxy}`];
  },
  getPrototype: function getPrototype() {
    return [];
  }
};
