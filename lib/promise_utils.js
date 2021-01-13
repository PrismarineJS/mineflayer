function callbackify (f) {
  return function (...args) {
    const cb = args[f.length]
    return f(...args).then(r => {
      if (cb) { cb(undefined, r) }
      return r
    }, err => { if (cb) { cb(err) } else throw err })
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function createTask () {
  const task = {
    done: false
  }
  task.promise = new Promise((resolve, reject) => {
    task.cancel = (err) => {
      if (!task.done) {
        task.done = true
        reject(err)
      }
    }
    task.finish = (result) => {
      if (!task.done) {
        task.done = true
        resolve(result)
      }
    }
  })
  return task
}

function createDoneTask () {
  const task = {
    done: true,
    promise: Promise.resolve(),
    cancel: () => {},
    finish: () => {}
  }
  return task
}

/**
 * Similar to the 'once' function from the 'events' module, but allows you to add a condition for when you want to
 * actually handle the event, as well as a timeout. The listener is additionally removed if a timeout occurs, instead
 * of with 'once' where a listener might stay forever if it never triggers.
 * Note that timeout and checkCondition, both optional, are in the third parameter as an object.
 * @param emitter - The event emitter to listen to
 * @param event - The name of the event you want to listen for
 * @param [timeout=0] - An amount, in milliseconds, for which to wait before considering the promise failed. <0 = none.
 * @param [checkCondition] - A function which matches the same signature of an event emitter handler, and should return something truthy if you want the event to be handled. If this is not provided, all events are handled.
 * @returns {Promise} A promise which will either resolve to an *array* of values in the handled event, or will reject on timeout if applicable. This may never resolve if no timeout is set and the event does not fire.
 */
function onceWithCleanup (emitter, event, { timeout = 0, checkCondition = undefined } = {}) {
  const task = createTask()

  const onEvent = (...data) => {
    if (typeof checkCondition === 'function' && !checkCondition(...data)) {
      return
    }

    task.finish(data)
  }

  emitter.addListener(event, onEvent)

  if (typeof timeout === 'number' && timeout > 0) {
    // For some reason, the call stack gets lost if we don't create the error outside of the .then call
    const timeoutError = new Error(`Event ${event} did not fire within timeout of ${timeout}ms`)
    sleep(timeout).then(() => {
      if (!task.done) {
        task.cancel(timeoutError)
      }
    })
  }

  task.promise.finally(() => emitter.removeListener(event, onEvent))

  return task.promise
}

function withTimeout (promise, timeout) {
  return Promise.race([
    promise,
    sleep(timeout).then(() => {
      throw new Error('Promise timed out.')
    })
  ])
}

module.exports = {
  callbackify,
  sleep,
  createTask,
  createDoneTask,
  onceWithCleanup,
  withTimeout
}
