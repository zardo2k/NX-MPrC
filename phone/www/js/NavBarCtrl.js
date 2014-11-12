angular.module('NavBarModule', [])
  .controller('NavBarCtrl',
    ['$scope', '$ionicSideMenuDelegate', 'Resources',
      function($scope, $ionicSideMenuDelegate, Resources) {
        $scope.toggleLeftSideMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.Resources = Resources;
      }
    ]
  )