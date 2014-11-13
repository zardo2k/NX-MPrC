angular.module('FbClustersSummarySrvModule', ['firebase'])

/**
 * A simple example service that returns some data.
 */
  .factory('FbClustersSummarySrv', ['$firebase', 'Firebase', 'FB_BASE_URL',
    function ($firebase, Firebase, FB_BASE_URL) {

    // Might use a resource here that returns a JSON array
    var ref = new Firebase(FB_BASE_URL + '/ClustersSummary');
    var firebase = $firebase(ref);
    return {
      getByClusterUuid: function(clusterUuid) {
        return $firebase(ref.child(clusterUuid)).$asObject();
      }
    }
  }]);
