'use strict';

module.exports = {
  schema: {
    type: 'boolean'
  },
  getTargetProperty: function getTargetProperty(propertyName, definition) {
    return definition ? `_${propertyName}` : propertyName;
  },
  getValues: function getValues(values) {
    return values;
  },
  validate: function validate() {
    return true;
  }
};
