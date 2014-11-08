var firebaseConfig = {
  rootPath: 'https://nx-cluster-example.firebaseio.com/'
}
var clusterConfigs = [
  {
    host: '10.3.189.126',
    port: 9440,
    username: 'admin',
    password: 'admin'
  },
  {
    host: '10.3.100.73',
    port: 9440,
    username: 'viewonly',
    password: 'viewonly'
  },
  {
    host: '1.1.1.1',
    port: 9440,
    username: 'viewonly',
    password: 'viewonly'
  }
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