'use strict';

const expect = require('../expect');
const Factory = require('../../src/Factory');
const BadTypeError = require('../../src/errors/BadType');

const injector = require('../fixtures/injector');
const instantiator = require('../fixtures/instantiator');

const factory = new Factory();

describe('Factory', () => {
  describe('"instantiate" method', () => {
    describe('"instantiator" setter', () => {
      it('should accept an instantiator', () => {
        factory.instantiator = instantiator;
      });

      it('should only accept an instantiator', () => {
        expect(() => { factory.instantiator = 'foo'; }).to.throw(BadTypeError);
      });
    });

    describe('"injector" setter', () => {
      it('should accept an injector', () => {
        factory.injector = injector;
      });

      it('should only accept an injector', () => {
        expect(() => { factory.injector = 'foo'; }).to.throw(BadTypeError);
      });
    });

    describe('"setObjectPrototype" method', () => {
      it('should set the object prototype', () => {
        factory.setObjectPrototype({foo: 'bar'});
      });
    });

    describe('"getObjectPrototype" method', () => {
      it('should get the object prototype', () => {
        expect(factory.getObjectPrototype()).to.deep.equal({foo: 'bar'});
      });
    });

    describe('"setDependency" method', () => {
      it('should set a dependency', () => {
        factory.setDependency('foo', 'bar');
        factory.setDependency('bar', 'foo');
        factory.setDependency('bar', 1);
      });
    });

    describe('"create" method', () => {
      it('should create an instance with injected dependencies', () => {
        const instance = factory.create();

        expect(instance).to.deep.equal({
          foo: 'bar',
          bar: 1
        });
      });

      it('should create an instance with specific injected dependencies', () => {
        const instance = factory.create({
          plop: 'plip'
        });

        expect(instance).to.deep.equal({
          foo: 'bar',
          bar: 1,
          plop: 'plip'
        });
      });
    });
  });
});
