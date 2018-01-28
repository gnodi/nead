'use strict';

module.exports = {
  schema: {
    type: 'string'
  },
  getTargetProperty: function getTargetProperty(propertyName) {
    return propertyName;
  },
  getValues: function getValues(values) {
    return values;
  },
  validate: function validate(value, propertyDefinition) {
    if (typeof value !== propertyDefinition) { // eslint-disable-line valid-typeof
      throw new TypeError('bad type');
    }
  }
};
