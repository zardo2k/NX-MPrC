var Cluster = require('./Cluster.js').Cluster;

function Clusters(clusterConfigs) {
  this.clusters = [];

  clusterConfigs.forEach(function(config) {
    var cluster = new Cluster(config);
    this.clusters.push(cluster);
  }, this);
}

module.exports.Clusters = Clusters

;