/* */ 
var Infinity = 1 / 0,
    $def = require('./$.def'),
    E = Math.E,
    pow = Math.pow,
    abs = Math.abs,
    exp = Math.exp,
    log = Math.log,
    sqrt = Math.sqrt,
    ceil = Math.ceil,
    floor = Math.floor,
    EPSILON = pow(2, -52),
    EPSILON32 = pow(2, -23),
    MAX32 = pow(2, 127) * (2 - EPSILON32),
    MIN32 = pow(2, -126);
function roundTiesToEven(n) {
  return n + 1 / EPSILON - 1 / EPSILON;
}
function sign(x) {
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}
$def($def.S, 'Math', {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  asinh: asinh,
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  cbrt: function cbrt(x) {
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  },
  expm1: expm1,
  fround: function fround(x) {
    var $abs = abs(x),
        $sign = sign(x),
        a,
        result;
    if ($abs < MIN32)
      return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if (result > MAX32 || result != result)
      return $sign * Infinity;
    return $sign * result;
  },
  hypot: function hypot(value1, value2) {
    var sum = 0,
        i = 0,
        len = arguments.length,
        larg = 0,
        arg,
        div;
    while (i < len) {
      arg = abs(arguments[i++]);
      if (larg < arg) {
        div = larg / arg;
        sum = sum * div * div + 1;
        larg = arg;
      } else if (arg > 0) {
        div = arg / larg;
        sum += div * div;
      } else
        sum += arg;
    }
    return larg === Infinity ? Infinity : larg * sqrt(sum);
  },
  imul: function imul(x, y) {
    var UInt16 = 0xffff,
        xn = +x,
        yn = +y,
        xl = UInt16 & xn,
        yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  log1p: function log1p(x) {
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  log10: function log10(x) {
    return log(x) / Math.LN10;
  },
  log2: function log2(x) {
    return log(x) / Math.LN2;
  },
  sign: sign,
  sinh: function sinh(x) {
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  tanh: function tanh(x) {
    var a = expm1(x = +x),
        b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  trunc: function trunc(it) {
    return (it > 0 ? floor : ceil)(it);
  }
});
