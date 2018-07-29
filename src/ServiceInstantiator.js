'use strict';

/**
 * @class ServiceInstantiator
 */
class ServiceInstantiator {
  /**
   * Instantiate a service.
   * @param {Object|Function} object - The base object or constructor.
   * @param {boolean} [isSingleton=false] - Whether or not it is a singleton object.
   * @returns {Object} The instance.
   */
  instantiate(object, isSingleton = false) {
    let instance;

    if (isSingleton === true) {
      instance = object;
    } else if (object instanceof Function) {
      instance = new object(); // eslint-disable-line new-cap
    } else {
      instance = Object.create(object);
    }

    return instance;
  }
}

module.exports = ServiceInstantiator;
