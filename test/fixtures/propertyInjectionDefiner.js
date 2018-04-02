'use strict';

module.exports = {
  schema: {
    type: 'boolean'
  },
  getTargetProperty: function getTargetProperty(name, definition) {
    return definition ? `_${name}` : name;
  }
};
