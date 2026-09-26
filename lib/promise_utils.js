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
 * @param [signal] - An AbortSignal which, when aborted, removes the listener and rejects the promise with the signal's reason.
 * @returns {Promise} A promise which will either resolve to an *array* of values in the handled event, or will reject on timeout if applicable. This may never resolve if no timeout is set and the event does not fire.
 */
function onceWithCleanup (emitter, event, { timeout = 0, checkCondition = undefined, signal = undefined } = {}) {
  const task = createTask()

  const onEvent = (...data) => {
    if (typeof checkCondition === 'function') {
      let matches
      try {
        matches = checkCondition(...data)
      } catch (err) {
        // checkCondition runs inside emit(), which for client events is the socket
        // read path: throwing there unwinds it and the client silently stops
        // receiving packets. Reject the promise instead, so the caller sees it.
        task.cancel(err)
        return
      }
      if (!matches) return
    }

    task.finish(data)
  }

  emitter.addListener(event, onEvent)

  let onAbort
  if (signal) {
    const abortError = () => signal.reason instanceof Error
      ? signal.reason
      : new Error(`Waiting for event ${event} was aborted`)
    if (signal.aborted) {
      task.cancel(abortError())
    } else {
      onAbort = () => task.cancel(abortError())
      signal.addEventListener('abort', onAbort, { once: true })
    }
  }

  if (typeof timeout === 'number' && timeout > 0) {
    // For some reason, the call stack gets lost if we don't create the error outside of the .then call
    const timeoutError = new Error(`Event ${event} did not fire within timeout of ${timeout}ms`)
    sleep(timeout).then(() => {
      if (!task.done) {
        task.cancel(timeoutError)
      }
    })
  }

  task.promise.catch(() => {}).finally(() => {
    emitter.removeListener(event, onEvent)
    if (onAbort) signal.removeEventListener('abort', onAbort)
  })

  return task.promise
}

function once (emitter, event, timeout = 20000) {
  return onceWithCleanup(emitter, event, { timeout })
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
  once,
  sleep,
  createTask,
  createDoneTask,
  onceWithCleanup,
  withTimeout
}
