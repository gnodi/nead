'use strict';

module.exports = {
  schema: {
    type: 'boolean'
  },
  getTargetProperty: function getTargetProperty(propertyName, definition) {
    return definition ? `_${propertyName}` : propertyName;
  }
};
