const path = require('path')
const { Action, ErrorActionAlreadyRunning, ErrorActionConflict } = require(path.join(__dirname, '../actionUtil'))
const ActionData = require(path.join(__dirname, '../action_compatibility_data.json'))
const EventEmitter = require('events')
const { onceWithCleanup } = require('../promise_utils')

module.exports = inject

/**
 * @param {import('../index').Bot} bot
 */
function inject (bot) {
  bot.actions = {}
  /** @type {Action[]} */
  bot.actions.currentActions = []
  bot.actions.actionUpdate = new EventEmitter()

  /**
   * @param {Action} action
   */
  function actionRemove (action) {
    const i = bot.actions.currentActions.indexOf(action)
    if (i < 0) return
    bot.actions.currentActions.splice(i, 1)
    if (action.done === false) {
      action.cancel()
    }
    setTimeout(() => bot.actions.actionUpdate.emit('update'))
  }

  function actionCompatible (actionIdentifier) {
    // Only one action of a compatible action group can be active at any given time.
    for (const group of ActionData.compatibility) {
      // If not part of group skip to next group
      if (!group.includes(actionIdentifier)) continue
      // If actionIdentifier is part of this group and another running action is part of the same group throw error
      for (const action of bot.actions.currentActions) {
        if (group.find(gi => gi === action.actionIdentifier) && group.includes(actionIdentifier)) {
          return { status: false, action: action }
        }
      }
    }
    return { status: true }
  }

  function actionCreateCompatible (actionIdentifier) {
    if (!actionIdentifier || !Object.values(ActionData.actions).includes(actionIdentifier)) throw new Error('Invalid action identifier ' + String(actionIdentifier))
    if (bot.actions.currentActions.find(t => t.actionIdentifier === actionIdentifier)) throw new ErrorActionAlreadyRunning(`Action ${actionIdentifier} already running`)
    // Check action compatibility
    const { status, action: incompatiblyAction } = actionCompatible(actionIdentifier)
    if (status === false) {
      // console.info(CurrentActions, status)
      throw new ErrorActionConflict(`Action ${actionIdentifier} incompatible with already running action ${incompatiblyAction.actionIdentifier}`)
    }
    const action = new Action(actionIdentifier, () => actionRemove(action))
    bot.actions.currentActions.push(action)
    return action
  }

  async function actionWaitCompatibility (actionIdentifier) {
    const { status } = actionCompatible(actionIdentifier)
    if (status === true) return
    onceWithCleanup(bot.actions.actionUpdate, 'update', {
      checkCondition: () => {
        const { status } = actionCompatible(actionIdentifier)
        return status !== false
      }
    })
  }

  bot.actionCompatible = actionCompatible
  bot.actionCreateCompatible = actionCreateCompatible
  bot.actionWaitCompatibility = actionWaitCompatibility
  bot.actionRemove = actionRemove
}
