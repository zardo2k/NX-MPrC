angular.module('SideBarModule', ['FbClustersSrvModule'])
  .controller('SideBarCtrl',
    ['$scope', 'FbClustersSrv', 'Resources',
      '$ionicSideMenuDelegate', '$state',
      function($scope, FbClustersSrv, Resources,
               $ionicSideMenuDelegate, $state) {
        $scope.clusters = FbClustersSrv.getAll();

        $scope.onSelectCluster = function(cluster) {
          if(typeof cluster === 'string') {
            Resources.currentSelectCluster = cluster;
            $state.go('home');
          } else {
            Resources.currentSelectCluster = cluster.name;
            $state.go('clusters', {id: cluster.clusterUuid});
          }

          $ionicSideMenuDelegate.toggleLeft();

        }
      }
    ]
  );