/* */ 
var $ = require('./$'),
    assert = require('./$.assert');
function check(O, proto) {
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? function(buggy, set) {
    try {
      set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
      set({}, []);
    } catch (e) {
      buggy = true;
    }
    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy)
        O.__proto__ = proto;
      else
        set(O, proto);
      return O;
    };
  }() : undefined),
  check: check
};
