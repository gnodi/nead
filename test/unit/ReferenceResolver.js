'use strict';

// Force tests execution order.
require('./errors/UnmergeableReferences');
require('./errors/UnresolvableReference');

const expect = require('../expect');
const ReferenceResolver = require('../../src/ReferenceResolver');
const UnmergeableReferences = require('../../src/errors/UnmergeableReferences');
const UnresolvableReference = require('../../src/errors/UnresolvableReference');

const referenceResolver = new ReferenceResolver();

describe('ReferenceResolver', () => {
  describe('"find" method', () => {
    it('should find a reference string in a string value', () => {
      const references = referenceResolver.find('#foo');

      expect(references).to.deep.equal(['foo']);
    });

    it('should find reference strings in a string value', () => {
      const references = referenceResolver.find('#foo#bar#foobar');

      expect(references).to.deep.equal(['foo', 'bar', 'foobar']);
    });

    it('should not find a reference in a standard string', () => {
      const references = referenceResolver.find('foo#bar');

      expect(references).to.deep.equal([]);
    });

    it('should handle reference escaping', () => {
      const references = referenceResolver.find('##foo');

      expect(references).to.deep.equal([]);
    });

    it('should handle reference escaping for reference like string', () => {
      const references = referenceResolver.find('###foo');

      expect(references).to.deep.equal([]);
    });

    it('should handle multi references escaping', () => {
      const references = referenceResolver.find('#foo##bar#foobar');

      expect(references).to.deep.equal(['foo##bar', 'foobar']);
    });

    it('should find reference strings embedded in an object', () => {
      const references = referenceResolver.find({
        foo: {
          bar: {
            plop: '#plip#plap##plup',
            foobar: {
              plep: '#plyp',
              no: 'ref'
            }
          }
        }
      });

      expect(references).to.deep.equal(['plip', 'plap##plup', 'plyp']);
    });

    it('should not find reference strings embedded in an abstraction object', () => {
      const Foo = {
        plop: '#plip'
      };
      const foo = Object.create(Foo);
      foo.plep = '#plyp';

      const references = referenceResolver.find({
        foo: {
          bar: foo,
          plap: '#plup'
        }
      });

      expect(references).to.deep.equal(['plup']);
    });
  });

  describe('"build" method', () => {
    it('should build reference map from a value', () => {
      const references = referenceResolver.build('foo', 'bar');

      expect(references).to.deep.equal({foo: 'bar'});
    });

    it('should build reference map from an object value', () => {
      const references = referenceResolver.build('foo', {
        plop: 'plop',
        plip: {
          plap: {
            plup: 'plep'
          }
        }
      });

      expect(references).to.deep.equal({
        foo: {
          plop: 'plop',
          plip: {
            plap: {
              plup: 'plep'
            }
          }
        },
        'foo.plop': 'plop',
        'foo.plip': {
          plap: {
            plup: 'plep'
          }
        },
        'foo.plip.plap': {
          plup: 'plep'
        },
        'foo.plip.plap.plup': 'plep'
      });
    });

    it('should handle an embeded limit to avoid cyclic dependency infinite loop', () => {
      const foo = {};
      const bar = {foo};
      foo.bar = bar;

      const references = referenceResolver.build('foo', foo);

      expect(Object.keys(references).length).to.equal(21);
    });

    it('should look into prototypal chain', () => {
      const foo = {plop: 'plip'};
      const bar = Object.create(foo);
      bar.plap = 'plup';

      const references = referenceResolver.build('bar', bar);

      expect(references).to.deep.equal({
        bar: {
          plop: 'plip',
          plap: 'plup'
        },
        'bar.plop': 'plip',
        'bar.plap': 'plup'
      });
    });
  });
  describe('"resolve" method', () => {
    it('should resolve a reference string from a reference map', () => {
      const resolvedValue = referenceResolver.resolve('#foo', {foo: 'bar'});

      expect(resolvedValue).to.deep.equal('bar');
    });

    it('should resolve reference strings inside an object', () => {
      const resolvedValue = referenceResolver.resolve(
        {
          plop: {
            plip: {
              plap: '#foo'
            }
          },
          plup: '#bar'
        },
        {
          foo: 'bar',
          bar: 'foo'
        }
      );

      expect(resolvedValue).to.deep.equal({
        plop: {
          plip: {
            plap: 'bar'
          }
        },
        plup: 'foo'
      });
    });

    it('should resolve reference in an immutable way', () => {
      const originalValue = {
        foo: '#bar'
      };
      const resolvedValue = referenceResolver.resolve(
        originalValue,
        {bar: 'foo'}
      );

      expect(resolvedValue).to.deep.equal({foo: 'foo'});
      expect(resolvedValue).to.not.equal(originalValue);
    });

    it('should merge string references', () => {
      const resolvedValue = referenceResolver.resolve(
        '#foo#bar',
        {
          foo: 'bar',
          bar: 'foo'
        }
      );

      expect(resolvedValue).to.deep.equal('barfoo');
    });

    it('should merge object references', () => {
      const resolvedValue = referenceResolver.resolve(
        '#foo#bar',
        {
          foo: {plop: 'plip'},
          bar: {plap: 'plup'}
        }
      );

      expect(resolvedValue).to.deep.equal({
        plop: 'plip',
        plap: 'plup'
      });
    });

    it('should merge complex object references', () => {
      function Foo() {
      }
      Foo.prototype.foo = 'foo';
      function Bar() {
        this.bar = 'bar';
      }
      let resolvedValue = referenceResolver.resolve(
        '#foo#bar',
        {
          foo: new Foo(),
          bar: new Bar()
        }
      );

      expect(resolvedValue.foo).to.equal('foo');
      expect(resolvedValue.bar).to.equal('bar');

      resolvedValue = referenceResolver.resolve(
        '#bar#foo',
        {
          foo: new Foo(),
          bar: new Bar()
        }
      );

      expect(resolvedValue.foo).to.equal('foo');
      expect(resolvedValue.bar).to.equal('bar');
    });

    it('should fail to resolve missing references', () => {
      expect(() => referenceResolver.resolve(
        '#foo',
        {bar: 'foo'}
      )).to.throw(UnresolvableReference, 'Cannot resolve \'foo\' reference');
    });

    it('should fail to merge incompatible references', () => {
      expect(() => referenceResolver.resolve(
        '#foo#bar',
        {
          foo: {plop: 'plip'},
          bar: 'foo'
        }
      )).to.throw(UnmergeableReferences, 'Cannot merge [\'foo\', \'bar\'] references');
    });
  });
});
