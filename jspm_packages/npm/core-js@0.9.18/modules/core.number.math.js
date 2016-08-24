/* */ 
'use strict';
var $ = require('./$'),
    $def = require('./$.def'),
    invoke = require('./$.invoke'),
    methods = {};
methods.random = function(lim) {
  var a = +this,
      b = lim == undefined ? 0 : +lim,
      m = Math.min(a, b);
  return Math.random() * (Math.max(a, b) - m) + m;
};
if ($.FW)
  $.each.call(('round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' + 'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc').split(','), function(key) {
    var fn = Math[key];
    if (fn)
      methods[key] = function() {
        var args = [+this],
            i = 0;
        while (arguments.length > i)
          args.push(arguments[i++]);
        return invoke(fn, args);
      };
  });
$def($def.P + $def.F, 'Number', methods);
