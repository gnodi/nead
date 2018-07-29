'use strict';

const ProxyInjector = require('../ProxyInjector');

/**
 * @class DirectProxyInjector
 */
class DirectProxyInjector extends ProxyInjector {
  /** @inheritdoc */
  getValues(proxy) {
    return proxy;
  }

  /** @inheritdoc */
  getPrototype() {
    return null;
  }
}

module.exports = DirectProxyInjector;
