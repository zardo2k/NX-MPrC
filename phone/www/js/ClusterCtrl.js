angular.module('ClusterCtrlModule', ['FbClustersSrvModule'])
  .controller('ClusterCtrl',
    ['$scope', '$state', 'FbClustersSrv', 'FbVMsSrv',
      function($scope, $state,FbClustersSrv, FbVMsSrv) {
        console.log($state);
        $scope.cluster = FbClustersSrv.getById($state.params.id);
        $scope.vms = FbVMsSrv.getByClusterUuid($state.params.id);
      }
    ]
  );