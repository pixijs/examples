/* */ 
var $ = require('./$'),
    $def = require('./$.def');
$def($def.S, 'String', {raw: function raw(callSite) {
    var tpl = $.toObject(callSite.raw),
        len = $.toLength(tpl.length),
        sln = arguments.length,
        res = [],
        i = 0;
    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < sln)
        res.push(String(arguments[i]));
    }
    return res.join('');
  }});
