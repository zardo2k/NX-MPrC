var FireBase = require('firebase');
var fireBaseConfig = require('./Config.js').firebaseConfig

var fbRootPath = new FireBase(fireBaseConfig.rootPath);
var fbClusters = fbRootPath.child('Clusters');
var fbClusterAlerts = fbRootPath.child('ClusterAlerts');
var fbClusterStats = fbRootPath.child('ClusterStats');
var fbClusterVMs = fbRootPath.child('ClusterVMs');
var fbClusterContainers = fbRootPath.child('Containers');
var fbTasksNew = fbRootPath.child('Tasks/New');
var fbTasksFinished = fbRootPath.child('Tasks/Finished');

module.exports.fbClusters = fbClusters;
module.exports.fbClusterAlerts = fbClusterAlerts;
module.exports.fbClusterStats = fbClusterStats;
module.exports.fbClusterVMs = fbClusterVMs;
module.exports.fbTasksNew = fbTasksNew;
module.exports.fbTasksFinished = fbTasksFinished;
module.exports.fbClusterContainers = fbClusterContainers;

// Listeners

//fbClusters.child('name').on('value', function(snapshot) {
//  console.log(snapshot.val());
//
//});