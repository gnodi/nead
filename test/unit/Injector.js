'use strict';

const expect = require('../expect');
const Injector = require('../../src/Injector');
const MissingDependencyError = require('../../src/errors/MissingDependencyError');
const NotDefinedDependencyError = require('../../src/errors/NotDefinedDependencyError');

const validator = require('../fixtures/validator');
const propertyInjectionDefiner = require('../fixtures/propertyInjectionDefiner');
const typeInjectionDefiner = require('../fixtures/typeInjectionDefiner');

const injector = new Injector();

describe('Injector', () => {
  describe('"validator" setter', () => {
    it('should accept a validator', () => {
      injector.validator = validator;
    });

    it('should only accept a validator', () => {
      expect(() => { injector.validator = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"setInjectionDefiner" method', () => {
    it('should set an injection definer', () => {
      injector.setInjectionDefiner('property', propertyInjectionDefiner);
      injector.setInjectionDefiner('type', typeInjectionDefiner);
    });

    it('should only accept a name as first argument', () => {
      expect(
        () => { injector.setInjectionDefiner(1, propertyInjectionDefiner); }
      ).to.throw(TypeError);
    });

    it('should only accept an injection definer as second argument', () => {
      expect(
        () => { injector.setInjectionDefiner('property', 'bar'); }
      ).to.throw(TypeError);
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
        NotDefinedDependencyError,
        '\'dumb\' dependency is not defined in the list of needed dependencies [\'foo\', \'bar\']'
      );
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

      expect(() => injector.validate(injectedObject)).to.not.throw(Error);
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

      expect(() => injector.validate(injectedObject)).to.throw(TypeError, 'bad type');
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
        MissingDependencyError,
        '\'foo\' dependency has not been injected'
      );
    });

    it('should validate injected depencies when no needed dependencies is defined', () => {
      expect(() => injector.validate({})).to.not.throw(Error);
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

      expect(() => injector.validate(injectedObject)).to.not.throw(Error);
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

      expect(originalObject.foo).to.equal(undefined);
      expect(injectedObject._foo).to.equal('bar'); // eslint-disable-line no-underscore-dangle
      expect(originalObject.bar).to.equal(undefined);
      expect(injectedObject._bar).to.equal(2); // eslint-disable-line no-underscore-dangle
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
        NotDefinedDependencyError,
        '\'dumb\' dependency is not defined in the list of needed dependencies [\'foo\', \'bar\']'
      );
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

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar',
            bar: 2
          },
          true
        );
      }).to.not.throw(Error);
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
      }).to.throw(TypeError, 'bad type');
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
        MissingDependencyError,
        '\'bar\' dependency has not been injected'
      );
    });

    it('should validate injected depencies when no needed dependencies is defined', () => {
      expect(() => {
        injector.injectSet(
          {},
          {
            foo: 'bar'
          },
          true
        );
      }).to.not.throw(Error);
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

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar',
            bar: 2
          },
          true
        );
      }).to.not.throw(Error);

      expect(() => {
        injector.injectSet(
          originalObject,
          {
            foo: 'bar',
            bar: 'foo'
          },
          true
        );
      }).to.throw(TypeError, 'bad type');
    });
  });
});
