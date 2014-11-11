'use strict';
var Clusters = require('./Clusters.js').Clusters;
var NXRequest = require('./NXRequest.js').NXRequest;
var clusterConfigs = require('./Config.js').clusterConfigs;

// The usageStats object contain keys that has '.'
// in the name.  Firebase doesn't like with with '.'.
// This function will convert any '.' in the keys string
// to '_'.
// Returns a cleaned object.
// NOTE: This doesn't work on nested object.
function cleanKeyStrings(anObject) {
  var cleanedObject = {}
  Object.keys(anObject).forEach(function(key){
    cleanedObject[key.replace(/\./g,'_')] = anObject[key];
  });
  return cleanedObject;
}

var clusters  = new Clusters(clusterConfigs);