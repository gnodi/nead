'use strict';

const expect = require('../../expect');
const InterfaceInjectionDefiner = require('../../../src/injection-definers/Interface');
const BadDependencyError = require('../../../src/errors/BadDependency');
const InaccessibleMemberError = require('../../../src/errors/InaccessibleMember');

const injectionDefiner = new InterfaceInjectionDefiner();

class Foo {
  f() { return 'foo'; }
  get plop() { return this.a; }
  set plop(value) { this.a = value; }
}
const foo = new Foo();
foo.a = 'plop';
foo.g = function g() { return 'bar'; };
foo.plip = 'plip';
Object.defineProperty(foo, 'plap', {
  get: function get() { return 'plap'; }
});
Object.defineProperty(foo, 'plup', {
  set: function set() { this.b = 'plup'; }
});

describe('InterfaceInjectionDefiner', () => {
  describe('"schema" getter', () => {
    it('should retrieve validation schema for property definition', () => {
      expect(injectionDefiner.schema).to.deep.equal({
        type: 'object',
        required: false,
        properties: {
          methods: {
            type: Array,
            items: {
              type: 'string'
            },
            default: []
          },
          getters: {
            type: Array,
            items: {
              type: 'string'
            },
            default: []
          },
          setters: {
            type: Array,
            items: {
              type: 'string'
            },
            default: []
          }
        }
      });
    });
  });

  describe('"getValues" method', () => {
    it('should return not altered input values', () => {
      const values = [1, 2, 3];
      const injectedValues = injectionDefiner.getValues(values, {});

      expect(injectedValues).to.equal(values);
    });
  });

  describe('"validate" method', () => {
    it('should validate value on all implemented interface methods', () => {
      const validatedValue = injectionDefiner.validate(foo, {
        methods: ['f', 'g'],
        getters: [],
        setters: []
      });

      expect(validatedValue.f()).to.equal('foo');
      expect(validatedValue.g()).to.equal('bar');
    });

    it('should fail to validate value on missing implemented interface method', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: ['f', 'g', 'h'],
        getters: [],
        setters: []
      })).to.throw(
        BadDependencyError,
        'Bad dependency: Expected an object implementing [f, g, h] methods (missing: h), [] getters, [] setters, got object instead'
      );
    });

    it('should validate value on all implemented interface getters', () => {
      const validatedValue = injectionDefiner.validate(foo, {
        methods: [],
        getters: ['plop', 'plap'],
        setters: []
      });

      expect(validatedValue.plop).to.equal('plop');
      expect(validatedValue.plap).to.equal('plap');
    });

    it('should fail to validate value on missing implemented interface getter', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: [],
        getters: ['plop', 'plap', 'plep'],
        setters: []
      })).to.throw(
        BadDependencyError,
        'Bad dependency: Expected an object implementing [] methods, [plop, plap, plep] getters (missing: plep), [] setters, got object instead'
      );
    });

    it('should validate value on all implemented interface setters', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: [],
        getters: [],
        setters: ['plop', 'plup']
      })).to.not.throw(Error);
    });

    it('should fail to validate value on missing implemented interface setter', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: [],
        getters: [],
        setters: ['plop', 'plup', 'plep']
      })).to.throw(
        BadDependencyError,
        'Bad dependency: Expected an object implementing [] methods, [] getters, [plop, plup, plep] setters (missing: plep), got object instead'
      );
    });

    it('should validate value on all implemented interface', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: ['f'],
        getters: ['plop', 'plap'],
        setters: ['plop', 'plup']
      })).to.not.throw(Error);
    });

    it('should fail to validate value on missing implemented interface', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: ['f', 'h', 'i'],
        getters: ['plop', 'plep'],
        setters: ['plop', 'plep']
      })).to.throw(
        BadDependencyError,
        'Bad dependency: Expected an object implementing [f, h, i] methods (missing: h, i), [plop, plep] getters (missing: plep), [plop, plep] setters (missing: plep), got object instead'
      );
    });

    it('should not validate simple value as getter', () => {
      expect(() => injectionDefiner.validate(foo, {
        methods: [],
        getters: ['plip'],
        setters: []
      })).to.throw(
        BadDependencyError,
        'Bad dependency: Expected an object implementing [] methods, [plip] getters (missing: plip), [] setters, got object instead'
      );
    });

    it('should restrict object visibility', () => {
      const validatedValue = injectionDefiner.validate(foo, {
        methods: ['f'],
        getters: ['plap'],
        setters: ['plop']
      });

      expect(() => validatedValue.g()).to.throw(
        InaccessibleMemberError,
        '\'g\' member of \'Foo\' is behind an interface and is therefore inaccessible'
      );
      expect(() => { validatedValue.plap = 'plop'; }).to.throw(
        InaccessibleMemberError,
        '\'plap\' member of \'Foo\' is behind an interface and is therefore inaccessible'
      );
      expect(() => validatedValue.plop).to.throw(
        InaccessibleMemberError,
        '\'plop\' member of \'Foo\' is behind an interface and is therefore inaccessible'
      );
      expect(validatedValue.f()).to.equal('foo');
      expect(validatedValue.plap).to.equal('plap');
      validatedValue.plop = 'plyp';
    });

    it('should not process null value', () => {
      const validatedValue = injectionDefiner.validate(null, {
        methods: ['f', 'g'],
        getters: [],
        setters: []
      });

      expect(validatedValue).to.equal(null);
    });

    it('should not process undefined value', () => {
      const validatedValue = injectionDefiner.validate(undefined, {
        methods: ['f', 'g'],
        getters: [],
        setters: []
      });

      expect(validatedValue).to.equal(undefined);
    });

    it('should not process undefined value', () => {
      expect(() => injectionDefiner.validate('foo', {
        methods: ['f', 'g'],
        getters: [],
        setters: []
      })).to.throw(
        BadDependencyError,
        'Bad dependency: Expected an object, got string instead'
      );
    });
  });

  describe('"getValidatedDependency" method', () => {
    it('should return original value', () => {
      const value = {};
      const changeMap = new Map();
      changeMap.set(value, {foo: 'bar'});
      const validatedValue = injectionDefiner.getValidatedDependency(value, changeMap);

      expect(value).to.equal(validatedValue);
    });
  });
});
