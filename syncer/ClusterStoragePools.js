/**
 * Created by van on 11/10/14.
 */
var NXFirebase = require('./NXFirebase');
var Utils = require('./Utils.js');
// clusterUuid : clusterUuid
// nxRequest: Instance of nxRequest
function ClusterStoragePools(clusterUuid, nxRequest) {
  this.clusterUuid = clusterUuid;
  this.nxRequest = nxRequest;
  this.idAttribute = 'id';
  this.syncData();
  setInterval(this.syncData.bind(this), 30000);
}

ClusterStoragePools.prototype.syncData = function() {
  console.log('ClusterStoragePools.syncData() ' + this.clusterUuid);
  var _this = this;

  this.nxRequest.getClusterStoragePools(function(error, res, body) {
    if(Utils.isRequestFailed(error, res, body)) {
      return;
    }

    var dataObject = JSON.parse(body);

    dataObject.entities.forEach(function(item) {
      // Our usageStats contains keys with '.' in the name.
      // This will make all the '.' to '_'.
      item.usageStats = Utils.cleanKeyStrings(item.usageStats);
      NXFirebase.fbClusterStoragePools.child(_this.clusterUuid)
        .child(item[_this.idAttribute]).update(item);
    });
  });
}

module.exports.ClusterContainers = ClusterContainers;