require('console.table');

var getDependencies = require('./src/deps');
var _ = require('lodash');
var available = require('available-versions');
var q = require('q');
q.longStackSupport = true;
var check = require('check-types');
var verify = check.verify;

function fetchAvailableVersions(deps) {
  var silent = true;
  var getAvailable = deps.map(function (dep) {
    return function () {
      return available(dep, silent).then(function (dependencyInfo) {
        verify.array(dependencyInfo.versions, 'expected array of new versions for module ' +
          dep.name + 'instead got ' + JSON.stringify(dependencyInfo, null, 2));
        dep.available = dependencyInfo.versions;
        dep.behind = dependencyInfo.versions.length;
      });
    };
  });
  return getAvailable.reduce(q.when, q());
}

function behindTimes(filename) {
  var deps = getDependencies(filename);
  return fetchAvailableVersions(deps).then(function () {
    console.table(deps);
    var totalVersionsBehind = _.reduce(deps, function (sum, dep) {
      return sum + dep.behind;
    }, 0);
    console.log('%d versions behind', totalVersionsBehind);
    return totalVersionsBehind;
  });
}

module.exports = behindTimes;
