/* */ 
'use strict';
var $ = require('./$'),
    cof = require('./$.cof'),
    $def = require('./$.def');
$def($def.P, 'String', {includes: function includes(searchString) {
    if (cof(searchString) == 'RegExp')
      throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }});
