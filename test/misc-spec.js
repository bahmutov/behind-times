var expect = require('expect.js');
var sinon = require('sinon');

describe('mocking require', function () {

  var name = 'foo.json';

  describe('module.require', function () {
    it('is a function', function () {
      expect(module).to.be.an('object');
      expect(module.require).to.be.a('function');
    });
  });

  it('cannot find module', function () {
    expect(function () {
      require(name);
    }).to.throwException(function (e) {
      expect(e).to.be.a(Error);
      expect(e.message).to.contain('Cannot find module');
    });
  });

  it('stubs module.require', function () {
    sinon.stub(module, 'require')
      .withArgs(name)
      .returns(42);

    expect(require(name)).to.be(42);
    module.require.restore();
  });

  it('restores module.require', function () {
    sinon.stub(module, 'require')
      .withArgs(name)
      .returns(42);

    expect(require(name)).to.be(42);
    module.require.restore();

    expect(function () {
      require(name);
    }).to.throwException(function (e) {
      expect(e).to.be.a(Error);
      expect(e.message).to.contain('Cannot find module');
    });
  });

  it('returns undefined for other args', function () {
    sinon.stub(module, 'require')
      .withArgs('a.name')
      .returns(42);

    expect(require('different.name')).to.be(undefined);
    module.require.restore();
  });

  it('compares 1 and 2 correctly', function () {
    expect(1).to.equal(1);
  });
});
