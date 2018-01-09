'use strict';

module.exports = {
  schema: {
    type: 'boolean'
  },
  getTargetProperty: function(propertyName, definition) {
    return definition ? `_${propertyName}` : propertyName;
  },
  getValues: function(values) {
    return values;
  },
  check: function() {
    return true;
  }
};