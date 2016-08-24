/* */ 
(function(process) {
  'use strict';
  var $ = require('./$'),
      ctx = require('./$.ctx'),
      cof = require('./$.cof'),
      invoke = require('./$.invoke'),
      cel = require('./$.dom-create'),
      global = $.g,
      isFunction = $.isFunction,
      html = $.html,
      process = global.process,
      setTask = global.setImmediate,
      clearTask = global.clearImmediate,
      MessageChannel = global.MessageChannel,
      counter = 0,
      queue = {},
      ONREADYSTATECHANGE = 'onreadystatechange',
      defer,
      channel,
      port;
  function run() {
    var id = +this;
    if ($.has(queue, id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event) {
    run.call(event.data);
  }
  if (!isFunction(setTask) || !isFunction(clearTask)) {
    setTask = function(fn) {
      var args = [],
          i = 1;
      while (arguments.length > i)
        args.push(arguments[i++]);
      queue[++counter] = function() {
        invoke(isFunction(fn) ? fn : Function(fn), args);
      };
      defer(counter);
      return counter;
    };
    clearTask = function(id) {
      delete queue[id];
    };
    if (cof(process) == 'process') {
      defer = function(id) {
        process.nextTick(ctx(run, id, 1));
      };
    } else if (global.addEventListener && isFunction(global.postMessage) && !global.importScripts) {
      defer = function(id) {
        global.postMessage(id, '*');
      };
      global.addEventListener('message', listner, false);
    } else if (isFunction(MessageChannel)) {
      channel = new MessageChannel;
      port = channel.port2;
      channel.port1.onmessage = listner;
      defer = ctx(port.postMessage, port, 1);
    } else if (ONREADYSTATECHANGE in cel('script')) {
      defer = function(id) {
        html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function() {
          html.removeChild(this);
          run.call(id);
        };
      };
    } else {
      defer = function(id) {
        setTimeout(ctx(run, id, 1), 0);
      };
    }
  }
  module.exports = {
    set: setTask,
    clear: clearTask
  };
})(require('process'));
