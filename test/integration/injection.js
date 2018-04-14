'use strict';

const expect = require('../expect');
const nead = require('../..');

describe('nead', () => {
  describe('"inject" method', () => {
    it('should inject property to an object', () => {
      const injectedObject = nead.inject(
        {},
        'foo',
        'bar'
      );
      expect(injectedObject.foo).to.equal('bar');
    });
  });
});
