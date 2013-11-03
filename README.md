# locking-cache

I am a locking LRU cache. This means that subsequent calls to a cached function
will wait until the initial call has populated the cache, at which point all
pending calls will be provided with cached data.

## Usage

```javascript
var lockingCache = require("locking-cache"),
    lockedFetch = lockingCache({
      // lru-cache options
      max: 10
    });

var fetch = lockedFetch(function(uri, lock) {
  // generate a key
  var key = uri;

  // lock
  return lock(key, function(unlock) {

    // make the call that produces data to be cached
    return request.get(uri, function(err, rsp, body) {
      // optionally do stuff to data that's been returned

      // unlock, caching non-error arguments
      // all arguments will be passed to pending callbacks
      return unlock(err, rsp, body);
    });
  });
});

// will trigger the initial fetch
fetch("http://google.com/", function(err, rsp, body) {
  // ...

  // rsp and body will be returned from the cache
  // if evicted, a fetch will be triggered again
  fetch("http://google.com/", function(err, rsp, body) {
    ///
  });
});

// will wait for the initial fetch to complete (or fail)
fetch("http://google.com/", function(err, rsp, body) {
  // ...
});
```

See [`lru-cache`](https://github.com/isaacs/node-lru-cache) for cache options.
