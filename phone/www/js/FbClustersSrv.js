angular.module('FbClustersSrvModule', ['firebase'])

/**
 * A simple example service that returns some data.
 */
  .factory('FbClustersSrv', ['$firebase', 'Firebase', 'FB_BASE_URL',
    function ($firebase, Firebase, FB_BASE_URL) {

    // Might use a resource here that returns a JSON array
    var ref = new Firebase(FB_BASE_URL + '/Clusters');
    var firebase = $firebase(ref);
    return {
      getAll: function() {
        return firebase.$asArray();
      },

      getById: function(id) {
        return $firebase(ref.child(id)).$asObject();
      }
    }
  }]);
