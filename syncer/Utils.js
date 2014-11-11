/**
 * Created by van on 11/10/14.
 */

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

function isRequestFailed(error, res, body) {
  if (error) {
    console.error(error);
    return true;
  }

  if (res.statusCode != 200) {
    console.error('ERROR: ' + res.request.href);
    console.error('statusCode: ' + res.statusCode);
    console.error('statusMessage: ' + res.statusMessage);
    console.error('message' + body);
    return true;
  }
  return false;
}
module.exports.cleanKeyStrings = cleanKeyStrings;
module.exports.isRequestFailed = isRequestFailed;