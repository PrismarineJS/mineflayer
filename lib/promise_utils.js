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
      if (!task.done) {
        task.done = true
        reject(err)
      }
    }
    task.finish = () => {
      if (!task.done) {
        task.done = true
        resolve()
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

module.exports = {
  callbackify,
  sleep,
  createTask,
  createDoneTask
}
