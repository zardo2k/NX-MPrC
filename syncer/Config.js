var firebaseConfig = {
  rootPath: 'https://nx-cluster-example.firebaseio.com/'
}
var clusterConfigs = [
  {
    host: '10.3.205.61',
    port: 9440,
    username: 'admin',
    password: 'admin'
  },
  {
    host: '10.3.200.79',
    port: 9440,
    username: 'admin',
    password: 'admin'
  },
  //{
  //  host: '10.4.40.81',
  //  port: 9440,
  //  username: 'admin',
  //  password: 'admin'
  //},
//  {
//    host: '10.3.177.15',
//    port: 9440,
//    username: 'admin',
//    password: 'admin'
//  },
//  {
//    host: '10.3.160.178',
//    port: 9440,
//    username: 'admin',
//    password: 'admin'
//  },
//  {
//    host: '10.3.100.73',
//    port: 9440,
//    username: 'viewonly',
//    password: 'viewonly'
//  },
//  {
//    host: '10.4.41.29',
//    port: 9440,
//    username: 'admin',
//    password: 'admin'
//  }
]

module.exports.clusterConfigs = clusterConfigs;
module.exports.firebaseConfig = firebaseConfig;


//var requestOptions = {
//  'strictSSL': false,
//  'headers': {
//    'Authorization': 'Basic YWRtaW46YWRtaW4='
//  }
//};
//requestOptions.auth = {
//  'user': 'admin',
//  'pass': 'admin',
//  'sendImmediately': false
//};