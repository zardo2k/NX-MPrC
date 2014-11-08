var FireBase = require('firebase');
var fireBaseConfig = require('./Config.js').firebaseConfig

var fbRootPath = new FireBase(fireBaseConfig.rootPath);
var fbClusters = fbRootPath.child('Clusters');
var fbClusterStats = fbRootPath.child('ClusterStats');


module.exports.fbClusters = fbClusters;
module.exports.fbClusterStats = fbClusterStats;