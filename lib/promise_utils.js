const { on } = require('events')
const EventEmitter = require('events')
const TaskData = require('./task_data.json')
/** @type {Task[]} */
const CurrentTasks = []
const taskUpdate = new EventEmitter()

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @param {Task} task
 */
function removeTask (task) {
  const i = CurrentTasks.indexOf(task)
  if (i < 0) return
  CurrentTasks.splice(i, 1)
  if (task.done === false) {
    task.cancel()
  }
  taskUpdate.emit('update')
}

function taskCompatibleWithRunningTask (taskIdentifier) {
  // Only one task of a compatible task group can be active at any given time.
  for (const group of TaskData.compatibility) {
    // If not part of group skip to next group
    if (!group.includes(taskIdentifier)) continue
    // If taskIdentifier is part of this group and another running task is part of the same group throw error
    for (const task of CurrentTasks) {
      if (group.find(gi => gi === task.taskIdentifier) && group.includes(taskIdentifier)) {
        return { status: false, task: task }
      }
    }
  }
  return { status: true }
}

/**
 * @property {string?} taskIdentifier The identifier name of the task
 * @property {Promise<void>} promise A promise that is resolved when the task is done or rejects if the task is canceled
 * @property {boolean} done If the task is done or not
 */
class Task {
  constructor (name) {
    this.taskIdentifier = name
    this.promise = new Promise((resolve, reject) => {
      this._resolver = resolve
      this._rejecter = reject
    })
    this.done = false
  }

  finish (...data) {
    this.done = true
    removeTask(this)
    this._resolver(...data)
  }

  cancel (...data) {
    this.done = true
    removeTask(this)
    this._rejecter(...data)
  }
}

function createCompatibleTask (taskIdentifier) {
  // console.info('Current tasks:', CurrentTasks, 'New task', taskIdentifier)
  if (!taskIdentifier || !Object.values(TaskData.tasks).includes(taskIdentifier)) throw new Error('Invalid task identifier ' + String(taskIdentifier))
  if (CurrentTasks.find(t => t.taskIdentifier === taskIdentifier)) throw new Error(`Task ${taskIdentifier} already running`)
  // Check task compatibility
  const { status, task: incompatiblyTask } = taskCompatibleWithRunningTask(taskIdentifier)
  if (status === false) {
    // console.info(CurrentTasks, status)
    throw new Error(`Task ${taskIdentifier} incompatible with already running task ${incompatiblyTask.taskIdentifier}`)
  }
  const task = new Task(taskIdentifier)
  CurrentTasks.push(task)
  return task
}

async function waitForTaskCompatibility (taskIdentifier) {
  for await (const _ of on(taskUpdate, 'update')) { // eslint-disable-line no-unused-vars
    if (!taskCompatibleWithRunningTask(taskIdentifier)) continue
    return
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
  const task = createBlankTask()

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
  sleep,
  createBlankTask,
  createCompatibleTask,
  waitForTaskCompatibility,
  createDoneTask,
  taskCompatibleWithRunningTask,
  tasks: TaskData.tasks,
  onceWithCleanup,
  withTimeout
}
