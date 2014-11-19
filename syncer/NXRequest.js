/* global require: false */
/*jshint globalstrict: true, node: true */
'use strict';

var util = require('util');
var request = require('request');



var BASEPATH = '/PrismGateway/services/rest/v1';
var URL = {
  AlERTS: BASEPATH + '/alerts',
  CLUSTER: BASEPATH + '/cluster',
  CLUSTERS: BASEPATH + '/clusters',
  CLUSTER_STATS: BASEPATH + '/cluster/stats',
  VMS: BASEPATH + '/vms',
  CONTAINERS: BASEPATH + '/containers',
  STORAGE_POOLS: BASEPATH + '/storage_pools',
  HOSTS: BASEPATH + '/hosts'
};

var ALERTS = BASEPATH + '/alerts';

function NXRequest(host, port, username, password) {
  this.host = host;
  this.port = port;
  this.username = username;
  this.password = password;
  this.baseHttp = util.format('https://%s:%s', host, port);

  var base64String = username + ':' + password;
  var requestOptions = {
    'strictSSL': false,
    'headers': {
      'Authorization': util.format('Basic %s',
          new Buffer(base64String).toString('base64'))
    }
  };
  this.request = request.defaults(requestOptions);

//  var loginUrl = this.baseHttp + '/PrismGateway/nmb/loginsuccess';
//
//  this.request.get(loginUrl, function(error, res, body) {
//      if (error) {
//        return console.error(error);
//      }
//      console.log('Login ' + body);
//    });
}
NXRequest.prototype._get = function(defaultUrl, options, callback) {
  if (typeof options === 'object') {
    if (!options.url) {
      // Has options but
      // didn't specify an url in the options.  Assigned the default.
      options.url = defaultUrl;
    }
    this.request.get(options, callback);
  } else {
    // Didn't pass in the options.
    if (typeof options === 'function') {
      // The options is the callback funtion.
      this.request.get(defaultUrl, options);
    } else {
      this.request.get(defaultUrl);
    }
  }
};

// Fetch cluster data.
NXRequest.prototype.getClusters = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.CLUSTERS;
  this._get(defaultUrl, options, callback);
};

// Update cluster data.
NXRequest.prototype.putCluster = function(data, callback) {
  var defaultUrl = this.baseHttp + URL.CLUSTER;
  this.request.put({
    url: defaultUrl,
    body: data,
    json: true
  }, callback)
};

// Fetch stats data
// options : must provide options.qs.metrics
NXRequest.prototype.getClusterStats = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.CLUSTER_STATS
  if (options && options.qs && options.qs.metrics) {
    this._get(defaultUrl, options, callback);
  } else {
    var errorMsg = 'Must provide options.qs.metrics';
    // metrics parameter is missing
    if (typeof options === 'function') {
      options(errorMsg);
      return
    } else if(typeof callback === 'function') {
      callback(errorMsg);
      return;
    }
    console.error('ERROR: ' + errorMsg);
  }

};

NXRequest.prototype.getVMs = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.VMS;
  this._get(defaultUrl, options, callback);
}

NXRequest.prototype.getClusterContainers = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.CONTAINERS;
  this._get(defaultUrl, options, callback);
}

NXRequest.prototype.getClusterAlerts = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.AlERTS;
  this._get(defaultUrl, options, callback);
}

NXRequest.prototype.getClusterHosts = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.HOSTS;
  this._get(defaultUrl, options, callback);
}

NXRequest.prototype.getClusterStoragePools = function(options, callback) {
  var defaultUrl = this.baseHttp + URL.HOSTS;
  this._get(defaultUrl, options, callback);
}

module.exports.NXRequest = NXRequest;