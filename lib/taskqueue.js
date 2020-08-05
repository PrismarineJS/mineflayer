/**
 * A utility class for queuing up a set of actions to preform asynchronously.
 */
class TaskQueue {
  constructor () {
    this._tasks = []
    this.stopOnError = true
  }

  /**
   * Adds a new task to the end of this task queue.
   *
   * @param task - The async task to run.
   */
  add (task) {
    this._tasks.push(task)
  }

  /**
   * Adds a new sync task to the end of this task queue.
   *
   * @param task - The sync task to run.
   */
  addSync (task) {
    this._tasks.push(cb => {
      try {
        task()
      } catch (err) {
        cb(err)
        return
      }

      cb()
    })
  }

  /**
   * Runs all tasks currently in this queue and empties the queue.
   *
   * @param cb - The optional callback to run when all tasks are finished.
   */
  runAll (cb) {
    const taskList = this._tasks
    this._tasks = []

    if (!cb) cb = () => {}

    let index = -1
    const runNext = () => {
      index++
      if (index >= taskList.length) {
        cb()
        return
      }

      try {
        taskList[index](err => {
          if (err) {
            cb(err)
            if (this.stopOnError) return
          }

          runNext()
        })
      } catch (err) {
        cb(err)
      }
    }

    runNext()
  }
}

module.exports = TaskQueue
