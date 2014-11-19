/* global require: false */
/*jshint globalstrict: true, node: true */
'use strict';

var util = require('util');
var request = require('request');

var BASEPATH_V1 = '/PrismGateway/services/rest/v1';
var NX_API_V1 = ['clusters'];

function NXRequest2(host, port, username, password) {
  this.host = host;
  this.port = port;
  this.username = username;
  this.password = password;
  this.baseHttp = util.format('https://%s:%s', host, port);
  this.initialize(username, password);
}

NXRequest2.prototype.initialize = function(username, password) {
  var base64String = username + ':' + password;
  var requestOptions = {
    'strictSSL': false,
    'headers': {
      'Authorization': util.format('Basic %s',
        new Buffer(base64String).toString('base64'))
    }
  };
  this.request = request.defaults(requestOptions);

  var _this = this;
  NX_API_V1.forEach(function(api) {
    _this[api] =  {};
    _this[api]['get'] = function(options, callback) {
        var defaultUrl = _this.baseHttp + '/' + BASEPATH_V1 + '/' + api;
        console.log('get');
        if (typeof options === 'object') {
          if (!options.url) {
            // Has options but
            // didn't specify an url in the options.  Assigned the default.
            options.url = defaultUrl;
          }
          _this.request.get(options, callback);
        } else {
          // Didn't pass in the options.
          if (typeof options === 'function') {
            // The options is the callback funtion.
            _this.request.get(defaultUrl, options);
          } else {
            _this.request.get(defaultUrl);
          }
        }
      };
  });
};

var nxRequest = new NXRequest2('10.3.189.126', 9440, 'admin', 'admin');
nxRequest.clusters.get(function(a, b, c) {
  console.log(a);
  console.log(b);
  console.log(c);
});