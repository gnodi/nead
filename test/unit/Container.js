'use strict';

const expect = require('../expect');
const Container = require('../../src/Container');

const validator = require('../fixtures/validator');
const serviceDefinitionFactory = require('../fixtures/serviceDefinitionFactory');

const container = new Container();

describe('Container', () => {
  describe('"validator" setter', () => {
    it('should accept a validator', () => {
      container.validator = validator;
    });

    it('should only accept a validator', () => {
      expect(() => { container.validator = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"setDefinitionFactory" method', () => {
    it('should set a definition factory', () => {
      container.setDefinitionFactory('service', serviceDefinitionFactory);
    });

    it('should only accept a name as first argument', () => {
      expect(
        () => { container.setDefinitionFactory(1, serviceDefinitionFactory); }
      ).to.throw(TypeError);
    });

    it('should only accept a definition factory as second argument', () => {
      expect(
        () => { container.setDefinitionFactory('property', 'bar'); }
      ).to.throw(TypeError);
    });
  });

  describe('"create" method', () => {
  });
});
