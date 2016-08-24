/* */ 
var $ = require('./$'),
    ctx = require('./$.ctx'),
    $def = require('./$.def'),
    $iter = require('./$.iter'),
    call = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter) {
  Array.from(iter);
}), 'Array', {from: function from(arrayLike) {
    var O = Object($.assertDefined(arrayLike)),
        mapfn = arguments[1],
        mapping = mapfn !== undefined,
        f = mapping ? ctx(mapfn, arguments[2], 2) : undefined,
        index = 0,
        length,
        result,
        step,
        iterator;
    if ($iter.is(O)) {
      iterator = $iter.get(O);
      result = new (typeof this == 'function' ? this : Array);
      for (; !(step = iterator.next()).done; index++) {
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for (; length > index; index++) {
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }});
