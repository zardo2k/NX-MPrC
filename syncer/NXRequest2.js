/* global require: false */
/*jshint globalstrict: true, node: true */
'use strict';

var util = require('util');
var request = require('request');

var BASEPATH_V1 = '/PrismGateway/services/rest/v1';
var NX_API_V1 = ['clusters'];
var NX_API_V_1 = {
  get: [
    'clusters',
    'clusters/alerts',
    'clusters/events',
    'clusters/{id}',
    'clusters/{id}/alerts',
    'clusters/{id}/events',
    'clusters/{id}/starts'
  ]
};

// Given a path like this 'a/b/c'
// this will build the inputObject to like this
// {a : {b: {c : {}}}
// The return is reference c object.
function buildObjectWithApiPath(api, inputObject) {
  if (!api || api === '') {
    throw "api string can't not by null or empty";
  }

  var splitted = api.split('/');
  var firstItem = splitted[0];
  if (containsId(firstItem)) {
    firstItem = 'id';
  }
  if (splitted.length === 1) {
    // last item on the path.
    if (!inputObject[firstItem]) {
      inputObject[firstItem] = {};
    }
    return inputObject[firstItem];
  } else {
    if (!inputObject[firstItem]) {
      inputObject[firstItem] = {};
    }
    // Example: if original api is 'a/b/c' the recursive call is
    // passing in the following 'b/c', {a: {} <<-- this is what passed in}
    return buildObjectWithApiPath(splitted.slice(1).join('/'), inputObject[firstItem]);
  }
}

// Returns true if api string contains {id} else false.
function containsId(api)  {
  return api.search(/{id}/) >= 0 ? true : false;
}

//var myobj = {};
//buildObjectWithApiPath("a/b/c", myobj);
//console.log(myobj);

function NXRequest2(host, port, username, password) {
  this.host = host;
  this.port = port;
  this.username = username;
  this.password = password;
  this.baseHttp = util.format('https://%s:%s/%s', host, port, BASEPATH_V1);
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

  this._GET = function(options, callback, defaultUrl) {
    if (typeof options === 'object') {
      if (!options.url) {
        // Has options but
        // didn't specify an url in the options.  Assigned the default.
        options.url = defaultUrl;
      }
      console.log('GET ' + options.url);
      this.request.get(options, callback);
    } else {
      // Didn't pass in the options.
      if (typeof options === 'function') {
        // The options is the callback funtion.
        this.request.get(defaultUrl, options);
      } else {
        this.request.get(defaultUrl);
      }
      console.log('GET ' + defaultUrl);
    }
  };

  // Build up the API methods
  // The method build in this class would be something link this
  // API: /PrismGateway/services/rest/v1/clusters
  // NXRequest.clusters.get()
  //
  // /PrismGateway/services/rest/v1/clusters/alerts
  // NXRequest.clusters.alerts.get()

  var _this = this;
  // Start with the verbs.  get, put, post, etc.
  Object.keys(NX_API_V_1).forEach(function(verb) {
    // Now the api path.  clusters, alerts, ..etc
    NX_API_V_1[verb].forEach(function(api) {
      var defaultUrl = _this.baseHttp + '/' + api;
      var lastChildOfApi = buildObjectWithApiPath(api, _this);

      if (containsId(api)) {
        lastChildOfApi[verb] = function (id, options, callback) {
          if(typeof id !== 'string') {
            throw 'First argument must be an string id';
          }
          defaultUrl = defaultUrl.replace(/{id}/, id);
          _this._GET(options, callback, defaultUrl);
          console.log(defaultUrl);
        };
      } else {
        lastChildOfApi[verb] = function (options, callback) {
          _this._GET(options, callback, defaultUrl);
        };
      }
    });
  });
};

var nxRequest = new NXRequest2('10.3.189.126', 9440, 'admin', 'admin');
console.log(nxRequest);
nxRequest.clusters.get(function(a, b, c) {
  console.log(c);
});

nxRequest.clusters.id.get("000506fb-bc6a-168f-0000-000000002dc8::11720", function(a, b, c) {
  console.log(c);
});

nxRequest.clusters.alerts.get(function(a, b, c) {
  console.log(c);
});

nxRequest.clusters.events.get(function(a, b, c) {
  console.log(c);
});