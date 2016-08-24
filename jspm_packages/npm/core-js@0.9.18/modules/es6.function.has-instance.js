/* */ 
var $ = require('./$'),
    HAS_INSTANCE = require('./$.wks')('hasInstance'),
    FunctionProto = Function.prototype;
if (!(HAS_INSTANCE in FunctionProto))
  $.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O) {
      if (!$.isFunction(this) || !$.isObject(O))
        return false;
      if (!$.isObject(this.prototype))
        return O instanceof this;
      while (O = $.getProto(O))
        if (this.prototype === O)
          return true;
      return false;
    }});
