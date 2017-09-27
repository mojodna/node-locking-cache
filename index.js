"use strict";

var LRU = require("lru-cache");

module.exports = function(options) {
  var cacheFactory = arguments[arguments.length - 1];

  if (typeof options === "function") {
    options = {};
  }

  if (typeof cacheFactory !== "function") {
    cacheFactory = function(opts) {
      return LRU(opts);
    };
  }

  var locks = LRU(),
      cache = cacheFactory(options);

  var wrapped = function locked(fn) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);

      // extract the eventual callback, defaulting to a noop if none was
      // provided
      var callback = function() {};

      // extract the callback from passed args
      if (typeof args[args.length - 1] === "function") {
        callback = args.pop();
      }

      // replace the callback with a lock function
      args.push(function lock(key, generator) {
        if (typeof key === "object") {
          key = JSON.stringify(key);
        }

        var data;
        var stale = false;
        if (!cache.has(key) && (data = cache.get(key)) != null) {
          // stale hit; return data but still invoke the generator below
          stale = true;
          setImmediate(callback, [null].concat(data));

          // reset callback since we just called it
          callback = null;
        }

        if (cache.has(key)) {
          // cache hit!
          return setImmediate(callback, [null].concat(cache.get(key)));
        }

        if (locks.has(key)) {
          // already locked

          if (callback != null) {
            var callbacks = locks.get(key);
            callbacks.push(callback);
            locks.set(key, callbacks);
          }

          return;
        }

        if (stale) {
          // populate the cache temporarily for subsequent requests (it will be
          // overwritten shortly by the generating function)
          cache.set(key, data);
        }

        locks.set(key, [callback].filter(function(x) {
          return x != null;
        }));

        return generator(function unlock(err) {
          var waiting = locks.get(key) || [];
          args = Array.prototype.slice.call(arguments, 0);
          data = args.slice(1);

          // clear the lock now that we've got a list of pending callbacks
          locks.del(key);

          if (!err) {
            // store the data as an array
            cache.set(key, data);
          }

          // pass generated data to all waiting callbacks
          waiting.forEach(function(cb) {
            return setImmediate(cb, args);
          });
        });
      });

      var context = {
        callback: callback
      };

      // call the wrapped function with updated arguments
      return fn.apply(context, args);
    };
  };

  wrapped.locks = locks;
  wrapped.cache = cache;

  return wrapped;
};
