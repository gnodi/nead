'use strict';

module.exports = {
  wrap: function wrap(value, setValidatedValue) {
    return {
      isWrappedValue: true,
      value,
      setValidatedValue: function setValidatedProxyValue(proxy) {
        setValidatedValue(this.value, proxy);
      }
    };
  }
};
