'use strict';

const expect = require('../../expect');
const InaccessibleMemberError = require('../../../src/errors/InaccessibleMember');

let error;
class Foo {
}
const foo = new Foo();

describe('InaccessibleMemberError', () => {
  describe('constructor', () => {
    it('should build an explicit message from arguments', () => {
      error = new InaccessibleMemberError(foo, 'bar');
      expect(error.message).to.equal('\'bar\' member of \'Foo\' is behind an interface and is therefore inaccessible');
    });
  });
});
