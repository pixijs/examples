/* */ 
var $ = require('./$'),
    $def = require('./$.def'),
    abs = Math.abs,
    floor = Math.floor,
    _isFinite = $.g.isFinite,
    MAX_SAFE_INTEGER = 0x1fffffffffffff;
function isInteger(it) {
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  EPSILON: Math.pow(2, -52),
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  },
  isInteger: isInteger,
  isNaN: function isNaN(number) {
    return number != number;
  },
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  parseFloat: parseFloat,
  parseInt: parseInt
});
