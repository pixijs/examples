/* */ 
'use strict';
var $ = require('./$'),
    setTag = require('./$.cof').set,
    uid = require('./$.uid'),
    shared = require('./$.shared'),
    $def = require('./$.def'),
    $redef = require('./$.redef'),
    keyOf = require('./$.keyof'),
    enumKeys = require('./$.enum-keys'),
    assertObject = require('./$.assert').obj,
    ObjectProto = Object.prototype,
    DESC = $.DESC,
    has = $.has,
    $create = $.create,
    getDesc = $.getDesc,
    setDesc = $.setDesc,
    desc = $.desc,
    $names = require('./$.get-names'),
    getNames = $names.get,
    toObject = $.toObject,
    $Symbol = $.g.Symbol,
    setter = false,
    TAG = uid('tag'),
    HIDDEN = uid('hidden'),
    _propertyIsEnumerable = {}.propertyIsEnumerable,
    SymbolRegistry = shared('symbol-registry'),
    AllSymbols = shared('symbols'),
    useNative = $.isFunction($Symbol);
var setSymbolDesc = DESC ? function() {
  try {
    return $create(setDesc({}, HIDDEN, {get: function() {
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }}))[HIDDEN] || setDesc;
  } catch (e) {
    return function(it, key, D) {
      var protoDesc = getDesc(ObjectProto, key);
      if (protoDesc)
        delete ObjectProto[key];
      setDesc(it, key, D);
      if (protoDesc && it !== ObjectProto)
        setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;
function wrap(tag) {
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value) {
      if (has(this, HIDDEN) && has(this[HIDDEN], tag))
        this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}
function defineProperty(it, key, D) {
  if (D && has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN))
        setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key])
        it[HIDDEN][key] = false;
      D = $create(D, {enumerable: desc(0, false)});
    }
    return setSymbolDesc(it, key, D);
  }
  return setDesc(it, key, D);
}
function defineProperties(it, P) {
  assertObject(it);
  var keys = enumKeys(P = toObject(P)),
      i = 0,
      l = keys.length,
      key;
  while (l > i)
    defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P) {
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function propertyIsEnumerable(key) {
  var E = _propertyIsEnumerable.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
}
function getOwnPropertyDescriptor(it, key) {
  var D = getDesc(it = toObject(it), key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))
    D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it) {
  var names = getNames(toObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i)
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN)
      result.push(key);
  return result;
}
function getOwnPropertySymbols(it) {
  var names = getNames(toObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i)
    if (has(AllSymbols, key = names[i++]))
      result.push(AllSymbols[key]);
  return result;
}
if (!useNative) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol)
      throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function() {
    return this[TAG];
  });
  $.create = create;
  $.setDesc = defineProperty;
  $.getDesc = getOwnPropertyDescriptor;
  $.setDescs = defineProperties;
  $.getNames = $names.get = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;
  if ($.DESC && $.FW)
    $redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
}
var symbolStatics = {
  'for': function(key) {
    return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  keyFor: function keyFor(key) {
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function() {
    setter = true;
  },
  useSimple: function() {
    setter = false;
  }
};
$.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function(it) {
  var sym = require('./$.wks')(it);
  symbolStatics[it] = useNative ? sym : wrap(sym);
});
setter = true;
$def($def.G + $def.W, {Symbol: $Symbol});
$def($def.S, 'Symbol', symbolStatics);
$def($def.S + $def.F * !useNative, 'Object', {
  create: create,
  defineProperty: defineProperty,
  defineProperties: defineProperties,
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  getOwnPropertyNames: getOwnPropertyNames,
  getOwnPropertySymbols: getOwnPropertySymbols
});
setTag($Symbol, 'Symbol');
setTag(Math, 'Math', true);
setTag($.g.JSON, 'JSON', true);
