'use strict';

module.exports = {
  schema: {
    type: 'boolean'
  },
  getTargetProperty: function getTargetProperty(name, definition) {
    return definition ? `_${name}` : name;
  },
  getValues: function getValues(values) {
    return values;
  },
  validate: function validate(value) {
    return value;
  },
  getValidatedDependency(value) {
    return value;
  }
};
