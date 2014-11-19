angular.module('SideBarModule', ['FbClustersSrvModule'])
  .controller('SideBarCtrl',
    ['$scope', 'FbClustersSrv', 'Resources',
      '$ionicSideMenuDelegate', '$state', '$ionicNavBarDelegate',
      '$ionicPopup',
      function($scope, FbClustersSrv, Resources,
               $ionicSideMenuDelegate, $state, $ionicNavBarDelegate,
               $ionicPopup) {
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

        $scope.showRenamePopup = function (cluster) {
          console.log("rename");
          if (cluster.name === 'All Clusters') {
            return;
          }
          $scope.data = {
            name: cluster.name
          };

          var renamePopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.name">',
            title: 'Rename Cluster',
            subTitle: 'Please use normal things',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  FbClustersSrv.renameCluster(cluster.clusterUuid, $scope.s


                  data.name);
                  console.log("Change Cluster Name" + cluster.name);
                }
              },
            ]
          });

        }
      }
    ]
  );