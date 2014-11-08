'use strict';
var NXFirebase = require('./NXFirebase');
var NXRequest = require('./NXRequest.js').NXRequest;
var clusterConfigs = require('./Config.js').clusterConfigs;


// Initialize NXRequest instances for each of the
// cluster configs.
// clusterConfigs : Array of objects.  See Config.js.
//
// Return list of NXRequest instances.
function initClusterConfigs(clusterConfigs) {
  var nxRequests = [];
  clusterConfigs.forEach(function(config) {
    var nxRequest = new NXRequest(config.host, config.port,
        config.username, config.password);
    nxRequests.push(nxRequest);
  });
  return nxRequests;
}

// The usageStats object contain keys that has '.'
// in the name.  Firebase doesn't like with with '.'.
// This function will convert any '.' in the keys string
// to '_'.
// Returns a cleaned object.
// NOTE: This doesn't work on nested object.
function cleanKeyStrings(anObject) {
  var cleanedObject = {}
  Object.keys(anObject).forEach(function(key){
    cleanedObject[key.replace(/\./g,'_')] = anObject[key];
  });
  return cleanedObject;
}


var nxRequests  = initClusterConfigs(clusterConfigs);
nxRequests.forEach(function(nxRequest) {
  // Fetch the Cluster entity data.

  nxRequest.getClusters(function (error, res, body) {
    if (error) {
      console.log(error)
      return;
    }

    if (res.statusCode != 200) {
      console.error('ERROR: statusCode: ' + res.statusCode);
      console.error('statusMessage: ' + res.statusMessage);
      return;
    }

    var clusterObj = JSON.parse(body);
    if (clusterObj.entities.length > 1) {
      console.error('ERROR: Multicluster is not supported');
      return;
    }

    var cluster = clusterObj.entities[0];
    cluster.usageStats = cleanKeyStrings(cluster.usageStats);
    console.log(cluster.usageStats);

    var data = {};
    data[cluster.clusterUuid] = cluster;
    NXFirebase.fbClusters.update(data);




    var options = {
      qs: {
        metrics: 'hypervisor_memory_usage_ppm,avg_io_latency_usecs'
      }
    }
    nxRequest.getClusterStats(options, function(error, res, body) {
      if (error) {
        console.error(error);
        return;
      }

      if (res.statusCode != 200) {
        console.error('ERROR: ' + res.request.href);
        console.error('statusCode: ' + res.statusCode);
        console.error('statusMessage: ' + res.statusMessage);
        console.error('message' + body);
        return;
      }

      var statsObj = JSON.parse(body);
      statsObj.statsSpecificResponses.forEach(function(item) {
        console.log(item);
        var data = {};
        data[item.startTimeInUsecs] = item.values[0];
        NXFirebase.fbClusterStats.child(cluster.clusterUuid)
            .child(item.metric).update(data);
      });
    });

  });
});


// Set up the request library for generating http calls.
//var r = request.defaults(requestOptions);


//request.post("https://10.3.189.126:9440/PrismGateway/j_spring_security_check", {
//  form : {
//    j_username: "admin",
//    j_password: "admin"
//  },
//  rejectUnhauthorized : false,
//  strictSSL: false
//}, function(error, res, body) {
//  if(error) {
//    return console.error(error);
//  }
//
//  request.get("https://10.3.189.126:9440/PrismGateway/nmb/loginsuccess",
//      function(error, res, body) {
//        if (error) {
//          return console.error(error);
//        }
//        console.log(body);
//      });
//});



//
//setInterval(function() {
//  nxRequests.forEach(function(nxRequest) {
//    // Fetch the Cluster entity data.
//    nxRequest.getClusters(function(error, res, body) {
//      if (error) {
//        console.error(error);
//        return;
//      }
//      JSON.parse(body).entities.forEach(function(item) {
//        item.usageStats = cleanKeyStrings(item.usageStats);
//        console.log(item.usageStats);
//        var oo = {};
//        oo[item.clusterUuid] = item;
//        firebaseRef.child('Clusters').update(oo);
//      });
//    });
//  });
//  }
//  // Interval Milliseconds
//  , 30000);

//var r = request.defaults(requestOptions);
//r.get('https://10.3.189.126:9440/PrismGateway/services/rest/v1/users/session_info', function(error, res, body) {
//   console.log(res);
//});
