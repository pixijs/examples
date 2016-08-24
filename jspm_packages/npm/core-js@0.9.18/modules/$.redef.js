/* */ 
var $ = require('./$'),
    tpl = String({}.hasOwnProperty),
    SRC = require('./$.uid').safe('src'),
    _toString = Function.toString;
function $redef(O, key, val, safe) {
  if ($.isFunction(val)) {
    var base = O[key];
    $.hide(val, SRC, base ? String(base) : tpl.replace(/hasOwnProperty/, String(key)));
    if (!('name' in val))
      val.name = key;
  }
  if (O === $.g) {
    O[key] = val;
  } else {
    if (!safe)
      delete O[key];
    $.hide(O, key, val);
  }
}
$redef(Function.prototype, 'toString', function toString() {
  return $.has(this, SRC) ? this[SRC] : _toString.call(this);
});
$.core.inspectSource = function(it) {
  return _toString.call(it);
};
module.exports = $redef;
