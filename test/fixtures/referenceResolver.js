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
  build: function build(namespace, value) {
    return {[namespace]: value};
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
  },
  prefix: function prefix(namespace, value) {
    return value.map((item) => {
      const dependencies = Object.keys(item.dependencies).reduce((map, key) => {
        const dependency = item.dependencies[key];
        map[key] = /^#/.test(dependency) // eslint-disable-line no-param-reassign
          ? `#${namespace}.${dependency.slice(1)}`
          : dependency;
        return map;
      }, {});
      return Object.assign({}, item, {dependencies});
    });
  }
};
