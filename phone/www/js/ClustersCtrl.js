angular.module('ClustersCtrlModule', [])
  .controller('ClustersCtrl',
    ['$scope', '$state',
      function($scope, $state) {
        console.log($state);
      }
    ]
  )