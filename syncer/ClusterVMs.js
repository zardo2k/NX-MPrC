/**
 * Created by van on 11/10/14.
 */
var NXFirebase = require('./NXFirebase');
var Utils = require('./Utils.js');
// clusterUuid : clusterUuid
// nxRequest: Instance of nxRequest
function ClusterVMs(clusterUuid, nxRequest) {
  this.clusterUuid = clusterUuid;
  this.nxRequest = nxRequest;

  this.syncData();
  setInterval(this.syncData.bind(this), 30000);
}

ClusterVMs.prototype.syncData = function() {
  console.log('ClusterVMs.syncData() ' + this.clusterUuid);
  var _this = this;

  this.nxRequest.getVMs(function(error, res, body) {
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

    var summaryData = {
      totalVMs: 0,
      totalVMsOn: 0,
      totalVMsOff: 0,
      totalVMsSuspended: 0
    }
    var vmsObject = JSON.parse(body);

    vmsObject.entities.forEach(function(vm) {
      NXFirebase.fbClusterVMs.child(_this.clusterUuid).child(vm.vmId).update(vm);
      switch (vm.powerState) {
        case 'on':
          summaryData.totalVMsOn += 1;
          break;
        case 'off':
          summaryData.totalVMsOff += 1;
          break;
        case 'suspended':
          summaryData.totalVMsSuspended += 1;
          break;
        default:
          console.error('WARNING: On a recognized VM Powerstate');
      }
    });

    summaryData.totalVMs = vmsObject.entities.length || 0;
    NXFirebase.fbClustersSummary.child(_this.clusterUuid).update(summaryData);

  });
}

module.exports.ClusterVMs = ClusterVMs;