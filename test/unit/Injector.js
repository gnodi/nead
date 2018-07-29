'use strict';

// Force tests execution order.
require('./errors/BadDefinition');
require('./errors/BadDependency');
require('./errors/BadType');
require('./errors/Dependency');
require('./errors/MissingDependency');
require('./errors/NotDefinedDependency');
require('./errors/Unexpected');

const expect = require('../expect');
const Injector = require('../../src/Injector');
const BadDefinitionError = require('../../src/errors/BadDefinition');
const BadDependencyError = require('../../src/errors/BadDependency');
const BadTypeError = require('../../src/errors/BadType');
const DependencyError = require('../../src/errors/Dependency');
const MissingDependencyError = require('../../src/errors/MissingDependency');
const NotDefinedDependencyError = require('../../src/errors/NotDefinedDependency');
const UnexpectedError = require('../../src/errors/Unexpected');

const validator = require('../fixtures/validator');
const defaultInjectionDefiner = require('../fixtures/defaultInjectionDefiner');
const propertyInjectionDefiner = require('../fixtures/propertyInjectionDefiner');
const proxyInjectionDefiner = require('../fixtures/proxyInjectionDefiner');
const typeInjectionDefiner = require('../fixtures/typeInjectionDefiner');

const injector = new Injector();

describe('Injector', () => {
  describe('"validator" setter', () => {
    it('should accept a validator', () => {
      injector.validator = validator;
    });

    it('should only accept a validator', () => {
      expect(() => { injector.validator = 'foo'; }).to.throw(BadTypeError);
    });
  });

  describe('"setInjectionDefiner" method', () => {
    it('should set an injection definer', () => {
      injector.setInjectionDefiner('default', defaultInjectionDefiner);
      injector.setInjectionDefiner('property', propertyInjectionDefiner);
      injector.setInjectionDefiner('proxy', proxyInjectionDefiner);
      injector.setInjectionDefiner('type', typeInjectionDefiner);
    });

    it('should only accept a name as first argument', () => {
      expect(
        () => { injector.setInjectionDefiner(1, propertyInjectionDefiner); }
      ).to.throw(BadTypeError);
    });

    it('should only accept an injection definer as second argument', () => {
      expect(
        () => { injector.setInjectionDefiner('property', 'bar'); }
      ).to.throw(BadTypeError);
    });
  });

  describe('"inject" method', () => {
    it('should inject a dependency to an object', () => {
      const injectedObject = injector.inject(
        {},
        'foo',
        'bar'
      );

      expect(injectedObject.foo).to.equal('bar');
    });

    it('should be immutable for the original object', () => {
      const originalObject = {
        f: function f() {
          return this.foo || 'foo';
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      expect(originalObject.f()).to.equal('foo');
      expect(injectedObject.f()).to.equal('bar');
    });

    it('should allow to specify needed dependency property name where to store the value', () => {
      const originalObject = {
        need: {
          foo: {
            property: true
          }
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject._foo).to.equal('bar'); // eslint-disable-line no-underscore-dangle
    });

    it('should handle needed dependencies definition function', () => {
      const originalObject = {
        need: function need() {
          return {
            foo: {
              property: true
            }
          };
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject._foo).to.equal('bar'); // eslint-disable-line no-underscore-dangle
    });

    it('should failed to inject not needed dependency', () => {
      const originalObject = {
        need: {
          foo: {},
          bar: {}
        }
      };

      expect(() => injector.inject(
        originalObject,
        'dumb',
        4
      )).to.throw(
        DependencyError,
        '[dumb]: Dependency is not defined in the list of needed dependencies [\'foo\', \'bar\']'
      ).with.property('error').to.be.an.instanceof(NotDefinedDependencyError);
    });

    it('should inject not needed dependency without processing injection definers if no needed dependency is defined', () => {
      const originalObject = {};

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject.foo).to.equal('bar');
    });

    it('should handle property accessor', () => {
      const originalObject = ['plop'];

      const injectedObject = injector.inject(
        originalObject,
        'items',
        {
          injectedValue: ['plip', 'plup'],
          injectDependency: (object, value) => {
            value.forEach(item => object.push(item));
          }
        }
      );

      expect(injectedObject).to.deep.equal(['plop', 'plip', 'plup']);
      expect(originalObject).to.deep.equal(['plop']);
    });
  });

  describe('"validate" method', () => {
    it('should validate injected dependencies', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      const validatedObject = injector.validate(injectedObject);

      expect(validatedObject.foo).to.equal('bar');
    });

    it('should failed to validate bad injected dependencies', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        1
      );

      expect(() => injector.validate(injectedObject)).to.throw(
        DependencyError,
        '[foo]: Bad dependency: bad type'
      ).with.property('error').to.be.an.instanceof(BadDependencyError);
    });

    it('should failed to validate missing injected dependencies', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      expect(() => injector.validate(originalObject)).to.throw(
        DependencyError,
        '[foo]: Dependency has not been injected'
      ).with.property('error').to.be.an.instanceof(MissingDependencyError);
    });

    it('should validate injected depencies when no needed dependencies is defined', () => {
      const validatedValue = injector.validate({foo: 'bar'});

      expect(validatedValue.foo).to.equal('bar');
    });

    it('should handle needed dependencies definition function', () => {
      const originalObject = {
        need: function need() {
          return {
            foo: {
              type: 'string'
            }
          };
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'bar'
      );

      const validatedValue = injector.validate(injectedObject);

      expect(validatedValue.foo).to.equal('bar');
    });

    it('should forward unexpected values retrieving error as unexpected error', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'failed'
      );

      expect(() => injector.validate(injectedObject)).to.throw(UnexpectedError, 'Unexpected error (failed)');
    });

    it('should forward unexpected validation error as unexpected error', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      const injectedObject = injector.inject(
        originalObject,
        'foo',
        'unexpected'
      );

      expect(() => injector.validate(injectedObject)).to.throw(UnexpectedError, 'Unexpected error (unexpected)');
    });

    it('should check injection definer input value', () => {
      const object = {
        need: {
          foo: {
            type: true
          }
        }
      };

      object.foo = 'bar';

      expect(() => injector.validate(object)).to.throw(
        DependencyError,
        '[foo]: Bad need definition: bad type'
      ).with.property('error').to.be.an.instanceof(BadDefinitionError);
    });

    it('should replace injected dependency with validated ones', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string',
            default: 'bar'
          }
        }
      };

      originalObject.foo = '';

      const validatedObject = injector.validate(originalObject);

      expect(validatedObject.foo).to.equal('bar');
    });

    it('should respect immutability', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string',
            default: 'bar'
          }
        }
      };

      originalObject.foo = '';

      const validatedObject = injector.validate(originalObject);

      expect(validatedObject).to.not.equal(originalObject);
      expect(validatedObject.foo).to.equal('bar');
      expect(originalObject.foo).to.equal('');
    });

    it('should handle proxified values', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string',
            default: 'bar',
            proxy: true
          }
        }
      };

      originalObject.foo = '';

      const validatedObject = injector.validate(originalObject);

      expect(validatedObject.foo).to.equal('bar');
    });
  });

  describe('"injectSet" method', () => {
    it('should inject a set of dependencies to an object', () => {
      const injectedObject = injector.injectSet(
        {},
        {
          foo: 'bar',
          bar: 2
        }
      );

      expect(injectedObject.foo).to.equal('bar');
    });

    it('should be immutable for the original object', () => {
      const originalObject = {
        f: function f() {
          return this.foo || 'foo';
        }
      };

      const injectedObject = injector.injectSet(
        originalObject,
        {
          foo: 'bar',
          bar: 2
        }
      );

      expect(originalObject.f()).to.equal('foo');
      expect(injectedObject.f()).to.equal('bar');
    });

    it('should allow to specify needed dependency property name where to store the value', () => {
      const originalObject = {
        need: {
          foo: {
            property: true
          },
          bar: {}
        }
      };

      const injectedObject = injector.injectSet(
        originalObject,
        {
          foo: 'bar',
          bar: 2
        }
      );

      expect(originalObject._foo).to.equal(undefined); // eslint-disable-line no-underscore-dangle
      expect(injectedObject._foo).to.equal('bar'); // eslint-disable-line no-underscore-dangle
      expect(injectedObject.foo).to.equal(undefined);
      expect(originalObject.bar).to.equal(undefined);
      expect(injectedObject._bar).to.equal(undefined); // eslint-disable-line no-underscore-dangle
      expect(injectedObject.bar).to.equal(2); // eslint-disable-line no-underscore-dangle
    });

    it('should handle needed dependencies definition function', () => {
      const originalObject = {
        need: function need() {
          return {
            foo: {
              property: true
            }
          };
        }
      };

      const injectedObject = injector.injectSet(
        originalObject,
        {
          foo: 'bar'
        }
      );

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject._foo).to.equal('bar'); // eslint-disable-line no-underscore-dangle
    });

    it('should failed to inject not needed dependency', () => {
      const originalObject = {
        need: {
          foo: {},
          bar: {}
        }
      };

      expect(() => injector.injectSet(
        originalObject,
        {
          foo: 'bar',
          bar: 2,
          dumb: 4
        }
      )).to.throw(
        DependencyError,
        '[dumb]: Dependency is not defined in the list of needed dependencies [\'foo\', \'bar\']'
      ).with.property('error').to.be.an.instanceof(NotDefinedDependencyError);
    });

    it('should inject not needed dependency without processing injection definers if no needed dependency is defined', () => {
      const originalObject = {};

      const injectedObject = injector.injectSet(
        originalObject,
        {
          foo: 'bar',
          bar: 2
        }
      );

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject.foo).to.equal('bar');
    });

    it('should validate injected dependencies', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'number'
          }
        }
      };

      const validatedValue = injector.injectSet(
        originalObject,
        {
          foo: 'bar',
          bar: 2
        },
        true
      );

      expect(validatedValue.foo).to.equal('bar');
      expect(validatedValue.bar).to.equal(2);
    });

    it('should failed to validate bad injected dependencies', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'number'
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar',
            bar: 'foo'
          },
          true
        );
      }).to.throw(
        DependencyError,
        '[bar]: Bad dependency: bad type'
      ).with.property('error').to.be.an.instanceof(BadDependencyError);
    });

    it('should failed to validate missing injected dependencies', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'number'
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar'
          },
          true
        );
      }).to.throw(
        DependencyError,
        '[bar]: Dependency has not been injected'
      ).with.property('error').to.be.an.instanceof(MissingDependencyError);
    });

    it('should validate injected depencies when no needed dependencies is defined', () => {
      const validatedValue = injector.injectSet(
        {},
        {
          foo: 'bar'
        },
        true
      );


      expect(validatedValue.foo).to.equal('bar');
    });

    it('should handle needed dependencies definition function', () => {
      const originalObject = {
        need: function need() {
          return {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'number'
            }
          };
        }
      };

      const validatedValue = injector.injectSet(
        originalObject,
        {
          foo: 'bar',
          bar: 2
        },
        true
      );

      expect(validatedValue.foo).to.equal('bar');
      expect(validatedValue.bar).to.equal(2);

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar',
            bar: 'foo'
          },
          true
        );
      }).to.throw(
        DependencyError,
        '[bar]: Bad dependency: bad type'
      ).with.property('error').to.be.an.instanceof(BadDependencyError);
    });

    it('should forward unexpected values retrieving error as unexpected error', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'failed'
          },
          true
        );
      }).to.throw(UnexpectedError, 'Unexpected error (failed)');
    });

    it('should forward unexpected validation error as unexpected error', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'unexpected'
          },
          true
        );
      }).to.throw(UnexpectedError, 'Unexpected error (unexpected)');
    });

    it('should check injection definer input value', () => {
      const originalObject = {
        need: {
          foo: {
            type: true
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar'
          },
          true
        );
      }).to.throw(
        DependencyError,
        '[foo]: Bad need definition: bad type'
      ).with.property('error').to.be.an.instanceof(BadDefinitionError);
    });

    it('should forward unexpected injection definer input value error as unexpected error', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'unexpected'
          },
          true
        );
      }).to.throw(UnexpectedError, 'Unexpected error (unexpected)');
    });

    it('should forward unexpected injection definer validated value retrieving error as unexpected error', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string'
          }
        }
      };

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'unexpected value'
          },
          true
        );
      }).to.throw(UnexpectedError, 'Unexpected error (unexpected value)');
    });

    it('should replace injected dependency with validated ones', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string',
            default: 'bar'
          }
        }
      };

      const validatedObject = injector.injectSet(originalObject, {foo: ''}, true);

      expect(validatedObject.foo).to.equal('bar');
    });

    it('should respect immutability', () => {
      const originalObject = {
        need: {
          foo: {
            type: 'string',
            default: 'bar'
          }
        }
      };

      const injectedObject = injector.injectSet(originalObject, {foo: ''});

      expect(injectedObject).to.not.equal(originalObject);

      const validatedObject = injector.injectSet(originalObject, {foo: ''}, true);

      expect(validatedObject).to.not.equal(originalObject);
      expect(validatedObject.foo).to.equal('bar');
      expect(injectedObject.foo).to.equal('');
      expect(originalObject.foo).to.equal(undefined);
    });
  });
});
