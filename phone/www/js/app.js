// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter',
  ['ionic',
  'starter.controllers',
  'ClusterCtrlModule',
  'ClustersCtrlModule',
  'NavBarModule',
  'SideBarModule',
  'FbClustersSrvModule',
  'FbVMsSrvModule'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    $stateProvider
      .state('home', {
        url: '/clusters',
        templateUrl: 'templates/clusters.html'
      })
      .state('clusters', {
        url: '/clusters/:id',
        templateUrl: 'templates/cluster.html'
      })
      .state('music', {
        url: '/music',
        templateUrl: 'templates/music.html'
      });

      $urlRouterProvider.otherwise('/');
  }])

  .value({Resources : {
    currentSelectCluster: 'All Clusters'
  }})

  .constant({FB_BASE_URL: 'https://nx-cluster-example.firebaseio.com'});

