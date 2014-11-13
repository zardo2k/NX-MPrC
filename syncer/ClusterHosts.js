/**
 * Created by van on 11/10/14.
 */
var NXFirebase = require('./NXFirebase');
var Utils = require('./Utils.js');
// clusterUuid : clusterUuid
// nxRequest: Instance of nxRequest
function ClusterHosts(clusterUuid, nxRequest) {
  this.clusterUuid = clusterUuid;
  this.nxRequest = nxRequest;

  this.idAttribute = 'uuid';
  this.syncData();
  setInterval(this.syncData.bind(this), 30000);
}

ClusterHosts.prototype.syncData = function() {
  console.log('ClusterHosts.syncData() ' + this.clusterUuid);
  var _this = this;

  this.nxRequest.getClusterHosts(function(error, res, body) {
    if(Utils.isRequestFailed(error, res, body)) {
      return;
    }

    var dataObject = JSON.parse(body);

    var summaryData = {
      totalHosts: dataObject.entities.length || 0,
      totalCPUCores: 0,
      totalCPUSockets: 0,
      totalCPUFrequencyInHz: 0,
      totalCPUFrequencyInHzUsed: 0,
      totalmemoryCapacityInBytes: 0,
      totalmemoryCapacityInBytesUsed: 0
    }

    dataObject.entities.forEach(function(item) {
      // Our usageStats contains keys with '.' in the name.
      // This will make all the '.' to '_'.
      item.usageStats = Utils.cleanKeyStrings(item.usageStats);
      // TODO Remove Cluster Health Summary for now because some of the keys
      // in the nested object contains '.'.
      delete item.healthSummary;
      summaryData.totalCPUCores += item.numCpuCores;
      summaryData.totalCPUSockets += item.numCpuSockets;
      summaryData.totalCPUFrequencyInHz += item.cpuFrequencyInHz * item.numCpuCores;
      summaryData.totalmemoryCapacityInBytes += item.memoryCapacityInBytes;


      //summaryData.totalCPUFrequencyInHzUsed +=
      //  parseInt(item.stats.hypervisor_cpu_usage_ppm) < 0? 0 :
      //    parseInt(item.stats.hypervisor_cpu_usage_ppm);

      summaryData.totalmemoryCapacityInBytesUsed +=
        parseInt(item.stats.hypervisor_memory_usage_ppm) < 0? 0 :
          parseInt(item.stats.hypervisor_memory_usage_ppm);


      NXFirebase.fbClusterHosts.child(_this.clusterUuid).child(item[_this.idAttribute]).update(item);
    });

    summaryData.totalCPUFrequencyDispStr =
        Utils.prefixFormat(summaryData.totalCPUFrequencyInHz, 'Hz')
    summaryData.totalmemoryCapacityDispStr =
        Utils.prefixFormat(summaryData.totalmemoryCapacityInBytes, 'iB')


    NXFirebase.fbClustersSummary.child(_this.clusterUuid).update(summaryData)
  });
}

module.exports.ClusterHosts = ClusterHosts;