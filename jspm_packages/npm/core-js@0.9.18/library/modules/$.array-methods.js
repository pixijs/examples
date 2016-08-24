/* */ 
var $ = require('./$'),
    ctx = require('./$.ctx');
module.exports = function(TYPE) {
  var IS_MAP = TYPE == 1,
      IS_FILTER = TYPE == 2,
      IS_SOME = TYPE == 3,
      IS_EVERY = TYPE == 4,
      IS_FIND_INDEX = TYPE == 6,
      NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that) {
    var O = Object($.assertDefined($this)),
        self = $.ES5Object(O),
        f = ctx(callbackfn, that, 3),
        length = $.toLength(self.length),
        index = 0,
        result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined,
        val,
        res;
    for (; length > index; index++)
      if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (TYPE) {
          if (IS_MAP)
            result[index] = res;
          else if (res)
            switch (TYPE) {
              case 3:
                return true;
              case 5:
                return val;
              case 6:
                return index;
              case 2:
                result.push(val);
            }
          else if (IS_EVERY)
            return false;
        }
      }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
