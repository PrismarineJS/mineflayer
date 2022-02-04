const path = require('path')
const { Task, ErrorTaskAlreadyRunning, ErrorTaskConflict } = require(path.join(__dirname, '../tasks.js'))
const TaskData = require(path.join(__dirname, '../task_data.json'))
const { on } = require('events')
const EventEmitter = require('events')
const { onceWithCleanup } = require('../promise_utils')

module.exports = inject

/**
 * @param {import('../index').Bot} bot
 */
function inject (bot) {
  bot.tasks = {}
  /** @type {Task[]} */
  bot.tasks.currentTasks = []
  bot.tasks.taskUpdate = new EventEmitter()

  /**
   * @param {Task} task
   */
  function taskRemove (task) {
    const i = bot.tasks.currentTasks.indexOf(task)
    if (i < 0) return
    bot.tasks.currentTasks.splice(i, 1)
    if (task.done === false) {
      task.cancel()
    }
    setTimeout(() => bot.tasks.taskUpdate.emit('update'))
  }

  function taskCompatibleWithRunningTask (taskIdentifier) {
    // Only one task of a compatible task group can be active at any given time.
    for (const group of TaskData.compatibility) {
      // If not part of group skip to next group
      if (!group.includes(taskIdentifier)) continue
      // If taskIdentifier is part of this group and another running task is part of the same group throw error
      for (const task of bot.tasks.currentTasks) {
        if (group.find(gi => gi === task.taskIdentifier) && group.includes(taskIdentifier)) {
          return { status: false, task: task }
        }
      }
    }
    return { status: true }
  }

  function taskCreateCompatible (taskIdentifier) {
    if (!taskIdentifier || !Object.values(TaskData.tasks).includes(taskIdentifier)) throw new Error('Invalid task identifier ' + String(taskIdentifier))
    if (bot.tasks.currentTasks.find(t => t.taskIdentifier === taskIdentifier)) throw new ErrorTaskAlreadyRunning(`Task ${taskIdentifier} already running`)
    // Check task compatibility
    const { status, task: incompatiblyTask } = taskCompatibleWithRunningTask(taskIdentifier)
    if (status === false) {
      // console.info(CurrentTasks, status)
      throw new ErrorTaskConflict(`Task ${taskIdentifier} incompatible with already running task ${incompatiblyTask.taskIdentifier}`)
    }
    const task = new Task(taskIdentifier, () => taskRemove(task))
    bot.tasks.currentTasks.push(task)
    return task
  }

  async function taskWaitCompatibility (taskIdentifier) {
    const { status } = taskCompatibleWithRunningTask(taskIdentifier)
    if (status === true) return
    onceWithCleanup(bot.tasks.taskUpdate, 'update', { 
      checkCondition: () => {
        const { status } = taskCompatibleWithRunningTask(taskIdentifier)
        return status !== false
      }
    })
  }

  bot.taskCompatibleWithRunningTask = taskCompatibleWithRunningTask
  bot.taskCreateCompatible = taskCreateCompatible
  bot.taskWaitCompatibility = taskWaitCompatibility
  bot.taskRemove = taskRemove
}
