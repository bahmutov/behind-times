require('console.table');
var _ = require('lodash');
var join = require('path').join;
var available = require('available-versions');
var q = require('q');
q.longStackSupport = true;
var check = require('check-types');
var verify = check.verify;

function toNameVersion(dependencies) {
  var deps = [];
  _.keys(dependencies).forEach(function (name) {
    deps.push({
      name: name,
      version: dependencies[name]
    });
  });
  return deps;
}

function clean(version) {
  return version.replace(/[~^]/g, '');
}

function cleanVersions(deps) {
  return deps.map(function (dep) {
    if (check.string(dep.version)) {
      dep.version = clean(dep.version);
    }
    return dep;
  });
}

function loadDependencies() {
  var workingDirectory = process.cwd();
  var packageFilename = join(workingDirectory, 'package.json');

  var workingPackage = require(packageFilename);
  var dependencies = workingPackage.dependencies || {};
  var devDependencies = workingPackage.devDependencies || {};

  var deps = toNameVersion(dependencies).concat(toNameVersion(devDependencies));
  return deps;
}

function fakeDependencies() {
  return [{
    name: 'deps-ok',
    version: '0.1.0'
  }, {
    name: 'q',
    version: '0.9.0'
  }];
}

function getDependencies() {
  var fake = false;
  var deps = (fake ? fakeDependencies() : loadDependencies());
  deps = cleanVersions(deps);
  return deps;
}

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

function behindTimes() {
  var deps = getDependencies();
  console.log('Fetching available versions for', deps.length, 'dependencies');
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
