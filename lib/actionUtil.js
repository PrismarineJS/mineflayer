const ActionData = require('./action_compatibility_data.json')

/**
 * @property {string?} actionIdentifier The identifier name of the action
 * @property {Promise<void>} promise A promise that is resolved when the action is done or rejects if the action is canceled
 * @property {boolean} done If the action is done or not
 */
class Action {
  constructor (name, onfinishSynchronous = null) {
    this.actionIdentifier = name
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

class ErrorActionConflict extends Error {
  constructor (...param) {
    super(...param)
    this.name = 'Action Conflict'
  }
}

class ErrorActionAlreadyRunning extends Error {
  constructor (...param) {
    super(...param)
    this.name = 'Action Already Running'
  }
}

function actionCreateBlank () {
  return new Action(undefined)
}

function actionCreateDone () {
  const action = actionCreateBlank()
  action.finish()
  return action
}

module.exports = {
  actionCreateBlank,
  actionCreateDone,
  Action,
  actions: ActionData.actions,
  ErrorActionConflict,
  ErrorActionAlreadyRunning
}
