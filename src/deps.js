var _ = require('lodash');
var join = require('path').join;
var read = require('fs').readFileSync;
var check = require('check-types');

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

function loadDependencies(packageFilename) {
  if (!packageFilename) {
    var workingDirectory = process.cwd();
    packageFilename = join(workingDirectory, 'package.json');
  }

  var src = read(packageFilename);
  console.log(src);
  var workingPackage = JSON.parse(src);
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

function getDependencies(filename) {
  var fake = false;
  var deps = (fake ? fakeDependencies() : loadDependencies(filename));
  deps = cleanVersions(deps);
  return deps;
}

module.exports = getDependencies;
