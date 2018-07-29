'use strict';

const CyclicDependencyError = require('./errors/CyclicDependency');

const findDependencyCycle = Symbol('findDependencyCycle');

/**
 * @class DependencySorter
 */
class DependencySorter {
  /**
   * Sort definitions by dependency.
   * @param {Array<Object>} definitions - The definitions.
   * @returns {Array<Array>} The sorted definitions.
   * @throws {CyclicDependencyError} On cyclic dependency.
   */
  sort(definitions) {
    let definitionWeights = definitions.reduce((map, definition) => {
      map[definition.key] = 0; // eslint-disable-line no-param-reassign
      return map;
    }, {});
    const indexedDefinitions = definitions.reduce((map, definition) => {
      map[definition.key] = definition; // eslint-disable-line no-param-reassign
      return map;
    }, {});

    // Compute definition weights.
    let doneSomething = true;
    const maxPossibleWeight = definitions.length - 1;

    while (doneSomething) {
      doneSomething = false;

       // eslint-disable-next-line no-loop-func
      definitionWeights = Object.keys(definitionWeights).reduce((map, weightKey) => {
        const weight = definitionWeights[weightKey];

        if (!(weightKey in map)) {
          map[weightKey] = weight; // eslint-disable-line no-param-reassign
        }

        definitions.forEach((definition) => {
          const key = definition.key;
          const definitionWeight = definitionWeights[key];

          if (definition.dependencyKeys.includes(weightKey) && definitionWeight <= weight) {
            if (weight >= maxPossibleWeight) {
              const cycle = this[findDependencyCycle](indexedDefinitions);
              throw new CyclicDependencyError(cycle);
            }

            map[key] = weight + 1; // eslint-disable-line no-param-reassign
            doneSomething = true;
          }
        });

        return map;
      }, {});
    }

    // Sort definitions by weight.
    const maxWeight = Object.keys(definitionWeights).reduce(
      (max, key) => Math.max(max, definitionWeights[key]),
      0
    );
    let sortedDefinitions = [];

    for (let i = 0; i <= maxWeight; i++) {
      sortedDefinitions = sortedDefinitions.concat(
        Object.keys(definitionWeights).reduce((list, key) => {
          if (definitionWeights[key] === i) {
            list.push(indexedDefinitions[key]);
          }
          return list;
        }, [])
      );
    }

    return sortedDefinitions;
  }

  /**
   * Find dependency cycle.
   * @param {Object<string,Object>} definitions - The indexed definitions.
   * @returns {Array<string>} The dependency cycle.
   * @private
   */
  [findDependencyCycle](definitions) {
    return Object.keys(definitions).reduce((cycle, key) => {
      if (cycle.length !== 0) {
        return cycle;
      }

      const dependencies = definitions[key].dependencyKeys;
      let paths = dependencies.map(dependency => [dependency]);
      let existingCycle = [];

      while (paths.length !== 0) {
        const cyclePath = paths.find(path => path.includes(key));

        if (cyclePath) {
          existingCycle = [key].concat(cyclePath);
          break;
        }

        paths = paths.reduce((chain, path) => {
          const dependencyDependencies = definitions[path[path.length - 1]].dependencyKeys;

          return chain.concat(
            dependencyDependencies.map(dependency => path.concat([dependency]))
          );
        }, []);
      }

      return existingCycle;
    }, []);
  }
}

module.exports = DependencySorter;
