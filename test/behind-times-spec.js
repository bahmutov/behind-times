var expect = require('expect.js');
var mockery = require('mockery');
var sinon = require('sinon');
var q = require('q');
var verify = require('check-types').verify;
var _ = require('lodash');

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
        } else if (filename === 'two') {
          return [{
            name: 'fake-dep1'
          }, {
            name: 'fake-dep2'
          }];
        } else {
          throw new Error('Invalid mock filename ' + filename);
        }
      }
      function mockAvailable(dep) {
        verify.unemptyString(dep.name, 'missing dependency name');
        var registry = {
          'fake-dep': {
            versions: ['1.0.0', '2.0.0']
          },
          'fake-dep1': {
            versions: ['1.0.0', '2.0.0']
          },
          'fake-dep2': {
            versions: ['3.0.0']
          }
        };

        var info = registry[dep.name];
        if (!info) {
          throw new Error('Cannot find in registry ' + dep.name);
        }
        return q({
          name: dep.name,
          versions: _.difference(info.versions, [dep.version])
        });
      }
      mockery.registerMock('./src/deps', mockDeps);
      mockery.registerMock('available-versions', mockAvailable);
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

    it('does nothing for zero dependencies', function () {
      return behind('empty').then(function (n) {
        expect(n).to.be(0);
      });
    });

    it('grabs one available dependency', function () {
      return behind('one').then(function (n) {
        expect(n).to.equal(1);
      });
    });

    it('grabs two available dependencies', function () {
      return behind('two').then(function (n) {
        expect(n).to.equal(3);
      });
    });
  });
});
