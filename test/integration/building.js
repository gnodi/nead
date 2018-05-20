'use strict';

const expect = require('../expect');
const nead = require('../..');
const Container = require('../../src/Container');

require('./injection');

function Foo() {
}
Foo.prototype.plop = 'plip';

describe('nead', () => {
  describe('"createContainer" method', () => {
    it('should create a new dependency injection container', () => {
      const container = nead.createContainer();
      expect(container).to.be.an.instanceOf(Container);
    });
  });

  describe('container', () => {
    it('should allow to instantiate a service from a definition', () => {
      const container = nead.createContainer();
      container.create('service', 'foo', {
        object: Foo
      });
      container.build();
      const foo = container.get('foo');
      expect(foo).to.be.an.instanceOf(Foo);
      expect(foo.plop).to.equal('plip');
    });
  });
});
