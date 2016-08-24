/* */ 
var $ = require('./$'),
    $def = require('./$.def'),
    setProto = require('./$.set-proto'),
    $iter = require('./$.iter'),
    ITERATOR = require('./$.wks')('iterator'),
    ITER = require('./$.uid').safe('iter'),
    step = $iter.step,
    assert = require('./$.assert'),
    isObject = $.isObject,
    getProto = $.getProto,
    $Reflect = $.g.Reflect,
    _apply = Function.apply,
    assertObject = assert.obj,
    _isExtensible = Object.isExtensible || isObject,
    _preventExtensions = Object.preventExtensions,
    buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));
function Enumerate(iterated) {
  $.set(this, ITER, {
    o: iterated,
    k: undefined,
    i: 0
  });
}
$iter.create(Enumerate, 'Object', function() {
  var iter = this[ITER],
      keys = iter.k,
      key;
  if (keys == undefined) {
    iter.k = keys = [];
    for (key in iter.o)
      keys.push(key);
  }
  do {
    if (iter.i >= keys.length)
      return step(1);
  } while (!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});
var reflect = {
  apply: function apply(target, thisArgument, argumentsList) {
    return _apply.call(target, thisArgument, argumentsList);
  },
  construct: function construct(target, argumentsList) {
    var proto = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype,
        instance = $.create(isObject(proto) ? proto : Object.prototype),
        result = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  },
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  get: function get(target, propertyKey) {
    var receiver = arguments.length < 3 ? target : arguments[2],
        desc = $.getDesc(assertObject(target), propertyKey),
        proto;
    if (desc)
      return $.has(desc, 'value') ? desc.value : desc.get === undefined ? undefined : desc.get.call(receiver);
    return isObject(proto = getProto(target)) ? get(proto, propertyKey, receiver) : undefined;
  },
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return $.getDesc(assertObject(target), propertyKey);
  },
  getPrototypeOf: function getPrototypeOf(target) {
    return getProto(assertObject(target));
  },
  has: function has(target, propertyKey) {
    return propertyKey in target;
  },
  isExtensible: function isExtensible(target) {
    return _isExtensible(assertObject(target));
  },
  ownKeys: require('./$.own-keys'),
  preventExtensions: function preventExtensions(target) {
    assertObject(target);
    try {
      if (_preventExtensions)
        _preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  },
  set: function set(target, propertyKey, V) {
    var receiver = arguments.length < 4 ? target : arguments[3],
        ownDesc = $.getDesc(assertObject(target), propertyKey),
        existingDescriptor,
        proto;
    if (!ownDesc) {
      if (isObject(proto = getProto(target))) {
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if ($.has(ownDesc, 'value')) {
      if (ownDesc.writable === false || !isObject(receiver))
        return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      $.setDesc(receiver, propertyKey, existingDescriptor);
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }
};
if (setProto)
  reflect.setPrototypeOf = function setPrototypeOf(target, proto) {
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  };
$def($def.G, {Reflect: {}});
$def($def.S + $def.F * buggyEnumerate, 'Reflect', {enumerate: function enumerate(target) {
    return new Enumerate(assertObject(target));
  }});
$def($def.S, 'Reflect', reflect);
