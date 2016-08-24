/* */ 
var $ = require('./$'),
    repeat = require('./$.string-repeat');
module.exports = function(that, minLength, fillChar, left) {
  var S = String($.assertDefined(that));
  if (minLength === undefined)
    return S;
  var intMinLength = $.toInteger(minLength);
  var fillLen = intMinLength - S.length;
  if (fillLen < 0 || fillLen === Infinity) {
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  if (sFillVal.length > fillLen)
    sFillVal = left ? sFillVal.slice(sFillVal.length - fillLen) : sFillVal.slice(0, fillLen);
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
