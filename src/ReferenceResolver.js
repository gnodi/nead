'use strict';

const UnmergeableReferences = require('./errors/UnmergeableReferences');
const UnresolvableReferenceError = require('./errors/UnresolvableReference');

const processReferences = Symbol('processReferences');
const getPrototypeChain = Symbol('getPrototypeChain');

/**
 * @class ReferenceResolver
 */
class ReferenceResolver {
  /**
   * Find references.
   * @param {*} value - The value eventually containing references.
   * @returns {Array<string>} The reference list.
   */
  find(value) {
    const referenceList = [];

    this[processReferences](value, (list, reference) => {
      list.push(reference);
      return list;
    }, referenceList);

    return referenceList;
  }

  /**
   * Resolve references.
   * @param {*} value - The value eventually containing reference strings.
   * @param {Object} map - The reference map.
   * @returns {Array<Object>} The resolved value.
   * @throws {UnmergeableReferences} On merging not compatible references.
   * @throws {UnresolvableReferenceError} On missing correspondence in reference map.
   */
  resolve(value, map) {
    return this[processReferences](value, (agg, reference, index, references) => {
      // Resolve references.
      if (!(reference in map)) {
        throw new UnresolvableReferenceError(reference);
      }

      const resolvedReference = map[reference];

      if (!agg) {
        return resolvedReference;
      }

      // Merge references.
      if (typeof agg === 'object' && typeof resolvedReference === 'object') {
        // Handle case of complex objects.
        if (
          Object.getPrototypeOf(agg) !== Object.prototype
          || Object.getPrototypeOf(resolvedReference) !== Object.prototype
        ) {
          const prototypes = this[getPrototypeChain](agg).concat(
            this[getPrototypeChain](resolvedReference)
          );

          return prototypes.reduce((object, prototype) => {
            const descriptors = Object.getOwnPropertyDescriptors(prototype);
            const propertyNames = Object.getOwnPropertyNames(prototype).concat(
              Object.getOwnPropertySymbols(prototype),
              descriptors
            );

            return propertyNames.reduce((obj, propertyName) => {
              if (propertyName in descriptors) {
                // eslint-disable-next-line no-param-reassign
                Object.defineProperty(obj, propertyName, descriptors[propertyName]);
              } else {
                // eslint-disable-next-line no-param-reassign
                obj[propertyName] = prototype[propertyNames];
              }
              return object;
            }, object);
          }, {});
        }
        return Object.assign({}, agg, resolvedReference);
      }
      if (typeof agg === 'string' && typeof resolvedReference === 'string') {
        return `${agg}${resolvedReference}`;
      }

      throw new UnmergeableReferences(references);
    });
  }

  /**
   * Process references.
   * @param {*} value - The value eventually containing references.
   * @param {Function} processing - The processing function.
   * @param {*} [initialValue] - The optional processing initial value.
   * @returns {Array<Object>} The processed value.
   * @protected
   */
  [processReferences](value, processing, initialValue) {
    if (value && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.keys(value).reduce((object, property) => {
        // eslint-disable-next-line no-param-reassign
        object[property] = this[processReferences](value[property], processing, initialValue);
        return object;
      }, {});
    }

    if (typeof value === 'string' && /^#[^#]/.test(value)) {
      const references = value
        .replace(/([^#]|^)#([^#])/g, '$1[#_#]$2')
        .split(/\[#_#\]/)
        .filter(reference => reference);

      return references.reduce(processing, initialValue);
    }

    return value;
  }

  /**
   * Get prototype chain of an object.
   * @param {object} object - The object.
   * @returns {Array<object>} The prototypes.
   * @private
   */
  [getPrototypeChain](object) {
    const prototypes = [];

    do {
      prototypes.push(object);
      object = Object.getPrototypeOf(object); // eslint-disable-line no-param-reassign
    } while (object && object !== Object.prototype);

    return prototypes;
  }
}

ReferenceResolver.processReferences = processReferences;

module.exports = ReferenceResolver;
