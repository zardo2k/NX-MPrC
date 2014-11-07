'use strict';

var util = require('util');
var request = require('request');



var BASEPATH = '/PrismGateway/services/rest/v1';
var URL = {
  CLUSTERS: BASEPATH + '/clusters'
}

function NXRequest(ip, port, username, password) {
  this.ip = ip;
  this.port = port;
  this.username = username;
  this.password = password;

  var base64String = username + ':' + password;
  var requestOptions = {
    'strictSSL': false,
    'headers': {
      'Authorization': util.format('Basic %s',
          new Buffer(base64String).toString('base64'))
    }
  };

  this.request = request.defaults(requestOptions);
  this.baseHttp = util.format('https://%s:%s', ip, port);

  var loginUrl = this.baseHttp + '/PrismGateway/nmb/loginsuccess';

  this.request.get(loginUrl,
      function(error, res, body) {
        if (error) {
          return console.error(error);
        }
        console.log('Login ' + body);
      });
}

NXRequest.prototype.getClusters = function(callback) {
  this.request.get(this.baseHttp + URL.CLUSTERS, callback);
};

module.exports.NXRequest = NXRequest;