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

// Functions (Prefix Multiplier)
//------------------------------

// Converts numerical value to readable format with prefix multiplier
// @param value   - The numerical value that will be converted
// @param symbol    - The symbol appended to the prefix multiplier
// Example: Converts 1000000 Hz to 1MHz
function prefixFormat(value, symbol) {
  // Prefix array
  var prefix = [ '',  // Plain
    'K', // Kilo
    'M', // Mega
    'G', // Giga
    'T', // Tera
    'P'  // Penta
  ];

  if (isNaN(value) || value === 0 || value === null) {
    return 0 + (symbol ? (' ' + symbol) : 0);
  }

  for (var i = prefix.length-1; i >= 0; i--) {
    if ((value / Math.pow(1000, i)) >= 1 || i === 0) {
      // Search for the correct symbol then round off
      return Math.round((value / Math.pow(1000, i)) * 100) / 100 +
        (symbol ? (' ' + prefix[i] + symbol) : 0);
    }
  }
}
module.exports.cleanKeyStrings = cleanKeyStrings;
module.exports.isRequestFailed = isRequestFailed;
module.exports.prefixFormat = prefixFormat;