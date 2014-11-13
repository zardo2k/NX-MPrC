angular.module('ClustersCtrlModule', ['FbClustersSrvModule'])
  .controller('ClustersCtrl',
  ['$scope', '$state', 'FbClustersSrv',
    function($scope, $state, FbClustersSrv) {
      console.log($state);
      $scope.clusters = FbClustersSrv.getAll();
      $scope.versionGroups = FbClustersSrv.getGroupByVersions();
    }
  ]
  );