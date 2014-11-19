angular.module('NavBarModule', ['ionic', 'FbClustersSrvModule'])
  .controller('NavBarCtrl',
    ['$scope', '$ionicSideMenuDelegate', 'Resources', '$ionicPopup',
      'FbClustersSrv', '$state',
      function($scope, $ionicSideMenuDelegate, Resources, $ionicPopup,
               FbClustersSrv, $state) {
        $scope.toggleLeftSideMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
        }

        $scope.cluster = Resources.currentSelectCluster;
      }
    ]
  )