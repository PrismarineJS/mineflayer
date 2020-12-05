function callbackify (f) {
  return function (...args) {
    const cb = args[f.length]
    return f(...args).then(r => { if (cb) { cb(undefined, r) } return r }, err => { if (cb) { cb(err) } else throw err })
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
  createTask,
  createDoneTask
}
