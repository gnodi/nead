'use strict';

module.exports = {
  schema: {
    type: 'string'
  },
  getTargetProperty: function getTargetProperty(name) {
    return name;
  },
  getValues: function getValues(values) {
    return values;
  },
  validate: function validate(value, definition) {
    return value || definition;
  },
  getValidatedDependency(value, validatedValues) {
    return validatedValues.length === 1 ? validatedValues[0] : value;
  }
};
