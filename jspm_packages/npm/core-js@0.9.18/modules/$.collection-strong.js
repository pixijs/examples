/* */ 
'use strict';
var $ = require('./$'),
    ctx = require('./$.ctx'),
    safe = require('./$.uid').safe,
    assert = require('./$.assert'),
    forOf = require('./$.for-of'),
    step = require('./$.iter').step,
    $has = $.has,
    set = $.set,
    isObject = $.isObject,
    hide = $.hide,
    isExtensible = Object.isExtensible || isObject,
    ID = safe('id'),
    O1 = safe('O1'),
    LAST = safe('last'),
    FIRST = safe('first'),
    ITER = safe('iter'),
    SIZE = $.DESC ? safe('size') : 'size',
    id = 0;
function fastKey(it, create) {
  if (!isObject(it))
    return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!$has(it, ID)) {
    if (!isExtensible(it))
      return 'F';
    if (!create)
      return 'E';
    hide(it, ID, ++id);
  }
  return 'O' + it[ID];
}
function getEntry(that, key) {
  var index = fastKey(key),
      entry;
  if (index !== 'F')
    return that[O1][index];
  for (entry = that[FIRST]; entry; entry = entry.n) {
    if (entry.k == key)
      return entry;
  }
}
module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function(that, iterable) {
      assert.inst(that, C, NAME);
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if (iterable != undefined)
        forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      clear: function clear() {
        for (var that = this,
            data = that[O1],
            entry = that[FIRST]; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p)
            entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      'delete': function(key) {
        var that = this,
            entry = getEntry(that, key);
        if (entry) {
          var next = entry.n,
              prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if (prev)
            prev.n = next;
          if (next)
            next.p = prev;
          if (that[FIRST] == entry)
            that[FIRST] = next;
          if (that[LAST] == entry)
            that[LAST] = prev;
          that[SIZE]--;
        }
        return !!entry;
      },
      forEach: function forEach(callbackfn) {
        var f = ctx(callbackfn, arguments[1], 3),
            entry;
        while (entry = entry ? entry.n : this[FIRST]) {
          f(entry.v, entry.k, this);
          while (entry && entry.r)
            entry = entry.p;
        }
      },
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });
    if ($.DESC)
      $.setDesc(C.prototype, 'size', {get: function() {
          return assert.def(this[SIZE]);
        }});
    return C;
  },
  def: function(that, key, value) {
    var entry = getEntry(that, key),
        prev,
        index;
    if (entry) {
      entry.v = value;
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true),
        k: key,
        v: value,
        p: prev = that[LAST],
        n: undefined,
        r: false
      };
      if (!that[FIRST])
        that[FIRST] = entry;
      if (prev)
        prev.n = entry;
      that[SIZE]++;
      if (index !== 'F')
        that[O1][index] = entry;
    }
    return that;
  },
  getEntry: getEntry,
  setIter: function(C, NAME, IS_MAP) {
    require('./$.iter-define')(C, NAME, function(iterated, kind) {
      set(this, ITER, {
        o: iterated,
        k: kind
      });
    }, function() {
      var iter = this[ITER],
          kind = iter.k,
          entry = iter.l;
      while (entry && entry.r)
        entry = entry.p;
      if (!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])) {
        iter.o = undefined;
        return step(1);
      }
      if (kind == 'keys')
        return step(0, entry.k);
      if (kind == 'values')
        return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
  }
};
