'use strict';

const InjectionDefiner = require('../InjectionDefiner');
const BadTypeError = require('../errors/BadType');

const validator = Symbol('validator');
const throwBadDependencyError = InjectionDefiner.throwBadDependencyError;

/**
 * @class ValueInjectionDefiner
 */
class ValueInjectionDefiner extends InjectionDefiner {
  /**
   * Validator.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set validator(value) {
    if (typeof value !== 'object' || !value.compile || !value.validate) {
      throw new BadTypeError(value, 'a validator');
    }

    this[validator] = value;
  }

  /** @inheritdoc */
  get schema() {
    return {
      type: 'object',
      required: false
    };
  }

  /** @inheritdoc */
  validate(value, definition) { // eslint-disable-line no-unused-vars
    try {
      const validatedValue = this[validator].validate(
        {property: value},
        {property: definition},
        {
          immutable: true,
          required: true
        }
      );
      return validatedValue.property;
    } catch (error) {
      if (value === null || value === undefined) {
        return value;
      }
      return this[throwBadDependencyError](error);
    }
  }
}

module.exports = ValueInjectionDefiner;
