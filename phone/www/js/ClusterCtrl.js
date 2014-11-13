angular.module('ClusterCtrlModule', ['FbClustersSrvModule',
  'FbClustersSummarySrvModule'])
  .controller('ClusterCtrl',
    ['$scope', '$state', 'FbClustersSrv', 'FbVMsSrv', 'FbClustersSummarySrv',
      function($scope, $state,FbClustersSrv, FbVMsSrv, FbClustersSummarySrv) {
        console.log($state);
        $scope.clusterSummary =
            FbClustersSummarySrv.getByClusterUuid($state.params.id);
      }
    ]
  );