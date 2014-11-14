angular.module('ClusterCtrlModule', ['FbClustersSrvModule',
  'FbClustersSummarySrvModule', 'FbAlertsSrvModule', 'FbAlertsSrvModule',
  'AlertsCtrlModule'])
  .controller('ClusterCtrl',
    ['$scope', '$state', 'FbClustersSrv', 'FbVMsSrv', 'FbClustersSummarySrv',
      'FbAlertsSrv',
      function($scope, $state, FbClustersSrv, FbVMsSrv,
               FbClustersSummarySrv, FbAlertsSrv) {
        console.log($state);
        $scope.cluster = FbClustersSrv.getById($state.params.id);
        $scope.clusterSummary =
            FbClustersSummarySrv.getByClusterUuid($state.params.id);
        $scope.alerts = FbAlertsSrv.getByClusterUuid($state.params.id);
        $scope.gotoAlertsView = function(clusterUuid) {
          console.log(clusterUuid);
          $state.go('alerts', {id: clusterUuid});
        }
      }
    ]
  );