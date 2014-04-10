var expect = require('expect.js');

describe('behind-times', function () {
  it('is a function', function () {
    var behind = require('..');
    expect(behind).to.be.a('function');
    expect(behind.length).to.equal(0);
  });
});
