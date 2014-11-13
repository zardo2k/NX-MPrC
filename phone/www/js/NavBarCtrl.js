angular.module('NavBarModule', ['ionic', 'FbClustersSrvModule'])
  .controller('NavBarCtrl',
    ['$scope', '$ionicSideMenuDelegate', 'Resources', '$ionicPopup',
      'FbClustersSrv', '$state',
      function($scope, $ionicSideMenuDelegate, Resources, $ionicPopup,
               FbClustersSrv, $state) {
        $scope.toggleLeftSideMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
        }

        $scope.showRenamePopup = function () {
          if ($scope.cluster.name === 'All Clusters') {
            return;
          }
          $scope.data = {
            name: $scope.cluster.name
          };

          var renamePopup = $ionicPopup.show({
            template: '<input type="text" ng-model="cluster.name">',
            title: 'Rename Cluster',
            subTitle: 'Please use normal things',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  FbClustersSrv.renameCluster($scope.cluster.id, $scope.cluster.name);
                  console.log("Change Cluster Name" + $scope.cluster.id);
                }
              },
            ]
          });

        }
        $scope.cluster = Resources.currentSelectCluster;
      }
    ]
  )