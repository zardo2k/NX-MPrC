angular.module('FbClustersSrvModule', ['firebase'])

/**
 * A simple example service that returns some data.
 */
  .factory('FbClustersSrv', ['$firebase', 'Firebase', 'FB_BASE_URL',
    function ($firebase, Firebase, FB_BASE_URL) {

    // Might use a resource here that returns a JSON array
    var ref = new Firebase(FB_BASE_URL + '/Clusters');
    var firebase = $firebase(ref);
    var groupByVersion = {};


    ref.on('value', function(dataSnapShot) {
      for (key in groupByVersion) {
        delete groupByVersion[key];
      }

      var clusters = dataSnapShot.val();
      Object.keys(clusters).forEach(function(key) {
        if (!groupByVersion[clusters[key].version]) {
          groupByVersion[clusters[key].version] = 1;
        } else {
          groupByVersion[clusters[key].version] += 1;
        }
      })

    });
    return {
      getAll: function() {
        return firebase.$asArray();
      },

      getById: function(id) {
        return $firebase(ref.child(id)).$asObject();
      },

      getGroupByVersions: function() {
        return groupByVersion;
      },

      renameCluster: function(clusterUuid, name) {
        console.log("rename " + name);
        //var taskIdRef = ref.child('Tasks/New').child('Clusters').child(clusterUuid).push({name : newName});
        ////var taskId = taskIdRef.key();
        //
        //
        //ref.child('Tasks/Finished').child('Clusters').child(clusterUuid).child(taskIdRef.name()).on('child_added', function() {
        //  console.log("Tasks Completed");
        //});
        var taskIdRef = ref.parent().child('Tasks/New').child('Clusters')
            .child(clusterUuid).push({name : name});
        //var taskId = taskIdRef.key();
        var taskCompletedRef = ref.parent().child('Tasks/Finished')
          .child('Clusters').child(clusterUuid).child(taskIdRef.name()).on('child_added', function() {
            console.log("Tasks Completed");
         });

      }
    }
  }]);
