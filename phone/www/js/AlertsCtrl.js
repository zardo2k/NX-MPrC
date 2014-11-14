angular.module('AlertsCtrlModule', ['FbClustersSrvModule',
  'FbClustersSummarySrvModule', 'FbAlertsSrvModule', 'FbAlertsSrvModule'])
  .controller('AlertsCtrl',
    ['$scope', '$state', 'FbClustersSrv', 'FbVMsSrv', 'FbClustersSummarySrv',
      'FbAlertsSrv',
      function($scope, $state, FbClustersSrv, FbVMsSrv,
               FbClustersSummarySrv, FbAlertsSrv) {
        $scope.cluster = FbClustersSrv.getById($state.params.id);
        $scope.alerts = FbAlertsSrv.getByClusterUuid($state.params.id);
        console.log($state);
        console.log("ALERTS");
      }
    ]
  );