var FireBase = require('firebase');
var fireBaseConfig = require('./Config.js').firebaseConfig

var fbRootPath = new FireBase(fireBaseConfig.rootPath);
var fbClusters = fbRootPath.child('Clusters');
var fbClusterAlerts = fbRootPath.child('ClusterAlerts');
var fbClusterHosts = fbRootPath.child('ClusterHosts');
var fbClusterStats = fbRootPath.child('ClusterStats');
var fbClusterVMs = fbRootPath.child('ClusterVMs');
var fbClusterContainers = fbRootPath.child('ClusterContainers');
var fbTasksNew = fbRootPath.child('Tasks/New');
var fbTasksFinished = fbRootPath.child('Tasks/Finished');
var fbClustersSummary = fbRootPath.child('ClustersSummary');
var fbClusterStoragePools = fbRootPath.child('ClusterStoragePools');
var fbSummary = fbRootPath.child('Summary');

module.exports.fbClusters = fbClusters;
module.exports.fbClusterAlerts = fbClusterAlerts;
module.exports.fbClusterStats = fbClusterStats;
module.exports.fbClusterHosts = fbClusterHosts;
module.exports.fbClusterVMs = fbClusterVMs;
module.exports.fbTasksNew = fbTasksNew;
module.exports.fbTasksFinished = fbTasksFinished;
module.exports.fbClusterContainers = fbClusterContainers;
module.exports.fbClustersSummary = fbClustersSummary;
module.exports.fbClusterStoragePools = fbClusterStoragePools;

// Listeners

//fbClusters.child('name').on('value', function(snapshot) {
//  console.log(snapshot.val());
//
//});