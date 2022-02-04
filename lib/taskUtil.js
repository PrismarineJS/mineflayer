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

class ErrorTaskConflict extends Error {
  constructor (...param) {
    super(...param)
    this.name = 'Task Conflict'
  }
}

class ErrorTaskAlreadyRunning extends Error {
  constructor (...param) {
    super(...param)
    this.name = 'Task Already Running'
  }
}

function taskCreateBlank () {
  return new Task(undefined)
}

function taskCreateDone () {
  const task = taskCreateBlank()
  task.finish()
  return task
}

module.exports = {
  taskCreateBlank,
  taskCreateDone,
  Task,
  tasks: TaskData.tasks,
  ErrorTaskConflict,
  ErrorTaskAlreadyRunning
}
