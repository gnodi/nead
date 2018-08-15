'use strict';

module.exports = {
  injectSet: function injectSet(object, dependencies, validate) {
    const injectedObject = Object.assign(
      {},
      object,
      Object.getPrototypeOf(object),
      dependencies
    );

    return validate
      ? Object.assign({}, injectedObject, object.need)
      : injectedObject;
  }
};
