/* */ 
(function(process) {
  'use strict';
  var $ = require('./$'),
      ctx = require('./$.ctx'),
      cof = require('./$.cof'),
      $def = require('./$.def'),
      assert = require('./$.assert'),
      forOf = require('./$.for-of'),
      setProto = require('./$.set-proto').set,
      same = require('./$.same'),
      species = require('./$.species'),
      SPECIES = require('./$.wks')('species'),
      RECORD = require('./$.uid').safe('record'),
      PROMISE = 'Promise',
      global = $.g,
      process = global.process,
      isNode = cof(process) == 'process',
      asap = process && process.nextTick || require('./$.task').set,
      P = global[PROMISE],
      isFunction = $.isFunction,
      isObject = $.isObject,
      assertFunction = assert.fn,
      assertObject = assert.obj,
      Wrapper;
  function testResolve(sub) {
    var test = new P(function() {});
    if (sub)
      test.constructor = Object;
    return P.resolve(test) === test;
  }
  var useNative = function() {
    var works = false;
    function P2(x) {
      var self = new P(x);
      setProto(self, P2.prototype);
      return self;
    }
    try {
      works = isFunction(P) && isFunction(P.resolve) && testResolve();
      setProto(P2, P);
      P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
      if (!(P2.resolve(5).then(function() {}) instanceof P2)) {
        works = false;
      }
      if (works && $.DESC) {
        var thenableThenGotten = false;
        P.resolve($.setDesc({}, 'then', {get: function() {
            thenableThenGotten = true;
          }}));
        works = thenableThenGotten;
      }
    } catch (e) {
      works = false;
    }
    return works;
  }();
  function isPromise(it) {
    return isObject(it) && (useNative ? cof.classof(it) == 'Promise' : RECORD in it);
  }
  function sameConstructor(a, b) {
    if (!$.FW && a === P && b === Wrapper)
      return true;
    return same(a, b);
  }
  function getConstructor(C) {
    var S = assertObject(C)[SPECIES];
    return S != undefined ? S : C;
  }
  function isThenable(it) {
    var then;
    if (isObject(it))
      then = it.then;
    return isFunction(then) ? then : false;
  }
  function notify(record) {
    var chain = record.c;
    if (chain.length)
      asap.call(global, function() {
        var value = record.v,
            ok = record.s == 1,
            i = 0;
        function run(react) {
          var cb = ok ? react.ok : react.fail,
              ret,
              then;
          try {
            if (cb) {
              if (!ok)
                record.h = true;
              ret = cb === true ? value : cb(value);
              if (ret === react.P) {
                react.rej(TypeError('Promise-chain cycle'));
              } else if (then = isThenable(ret)) {
                then.call(ret, react.res, react.rej);
              } else
                react.res(ret);
            } else
              react.rej(value);
          } catch (err) {
            react.rej(err);
          }
        }
        while (chain.length > i)
          run(chain[i++]);
        chain.length = 0;
      });
  }
  function isUnhandled(promise) {
    var record = promise[RECORD],
        chain = record.a || record.c,
        i = 0,
        react;
    if (record.h)
      return false;
    while (chain.length > i) {
      react = chain[i++];
      if (react.fail || !isUnhandled(react.P))
        return false;
    }
    return true;
  }
  function $reject(value) {
    var record = this,
        promise;
    if (record.d)
      return;
    record.d = true;
    record = record.r || record;
    record.v = value;
    record.s = 2;
    record.a = record.c.slice();
    setTimeout(function() {
      asap.call(global, function() {
        if (isUnhandled(promise = record.p)) {
          if (isNode) {
            process.emit('unhandledRejection', value, promise);
          } else if (global.console && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        }
        record.a = undefined;
      });
    }, 1);
    notify(record);
  }
  function $resolve(value) {
    var record = this,
        then;
    if (record.d)
      return;
    record.d = true;
    record = record.r || record;
    try {
      if (then = isThenable(value)) {
        asap.call(global, function() {
          var wrapper = {
            r: record,
            d: false
          };
          try {
            then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        record.v = value;
        record.s = 1;
        notify(record);
      }
    } catch (e) {
      $reject.call({
        r: record,
        d: false
      }, e);
    }
  }
  if (!useNative) {
    P = function Promise(executor) {
      assertFunction(executor);
      var record = {
        p: assert.inst(this, P, PROMISE),
        c: [],
        a: undefined,
        s: 0,
        d: false,
        v: undefined,
        h: false
      };
      $.hide(this, RECORD, record);
      try {
        executor(ctx($resolve, record, 1), ctx($reject, record, 1));
      } catch (err) {
        $reject.call(record, err);
      }
    };
    require('./$.mix')(P.prototype, {
      then: function then(onFulfilled, onRejected) {
        var S = assertObject(assertObject(this).constructor)[SPECIES];
        var react = {
          ok: isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected) ? onRejected : false
        };
        var promise = react.P = new (S != undefined ? S : P)(function(res, rej) {
          react.res = assertFunction(res);
          react.rej = assertFunction(rej);
        });
        var record = this[RECORD];
        record.c.push(react);
        if (record.a)
          record.a.push(react);
        if (record.s)
          notify(record);
        return promise;
      },
      'catch': function(onRejected) {
        return this.then(undefined, onRejected);
      }
    });
  }
  $def($def.G + $def.W + $def.F * !useNative, {Promise: P});
  cof.set(P, PROMISE);
  species(P);
  species(Wrapper = $.core[PROMISE]);
  $def($def.S + $def.F * !useNative, PROMISE, {reject: function reject(r) {
      return new (getConstructor(this))(function(res, rej) {
        rej(r);
      });
    }});
  $def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {resolve: function resolve(x) {
      return isPromise(x) && sameConstructor(x.constructor, this) ? x : new this(function(res) {
        res(x);
      });
    }});
  $def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter) {
    P.all(iter)['catch'](function() {});
  })), PROMISE, {
    all: function all(iterable) {
      var C = getConstructor(this),
          values = [];
      return new C(function(res, rej) {
        forOf(iterable, false, values.push, values);
        var remaining = values.length,
            results = Array(remaining);
        if (remaining)
          $.each.call(values, function(promise, index) {
            C.resolve(promise).then(function(value) {
              results[index] = value;
              --remaining || res(results);
            }, rej);
          });
        else
          res(results);
      });
    },
    race: function race(iterable) {
      var C = getConstructor(this);
      return new C(function(res, rej) {
        forOf(iterable, false, function(promise) {
          C.resolve(promise).then(res, rej);
        });
      });
    }
  });
})(require('process'));
