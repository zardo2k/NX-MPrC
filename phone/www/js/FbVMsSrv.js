angular.module('FbVMsSrvModule', ['firebase'])

/**
 * A simple example service that returns some data.
 */
  .factory('FbVMsSrv', ['$firebase', 'Firebase', 'FB_BASE_URL',
    function ($firebase, Firebase, FB_BASE_URL) {

    // Might use a resource here that returns a JSON array
    var ref = new Firebase(FB_BASE_URL + '/ClusterVMs');
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
