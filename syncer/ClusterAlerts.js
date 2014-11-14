/**
 * Created by van on 11/10/14.
 */
var NXFirebase = require('./NXFirebase');
var Utils = require('./Utils.js');
// clusterUuid : clusterUuid
// nxRequest: Instance of nxRequest
function ClusterAlerts(clusterUuid, nxRequest) {
  this.clusterUuid = clusterUuid;
  this.nxRequest = nxRequest;

  this.idAttribute = 'id';
  this.syncData();
  setInterval(this.syncData.bind(this), 30000);
}

ClusterAlerts.prototype.syncData = function() {
  console.log('ClusterAlerts.syncData() ' + this.clusterUuid);
  var _this = this;

  NXFirebase.fbClusterAlerts.child(_this.clusterUuid)
    .orderByChild("createdTimeStampInUsecs")
    .limitToLast(1).once('value',
    function(snapShotData) {
      console.log(snapShotData.val());
    });
  var options = {
    qs: {
      resolved: false,
      count: 10
    }
  }
  this.nxRequest.getClusterAlerts(options, function(error, res, body) {
    if(Utils.isRequestFailed(error, res, body)) {
      return;
    }

    var dataObject = JSON.parse(body);

    dataObject.entities.forEach(function(item) {
      NXFirebase.fbClusterAlerts.child(_this.clusterUuid).child(item[_this.idAttribute]).update(item);
    });
  });
}

module.exports.ClusterAlerts = ClusterAlerts;