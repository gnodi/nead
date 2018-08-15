'use strict';

const BadTypeError = require('./errors/BadType');

const referenceResolver = Symbol('referenceResolver');

/**
 * @class Composer
 */
class Composer {
  /**
   * Reference resolver.
   * @type {ReferenceResolver}
   * @throws {TypeError} On unexpected value.
   */
  set referenceResolver(value) {
    if (typeof value !== 'object' || !value.prefix) {
      throw new BadTypeError(value, 'a reference resolver');
    }

    this[referenceResolver] = value;
  }

  /**
   * Compose two containers.
   * @param {string} namespace - The namespace to prefix extension definitions.
   * @param {Container} targetContainer - The target container.
   * @param {Container} extensionContainer - The extension container.
   * @returns {Container} The composed target container.
   */
  compose(namespace, targetContainer, extensionContainer) {
    const extensionDefinitions = extensionContainer.definitions.map(
      definition => Object.assign({}, definition, {key: `${namespace}.${definition.key}`})
    );
    const namespacedDefinitions = this[referenceResolver].prefix(namespace, extensionDefinitions);
    targetContainer.addDefinitions(namespacedDefinitions);

    return targetContainer;
  }
}

module.exports = Composer;
