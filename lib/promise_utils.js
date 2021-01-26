function callbackify (f) {
  return function (...args) {
    const cb = args[f.length]
    return f(...args).then(r => { if (cb) { cb(undefined, r) } return r }, err => { if (cb) { cb(err) } else throw err })
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class Task extends Promise {
  constructor (handler) {
    let cancel
    super((res, rej) => {
      handler(res, rej)
      cancel = (...args) => rej(...args)
    })
    this.cancel = cancel
    // know if promise has been resolved:
    for (const k of ['then', 'catch', 'finally']) {
      this[k] = (...args) => {
        this.done = true
        return super[k](...args)
      }
    }
  }
}

function newTask (handler, options, complete) {
  return new Task((res, rej) => {
    if (options?.timeout) setTimeout(() => rej(Error('timeout')), options?.timeout)
    handler(res, rej)
  }).then(complete, complete)
}

function createTask () {
  const task = {
    done: false
  }
  task.promise = new Promise((resolve, reject) => {
    task.cancel = (err) => {
      reject(err)
      task.done = true
    }
    task.finish = () => {
      resolve()
      task.done = true
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

module.exports = {
  callbackify,
  sleep,
  newTask,
  createTask,
  createDoneTask
}
