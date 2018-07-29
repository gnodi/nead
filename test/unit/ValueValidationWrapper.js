'use strict';

const expect = require('../expect');
const ValueValidationWrapper = require('../../src/ValueValidationWrapper');

const wrapper = new ValueValidationWrapper('item');

describe('ValueValidationWrapper', () => {
  describe('"wrap" methods', () => {
    it('should return a validation wrapped value', () => {
      const value = {foo: 'bar'};
      const wrappedValue = wrapper.wrap(value, (validatedValue, proxy) =>
        Object.assign({}, proxy, validatedValue)
      );

      expect(wrappedValue.isWrappedValue).to.equal(true);
      expect(wrappedValue.value).to.equal(value);
      expect(wrappedValue.setValidatedValue({bar: 'foo'})).to.deep.equal({
        foo: 'bar',
        bar: 'foo'
      });
    });
  });
});
