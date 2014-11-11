/**
 * Created by van on 11/10/14.
 */

var NXFirebase = require('./NXFirebase');
var Utils = require('./Utils.js');
// clusterUuid : clusterUuid
// stats: This is the stats object from the Cluster.
// nxRequest: Instance of nxRequest
function ClusterStats(clusterUuid, stats, nxRequest) {
  this.clusterUuid = clusterUuid;
  this.stats = Object.keys(stats).join(',');
  this.nxRequest = nxRequest;

  this.syncData();
  setInterval(this.syncData.bind(this), 30000);
}

ClusterStats.prototype.syncData = function() {
  console.log('ClusterStats.syncData() ' + this.clusterUuid);
  var _this = this;

  var options = {
    qs: {
      metrics: this.stats
    }
  }

  this.nxRequest.getClusterStats(options, function(error, res, body) {
    if(Utils.isRequestFailed(error, res, body)) {
      return;
    }

    var statsObj = JSON.parse(body);
    statsObj.statsSpecificResponses.forEach(function(item) {
      var data = {};
      data[item.startTimeInUsecs] = item.values[0];
      NXFirebase.fbClusterStats.child(_this.clusterUuid)
          .child(item.metric).update(data);
    });
  });
}

module.exports.ClusterStats = ClusterStats;