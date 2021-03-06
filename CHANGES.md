# Changes

## v0.4.1 9/27/17

* Fix callback argument count and shape

## v0.4.0 9/27/17

* Return stale entries (and invoke the generator) when `lru-cache` is configured
  with `stale: true`

## v0.3.0 7/8/16

* Upgrade `lru-cache` (for `cache.set(key, val, ttl)`)

## v0.2.1 7/5/14

* Don't crash when nothing is waiting

## v0.2.0 5/22/14

* Provide a context to generator functions (contains `callback`, since it's not
  passed as an argument)

## v0.1.3 5/22/14

* Upgrade `lru-cache` to 2.5.0
* Attach `locks` and `cache` to the locking function for visibility

## v0.1.2 11/6/13

* Use `JSON.stringify()` on object keys

## v0.1.1 11/3/13

* Support warming calls without callbacks

## v0.1.0 11/3/13

* Initial version
