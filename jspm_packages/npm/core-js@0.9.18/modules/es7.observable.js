/* */ 
var $ = require('./$'),
    $def = require('./$.def'),
    $redef = require('./$.redef'),
    $mix = require('./$.mix'),
    asap = require('./$.task').set,
    assert = require('./$.assert'),
    OBSERVER = require('./$.wks')('observer'),
    isFunction = $.isFunction,
    assertObject = assert.obj,
    assertFunction = assert.fn;
function cancelSubscription(observer) {
  var subscription = observer._subscription;
  if (!subscription)
    return;
  observer._subscription = undefined;
  try {
    subscription.unsubscribe();
  } finally {
    observer._observer = undefined;
  }
}
function closeSubscription(observer) {
  observer._observer = undefined;
  cancelSubscription(observer);
}
function hasUnsubscribe(x) {
  return $.isObject(x) && isFunction(x.unsubscribe);
}
function SubscriptionObserver(observer) {
  this._observer = observer;
  this._subscription = undefined;
}
$mix(SubscriptionObserver.prototype, {
  next: function(value) {
    var observer = this._observer,
        result;
    if (!observer)
      return {
        value: undefined,
        done: true
      };
    try {
      result = observer.next(value);
    } catch (e) {
      closeSubscription(this);
      throw e;
    }
    if (result && result.done)
      closeSubscription(this);
    return result;
  },
  'throw': function(value) {
    var observer = this._observer;
    if (!observer)
      throw value;
    this._observer = undefined;
    try {
      if (!('throw' in observer))
        throw value;
      return observer['throw'](value);
    } finally {
      cancelSubscription(this);
    }
  },
  'return': function(value) {
    var observer = this._observer;
    if (!observer)
      return {
        value: value,
        done: true
      };
    this._observer = undefined;
    try {
      if (!('return' in observer))
        return {
          value: value,
          done: true
        };
      return observer['return'](value);
    } finally {
      cancelSubscription(this);
    }
  }
});
function Observable(subscriber) {
  this._subscriber = assertFunction(subscriber);
}
$mix(Observable.prototype, {
  subscribe: function(observer) {
    assertObject(observer);
    var unsubscribed = false,
        that = this,
        subscription;
    asap.call(global, function() {
      if (!unsubscribed)
        subscription = that[OBSERVER](observer);
    });
    return {unsubscribe: function() {
        if (unsubscribed)
          return;
        unsubscribed = true;
        if (subscription)
          subscription.unsubscribe();
      }};
  },
  forEach: function(fn, thisArg) {
    var that = this;
    return new ($.core.Promise || $.g.Promise)(function(resolve, reject) {
      assertFunction(fn);
      that.subscribe({
        next: function(value) {
          fn.call(thisArg, value);
        },
        'throw': function(value) {
          reject(value);
        },
        'return': function() {
          resolve(undefined);
        }
      });
    });
  }
});
$redef(Observable.prototype, OBSERVER, function(observer) {
  observer = new SubscriptionObserver(assertObject(observer));
  var subscription;
  try {
    subscription = this._subscriber.call(undefined, observer);
    if (!hasUnsubscribe(subscription)) {
      var unsubscribe = isFunction(subscription) ? subscription : function() {
        observer['return']();
      };
      subscription = {unsubscribe: unsubscribe};
    }
  } catch (e) {
    observer['throw'](e);
  }
  observer._subscription = subscription;
  if (!observer._observer)
    cancelSubscription(observer);
  return subscription;
});
$redef(Observable, 'from', function(x) {
  if (assertObject(x)._subscriber && x.constructor === this)
    return x;
  var subscribeFunction = assertFunction(x[OBSERVER]);
  return new this(function(sink) {
    subscribeFunction.call(x, sink);
  });
});
$def($def.G + $def.F, {Observable: Observable});
$def($def.S, 'Symbol', {observer: OBSERVER});
