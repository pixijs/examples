/* */ 
var $ = require('./$'),
    $def = require('./$.def'),
    invoke = require('./$.invoke'),
    partial = require('./$.partial'),
    navigator = $.g.navigator,
    MSIE = !!navigator && /MSIE .\./.test(navigator.userAgent);
function wrap(set) {
  return MSIE ? function(fn, time) {
    return set(invoke(partial, [].slice.call(arguments, 2), $.isFunction(fn) ? fn : Function(fn)), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout: wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
