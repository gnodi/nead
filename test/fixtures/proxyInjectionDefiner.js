'use strict';

module.exports = {
  schema: {
    type: 'boolean'
  },
  getTargetProperty: function getTargetProperty(name) {
    return name;
  },
  getValues: function getValues(values, definition) {
    if (definition) {
      return values.map(value => ({
        isWrappedValue: true,
        value
      }));
    }
    return values;
  },
  validate: function validate(value) {
    return value;
  },
  getValidatedDependency(value, validatedValues, definition) {
    return definition ? validatedValues[0].value : validatedValues[0];
  }
};
