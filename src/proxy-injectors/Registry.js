'use strict';

const ProxyInjector = require('../ProxyInjector');
const BadTypeError = require('../errors/BadType');

const valueWrapper = ProxyInjector.valueWrapper;

/**
 * @class RegistryProxyInjector
 */
class RegistryProxyInjector extends ProxyInjector {
  /** @inheritdoc */
  getValues(proxy) {
    if (!proxy || typeof proxy !== 'object' || !proxy.get || !proxy.set || !proxy.getList || !proxy.getMap) {
      throw new BadTypeError(proxy, 'a registry');
    }

    const map = proxy.getMap();
    return Object.keys(map).map((key) => {
      const value = map[key];
      return this[valueWrapper].wrap(value, (validatedValue, proxyPrototype) => {
        proxyPrototype.set(key, validatedValue);
      });
    });
  }

  /** @inheritdoc */
  getPrototype(proxy) {
    return proxy.constructor && proxy.constructor !== Object
      ? new proxy.constructor()
      : Object.create(proxy);
  }
}

module.exports = RegistryProxyInjector;
