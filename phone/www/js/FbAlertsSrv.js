angular.module('FbAlertsSrvModule', ['firebase'])

/**
 * A simple example service that returns some data.
 */
  .factory('FbAlertsSrv', ['$firebase', 'Firebase', 'FB_BASE_URL',
    function ($firebase, Firebase, FB_BASE_URL) {

    // Might use a resource here that returns a JSON array
    var ref = new Firebase(FB_BASE_URL + '/ClusterAlerts');
    var firebase = $firebase(ref);
    return {
      getAll: function() {
        return firebase.$asArray();
      },

      getByClusterUuid: function(clusterUuid) {
        return $firebase(ref.child(clusterUuid)).$asArray();
      }
    }
  }]);
