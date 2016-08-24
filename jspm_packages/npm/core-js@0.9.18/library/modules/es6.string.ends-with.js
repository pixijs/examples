/* */ 
'use strict';
var $ = require('./$'),
    cof = require('./$.cof'),
    $def = require('./$.def'),
    toLength = $.toLength;
$def($def.P + $def.F * !require('./$.throws')(function() {
  'q'.endsWith(/./);
}), 'String', {endsWith: function endsWith(searchString) {
    if (cof(searchString) == 'RegExp')
      throw TypeError();
    var that = String($.assertDefined(this)),
        endPosition = arguments[1],
        len = toLength(that.length),
        end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }});
