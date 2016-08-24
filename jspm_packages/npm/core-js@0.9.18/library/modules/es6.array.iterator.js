/* */ 
var $ = require('./$'),
    setUnscope = require('./$.unscope'),
    ITER = require('./$.uid').safe('iter'),
    $iter = require('./$.iter'),
    step = $iter.step,
    Iterators = $iter.Iterators;
require('./$.iter-define')(Array, 'Array', function(iterated, kind) {
  $.set(this, ITER, {
    o: $.toObject(iterated),
    i: 0,
    k: kind
  });
}, function() {
  var iter = this[ITER],
      O = iter.o,
      kind = iter.k,
      index = iter.i++;
  if (!O || index >= O.length) {
    iter.o = undefined;
    return step(1);
  }
  if (kind == 'keys')
    return step(0, index);
  if (kind == 'values')
    return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');
Iterators.Arguments = Iterators.Array;
setUnscope('keys');
setUnscope('values');
setUnscope('entries');
