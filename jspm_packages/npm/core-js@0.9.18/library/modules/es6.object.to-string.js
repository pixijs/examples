/* */ 
'use strict';
var cof = require('./$.cof'),
    tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if (require('./$').FW && cof(tmp) != 'z') {
  require('./$.redef')(Object.prototype, 'toString', function toString() {
    return '[object ' + cof.classof(this) + ']';
  }, true);
}
