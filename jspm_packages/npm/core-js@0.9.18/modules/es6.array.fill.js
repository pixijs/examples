/* */ 
'use strict';
var $ = require('./$'),
    $def = require('./$.def'),
    toIndex = $.toIndex;
$def($def.P, 'Array', {fill: function fill(value) {
    var O = Object($.assertDefined(this)),
        length = $.toLength(O.length),
        index = toIndex(arguments[1], length),
        end = arguments[2],
        endPos = end === undefined ? length : toIndex(end, length);
    while (endPos > index)
      O[index++] = value;
    return O;
  }});
require('./$.unscope')('fill');
