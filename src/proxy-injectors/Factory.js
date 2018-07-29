'use strict';

const ProxyInjector = require('../ProxyInjector');
const BadTypeError = require('../errors/BadType');

/**
 * @class FactoryProxyInjector
 */
class FactoryProxyInjector extends ProxyInjector {
  /** @inheritdoc */
  getValues(proxy) {
    if (!proxy || typeof proxy !== 'object' || !proxy.create || !proxy.getObjectPrototype) {
      throw new BadTypeError(proxy, 'a factory');
    }
    return [proxy.getObjectPrototype()];
  }

  /** @inheritdoc */
  getPrototype(proxy) {
    return proxy;
  }
}

module.exports = FactoryProxyInjector;
