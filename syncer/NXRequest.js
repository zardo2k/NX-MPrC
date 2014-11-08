'use strict';

var util = require('util');
var request = require('request');



var BASEPATH = '/PrismGateway/services/rest/v1';
var URL = {
  CLUSTERS: BASEPATH + '/clusters',
  CLUSTER_STATS: BASEPATH + '/cluster/stats'
}

function NXRequest(ip, port, username, password) {
  this.ip = ip;
  this.port = port;
  this.username = username;
  this.password = password;
  this.baseHttp = util.format('https://%s:%s', ip, port);

  var base64String = username + ':' + password;
  var requestOptions = {
    'strictSSL': false,
    'headers': {
      'Authorization': util.format('Basic %s',
          new Buffer(base64String).toString('base64'))
    }
  };
  this.request = request.defaults(requestOptions);

  var loginUrl = this.baseHttp + '/PrismGateway/nmb/loginsuccess';

  this.request.get(loginUrl, function(error, res, body) {
      if (error) {
        return console.error(error);
      }
      console.log('Login ' + body);
    });
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

module.exports.NXRequest = NXRequest;