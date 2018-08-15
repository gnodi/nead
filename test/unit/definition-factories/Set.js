'use strict';

const expect = require('../../expect');
const SetDefinitionFactory = require('../../../src/definition-factories/Set');
const BadTypeError = require('../../../src/errors/BadType');

const functionSerializer = require('../../fixtures/functionSerializer');

const definitionFactory = new SetDefinitionFactory();
const registryObject = {
  get: true,
  set: true,
  getList: true,
  getMap: true
};
class Registry {
  constructor() {
    this.items = {};
  }
  get(key) { return this.items[key]; }
  set(key, value) { this.items[key] = value; }
  getList() {}
  getMap() {}
}
class Random {
}

describe('SetDefinitionFactory', () => {
  describe('"registryObject" setter', () => {
    it('should accept a registry class', () => {
      definitionFactory.registryObject = Registry;
    });

    it('should accept a registry object', () => {
      definitionFactory.registryObject = registryObject;
    });

    it('should only accept a registry class or object', () => {
      expect(() => { definitionFactory.registryObject = Random; }).to.throw(BadTypeError);
      expect(() => { definitionFactory.registryObject = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"schema" getter', () => {
    it('should retrieve validation schema for creation options', () => {
      expect(definitionFactory.schema).to.deep.equal({
        items: {
          type: Object,
          items: {
            type: Object,
            properties: {
              object: {
                required: true
              },
              singleton: {
                type: 'boolean',
                required: false
              },
              dependencies: {
                type: Object,
                required: false
              },
              need: {
                type: Object,
                required: false
              }
            }
          }
        },
        singleton: {
          type: 'boolean',
          default: false
        },
        dependencies: {
          type: Object,
          default: {}
        },
        need: {
          type: Object,
          required: false
        },
        registry: {
          type: 'string',
          required: false
        },
        list: {
          type: 'string',
          required: false
        }
      });
    });
  });

  describe('"create" method', () => {
    it('should create item definitions sharing base definition', () => {
      const definitions = definitionFactory.create('set', {
        items: {
          plop: {
            object: {
              plop: 1
            }
          },
          plip: {
            object: {
              plip: 2
            },
            singleton: true,
            dependencies: {
              foo: 'bar',
              plap: 3
            },
            need: {
              plip: 'number',
              plap: 'number'
            }
          }
        },
        singleton: false,
        dependencies: {
          bar: 'foo',
          plap: 'plup'
        },
        need: {
          bar: 'string',
          plap: 'string'
        }
      });

      expect(definitions).to.deep.equal([
        {
          key: 'set.plop',
          object: {plop: 1},
          singleton: false,
          dependencies: {
            bar: 'foo',
            plap: 'plup'
          },
          need: {
            bar: 'string',
            plap: 'string'
          }
        },
        {
          key: 'set.plip',
          object: {plip: 2},
          singleton: true,
          dependencies: {
            foo: 'bar',
            bar: 'foo',
            plap: 3
          },
          need: {
            bar: 'string',
            plip: 'number',
            plap: 'number'
          }
        }
      ]);
    });

    it('should allow to create a registry containing set services', () => {
      const definitions = definitionFactory.create('set', {
        items: {
          plop: {
            object: {
              plop: 1
            }
          },
          plip: {
            object: {
              plip: 2
            }
          }
        },
        registry: 'registry'
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'set.plop',
          object: {plop: 1},
          dependencies: {}
        },
        {
          key: 'set.plip',
          object: {plip: 2},
          dependencies: {}
        },
        {
          key: 'registry',
          object: {
            get: true,
            set: true,
            getList: true,
            getMap: true
          },
          dependencies: {
            items: {
              injectedValue: {
                plop: '#set.plop',
                plip: '#set.plip'
              },
              injectDependency: 'function'
            }
          }
        }
      ]);
      const injectedValue = definitions[2].dependencies.items.injectedValue;
      const injectedRegistry = new Registry();
      definitions[2].dependencies.items.injectDependency(injectedRegistry, injectedValue);
      expect(injectedRegistry.get('plop')).to.deep.equal('#set.plop');
    });

    it('should allow to create a list containing set services', () => {
      const definitions = definitionFactory.create('set', {
        items: {
          plop: {
            object: {
              plop: 1
            }
          },
          plip: {
            object: {
              plip: 2
            }
          }
        },
        list: 'list'
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'set.plop',
          object: {plop: 1},
          dependencies: {}
        },
        {
          key: 'set.plip',
          object: {plip: 2},
          dependencies: {}
        },
        {
          key: 'list',
          object: [],
          singleton: true,
          dependencies: {
            items: {
              injectedValue: [
                '#set.plop',
                '#set.plip'
              ],
              injectDependency: 'function'
            }
          }
        }
      ]);
      const injectedValue = definitions[2].dependencies.items.injectedValue;
      const injectedList = [];
      definitions[2].dependencies.items.injectDependency(injectedList, injectedValue);
      expect(injectedList).to.deep.equal(['#set.plop', '#set.plip']);
      expect(injectedValue).to.deep.equal(['#set.plop', '#set.plip']);
      expect(injectedList).to.not.equal(injectedValue);
    });

    it('should allow to create both a list and registry containing set services', () => {
      const definitions = definitionFactory.create('set', {
        items: {
          plop: {
            object: {
              plop: 1
            }
          },
          plip: {
            object: {
              plip: 2
            }
          }
        },
        registry: 'registry',
        list: 'list'
      });

      expect(functionSerializer.serialize(definitions)).to.deep.equal([
        {
          key: 'set.plop',
          object: {plop: 1},
          dependencies: {}
        },
        {
          key: 'set.plip',
          object: {plip: 2},
          dependencies: {}
        },
        {
          key: 'registry',
          object: {
            get: true,
            set: true,
            getList: true,
            getMap: true
          },
          dependencies: {
            items: {
              injectedValue: {
                plop: '#set.plop',
                plip: '#set.plip'
              },
              injectDependency: 'function'
            }
          }
        },
        {
          key: 'list',
          object: [],
          singleton: true,
          dependencies: {
            items: {
              injectedValue: [
                '#set.plop',
                '#set.plip'
              ],
              injectDependency: 'function'
            }
          }
        }
      ]);
    });
  });
});
