/* */ 
var $ = require('./$'),
    enumKeys = require('./$.enum-keys');
module.exports = Object.assign || function assign(target, source) {
  var T = Object($.assertDefined(target)),
      l = arguments.length,
      i = 1;
  while (l > i) {
    var S = $.ES5Object(arguments[i++]),
        keys = enumKeys(S),
        length = keys.length,
        j = 0,
        key;
    while (length > j)
      T[key = keys[j++]] = S[key];
  }
  return T;
};
