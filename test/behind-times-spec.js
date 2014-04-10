var expect = require('expect.js');
var mockery = require('mockery');
var sinon = require('sinon');

describe('behind-times', function () {

  describe('default behavior', function () {
    var behind = require('..');

    it('is a function', function () {
      expect(behind).to.be.a('function');
      expect(behind.length).to.equal(1);
    });

    it('looks for package.json', function () {
      expect(function () {
        behind('somehere.json');
      }).to.throwError();
    });
  });

  describe('mocked dependencies', function () {

    var behind;

    beforeEach(function () {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
      function mockDeps(filename) {
        if (filename === 'empty') {
          return [];
        } else if (filename === 'one') {
          return [{
            name: 'fake-dep',
            version: '1.0.0'
          }];
        }
      }
      mockery.registerMock('./src/deps', mockDeps);
      behind = require('..');
    });

    afterEach(function () {
      mockery.deregisterAll();
      mockery.disable();
    });

    it('mocks loading deps module', function () {
      function empty() {
        return {};
      }
      var spy = sinon.spy(empty);

      mockery.registerMock('./src/deps', spy);
      var m = require('./src/deps');
      expect(m).to.be.a('function');
      expect(m()).to.be.empty();
      expect(spy.calledOnce).to.be.ok();
    });

    it('does nothing for zero dependencies', function (done) {
      behind('empty').then(function (n) {
        expect(n).to.be(0);
      }).fail(function () {
        expect.toFail();
      }).fin(done);
    });
  });
});
