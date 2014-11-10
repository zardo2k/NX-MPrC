var NXRequest = require('./NXRequest.js').NXRequest;
var NXFirebase = require('./NXFirebase');

function Cluster(clusterConfig) {
  this.host = clusterConfig.host;
  this.port = clusterConfig.port;
  this.username = clusterConfig.username;
  this.password = clusterConfig.password;
  this.clusterUuid = null;
  this.clusterEntity = null;

  this.nxRequest = new NXRequest(this.host, this.port,
      this.username, this.password)

  this.syncClusterData();
  setInterval(this.syncClusterData.bind(this), 30000);
}

module.exports.Cluster = Cluster;

Cluster.prototype.syncClusterData = function() {
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
    cluster.usageStats = cleanKeyStrings(cluster.usageStats);

    if (!_this.clusterEntity) {
      _this.clusterEntity = cluster;
      _this.clusterUuid = cluster.clusterUuid;
      _this.onReady();
    } else {
      _this.clusterEntity = cluster;
      _this.clusterUuid = cluster.clusterUuid;
    }

    var data = {};
    data[_this.clusterEntity.clusterUuid] = _this.clusterEntity;
    NXFirebase.fbClusters.update(data);

  });
}
// This is trigger when the cluster object is ready.
Cluster.prototype.onReady = function(callback) {
  var _this = this;
  console.log("READY");
  console.log(this.clusterUuid);

  // Register Firebase listener

  // Listen for Cluster change on Firebase.
  NXFirebase.fbClusters.child(this.clusterUuid).on('child_changed',
      function(snapshot) {
        console.log(snapshot.val());
        var putData = {};
        putData[snapshot.key()] = snapshot.val();
        _this.nxRequest.putCluster(putData,
            function(a, b, c) {
              console.log(c);
            })
      }
  );


  var options = {
    qs: {
      metrics: 'hypervisor_memory_usage_ppm,avg_io_latency_usecs'
    }
  }
  this.nxRequest.getClusterStats(options, function(error, res, body) {
    if (error) {
      console.error(error);
      return;
    }

    if (res.statusCode != 200) {
      console.error('ERROR: ' + res.request.href);
      console.error('statusCode: ' + res.statusCode);
      console.error('statusMessage: ' + res.statusMessage);
      console.error('message' + body);
      return;
    }

    var statsObj = JSON.parse(body);
    statsObj.statsSpecificResponses.forEach(function(item) {
      console.log(item);
      var data = {};
      data[item.startTimeInUsecs] = item.values[0];
      NXFirebase.fbClusterStats.child(_this.clusterUuid)
          .child(item.metric).update(data);
    });
  });
}


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
