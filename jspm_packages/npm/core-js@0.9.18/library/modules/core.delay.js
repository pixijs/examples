/* */ 
var $ = require('./$'),
    $def = require('./$.def'),
    partial = require('./$.partial');
$def($def.G + $def.F, {delay: function(time) {
    return new ($.core.Promise || $.g.Promise)(function(resolve) {
      setTimeout(partial.call(resolve, true), time);
    });
  }});
