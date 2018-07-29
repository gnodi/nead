'use strict';

module.exports = {
  find: function find(value) {
    return Object.keys(value).reduce((list, property) => {
      if (/^#/.test(value[property])) {
        list.push(value[property].replace(/^#/, ''));
      }
      return list;
    }, []);
  },
  resolve: function resolve(value, map) {
    if (!value || typeof value !== 'object') {
      return value;
    }
    return Object.keys(value).reduce((object, property) => {
      const propertyValue = value[property];
      // eslint-disable-next-line no-param-reassign
      object[property] = propertyValue in map ? map[propertyValue] : propertyValue;
      return object;
    }, {});
  }
};
