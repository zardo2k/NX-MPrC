var NXRequest = require('./NXRequest.js').NXRequest;
var NXFirebase = require('./NXFirebase');
var ClusterStats = require('./ClusterStats.js').ClusterStats;
var ClusterVMs = require('./ClusterVMs.js').ClusterVMs;
var ClusterContainers = require('./ClusterContainers.js').ClusterContainers;
var ClusterAlerts = require('./ClusterAlerts.js').ClusterAlerts;
var ClusterHosts = require('./ClusterHosts.js').ClusterHosts;
var Utils = require('./Utils.js');

function Cluster(clusterConfig) {
  this.host = clusterConfig.host;
  this.port = clusterConfig.port;
  this.username = clusterConfig.username;
  this.password = clusterConfig.password;
  this.clusterUuid = null;
  this.clusterEntity = null;
  this.clusterStats = null;
  this.isReady = false;

  this.nxRequest = new NXRequest(this.host, this.port,
      this.username, this.password)

  this.syncData();
  setInterval(this.syncData.bind(this), 30000);
}

module.exports.Cluster = Cluster;

// Fetch Cluster data via REST and update the
// data on Firebase.
Cluster.prototype.syncData = function() {
  console.log('Cluster.syncData()');
  var _this = this;
  this.nxRequest.getClusters(function(error, res, body) {
    if (error) {
      console.log(error)
      return;
    }

    if (res.statusCode != 200) {
      console.error('ERROR: statusCode: ' + res.statusCode);
      console.error('statusMessage: ' + res.statusMessage);
      return;
    }

    var clusterObj = JSON.parse(body);
    if (clusterObj.entities.length > 1) {
      console.error('ERROR: Multicluster is not supported');
      return;
    }

    var cluster = clusterObj.entities[0];
    // Our usageStats contains keys with '.' in the name.
    // This will make all the '.' to '_'.
    cluster.usageStats = Utils.cleanKeyStrings(cluster.usageStats);

    var data = {};
    data[cluster.clusterUuid] = cluster;
    NXFirebase.fbClusters.update(data, function(error) {
      if (error) {
        console.error('ERROR: problem updating data');
      }
    });

    if (!_this.isReady) {
      _this.clusterEntity = cluster;
      _this.clusterUuid = cluster.clusterUuid;
      _this.isReady = true;
      _this.onReady();
    } else {
      _this.clusterEntity = cluster;
      _this.clusterUuid = cluster.clusterUuid;
    }

  });
}

// Register Firebase listener
Cluster.prototype.startListenFbChange = function() {
  var _this = this;
  // Listen for Cluster change on Firebase.
  NXFirebase.fbClusters.child(this.clusterUuid).on('child_changed',
      this.onFBChange, this);
};

// When FB Cluster data changed this will be triggered.
// snapshotData : Firebase DataSnapshot object.
Cluster.prototype.onFBChange = function(dataSnapshot) {
  console.log('Cluster.onFBChange() ' + this.clusterUuid);

  console.log('Key : ' + dataSnapshot.key());
  if (dataSnapshot.key() === 'usageStats' ||
      dataSnapshot.key() === 'stats') {
    console.log('Skipped updating of ' + dataSnapshot.key());
    return;
  }

  console.log(dataSnapshot.val());

  var putData = {};
  putData[dataSnapshot.key()] = dataSnapshot.val();
  this.nxRequest.putCluster(putData,
      function(a, b, c) {
        console.log(c);
      })
}

Cluster.prototype.startTasksListener = function() {
  var _this = this;
  NXFirebase.fbTasksNew.child('Clusters').child(this.clusterUuid)
      .on('child_added', function(dataSnapshot) {
    console.log('New Tasks ' + this.clusterUuid);
    console.log(dataSnapshot.val());
    this.nxRequest.putCluster(dataSnapshot.val(),
        function(a, b, c) {
          NXFirebase.fbTasksFinished.child('Clusters').child(_this.clusterUuid)
              .child(dataSnapshot.key()).set(dataSnapshot.val());
          dataSnapshot.ref().remove();
          _this.syncData();
        });
  }, this);
};

// This is trigger when the cluster object is ready.
// This should only be called once.
Cluster.prototype.onReady = function(callback) {
  var _this = this;
  console.log('READY');
  console.log(this.clusterUuid);

  this.startListenFbChange();
  this.startTasksListener();

  this.clusterStats = new ClusterStats(this.clusterUuid,
      this.clusterEntity.stats, this.nxRequest);

  this.vms = new ClusterVMs(this.clusterUuid, this.nxRequest);

  this.containers = new ClusterContainers(this.clusterUuid, this.nxRequest);

  // this.alerts = new ClusterAlerts(this.clusterUuid, this.nxRequest);

  this.hosts = new ClusterHosts(this.clusterUuid, this.nxRequest);
}

