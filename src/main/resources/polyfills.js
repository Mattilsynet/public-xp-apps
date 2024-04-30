// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.assign = function (target, firstSource) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object')
  }

  const to = Object(target)
  for (let i = 1; i < arguments.length; i++) {
    const nextSource = arguments[i]
    if (nextSource === undefined || nextSource === null) {
      continue
    }

    const keysArray = Object.keys(Object(nextSource))
    let nextIndex = 0,
      len = keysArray.length
    for (; nextIndex < len; nextIndex++) {
      const nextKey = keysArray[nextIndex]
      const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey)
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey]
      }
    }
  }
  return to
}

// Array::find
if (!Array.prototype.find) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'find', {
    value: function (predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined')
      }

      const o = Object(this)

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function')
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      // eslint-disable-next-line prefer-rest-params
      const thisArg = arguments[1]

      // 5. Let k be 0.
      let k = 0

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        const kValue = o[k]
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue
        }
        // e. Increase k by 1.
        k++
      }

      // 7. Return undefined.
      return undefined
    },
    configurable: true,
    writable: true,
  })
}
