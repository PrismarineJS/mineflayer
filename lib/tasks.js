const TaskData = require('./task_data.json')

/**
 * @property {string?} taskIdentifier The identifier name of the task
 * @property {Promise<void>} promise A promise that is resolved when the task is done or rejects if the task is canceled
 * @property {boolean} done If the task is done or not
 */
class Task {
  constructor (name, onfinishSynchronous = null) {
    this.taskIdentifier = name
    this.promise = new Promise((resolve, reject) => {
      this._resolver = resolve
      this._rejecter = reject
    })
    this.done = false
    this._onFinishSynchronous = onfinishSynchronous
  }

  finish (...data) {
    this.done = true
    if (this._onFinishSynchronous) this._onFinishSynchronous()
    this._resolver(...data)
  }

  cancel (...data) {
    this.done = true
    if (this._onFinishSynchronous) this._onFinishSynchronous()
    this._rejecter(...data)
  }
}

function createBlankTask () {
  return new Task(undefined)
}

function createDoneTask () {
  const task = createBlankTask()
  task.finish()
  return task
}

module.exports = {
  createBlankTask,
  createDoneTask,
  Task,
  tasks: TaskData.tasks
}
