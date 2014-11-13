angular.module('SideBarModule', ['FbClustersSrvModule'])
  .controller('SideBarCtrl',
    ['$scope', 'FbClustersSrv', 'Resources',
      '$ionicSideMenuDelegate', '$state',
      function($scope, FbClustersSrv, Resources,
               $ionicSideMenuDelegate, $state) {
        $scope.clusters = FbClustersSrv.getAll();

        $scope.onSelectCluster = function(cluster) {
          if(typeof cluster === 'string') {
            Resources.currentSelectCluster.name = cluster;
            Resources.currentSelectCluster.id = null;
            $state.go('home');
          } else {
            Resources.currentSelectCluster.name = cluster.name;
            Resources.currentSelectCluster.id = cluster.clusterUuid;
            $state.go('clusters', {id: cluster.clusterUuid});
          }

          $ionicSideMenuDelegate.toggleLeft();

        }
      }
    ]
  );