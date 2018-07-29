'use strict';

/**
 * @class ValueValidationWrapper
 */
class ValueValidationWrapper {
  /**
   * Wrap a value with a validation wrapper.
   * @param {*} key - The value.
   * @param {Function} setValidatedValue - The function of signature `(validatedValue, proxy)`
   *  allowing to set proxy validated value back.
   * @returns {Object} The wrapped value.
   */
  wrap(value, setValidatedValue) {
    return {
      isWrappedValue: true,
      value,
      setValidatedValue: function setValidatedProxyValue(proxy) {
        return setValidatedValue(this.value, proxy);
      }
    };
  }
}

module.exports = ValueValidationWrapper;
