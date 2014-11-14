angular.module('SideBarModule', ['FbClustersSrvModule'])
  .controller('SideBarCtrl',
    ['$scope', 'FbClustersSrv', 'Resources',
      '$ionicSideMenuDelegate', '$state', '$ionicNavBarDelegate',
      function($scope, FbClustersSrv, Resources,
               $ionicSideMenuDelegate, $state, $ionicNavBarDelegate) {
        $scope.clusters = FbClustersSrv.getAll();

        $scope.onSelectCluster = function(cluster) {
          if(typeof cluster === 'string') {
//            Resources.currentSelectCluster.name = cluster;
//            Resources.currentSelectCluster.id = null;
//            $ionicNavBarDelegate.$getByHandle('myNav').setTitle('ALL')
            $state.go('home');
          } else {
//            $ionicNavBarDelegate.$getByHandle('myNav').setTitle('newTitle')
//            Resources.currentSelectCluster.name = cluster.name;
//            Resources.currentSelectCluster.id = cluster.clusterUuid;
            $state.go('clusters', {id: cluster.clusterUuid});
          }

          $ionicSideMenuDelegate.toggleLeft();

        }
      }
    ]
  );