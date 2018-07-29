'use strict';

const ProxyInjector = require('../ProxyInjector');
const BadTypeError = require('../errors/BadType');

const valueWrapper = ProxyInjector.valueWrapper;

/**
 * @class ListProxyInjector
 */
class ListProxyInjector extends ProxyInjector {
  /** @inheritdoc */
  getValues(proxy) {
    if (!Array.isArray(proxy)) {
      throw new BadTypeError(proxy, 'an array');
    }
    return proxy.map(value => this[valueWrapper].wrap(value, (validatedValue, proxyPrototype) => {
      proxyPrototype.push(validatedValue);
    }));
  }

  /** @inheritdoc */
  getPrototype() {
    return [];
  }
}

module.exports = ListProxyInjector;
