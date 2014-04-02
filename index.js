var _ = require('lodash');
var join = require('path').join;

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

function getDependencies() {
  var workingDirectory = process.cwd();
  var packageFilename = join(workingDirectory, 'package.json');

  var workingPackage = require(packageFilename);
  var dependencies = workingPackage.dependencies || {};
  var devDependencies = workingPackage.devDependencies || {};

  var deps = toNameVersion(dependencies).concat(toNameVersion(devDependencies));
  return deps;
}

var deps = getDependencies();
console.dir(deps);
