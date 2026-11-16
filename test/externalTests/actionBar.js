const assert = require('assert')

module.exports = () => async (bot) => {
  // /title has no actionbar before 1.11
  if (bot.registry.isOlderThan('1.11')) return

  const actionBars = []
  const titleTimes = []
  const onActionBar = (...args) => actionBars.push(args)
  const onTitleTimes = (...args) => titleTimes.push(args)
  bot.on('actionBar', onActionBar)
  bot.on('title_times', onTitleTimes)

  try {
    // Packets arrive in order, so the title that follows marks the end of the action bar
    const titleShown = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        bot.off('title', onTitle)
        reject(new Error('Timeout waiting for the title sent after the action bar'))
      }, 20000)
      function onTitle (text) {
        if (text !== 'After Action Bar') return
        clearTimeout(timeout)
        bot.off('title', onTitle)
        resolve()
      }
      bot.on('title', onTitle)
    })
    bot.chat('/title @a actionbar {"text":"Test Action Bar"}')
    bot.chat('/title @a title {"text":"After Action Bar"}')
    await titleShown
  } finally {
    bot.off('actionBar', onActionBar)
    bot.off('title_times', onTitleTimes)
  }

  assert.strictEqual(actionBars.length, 1, `expected one actionBar event, got ${actionBars.length}`)
  const [jsonMsg, verified] = actionBars[0]
  assert.strictEqual(jsonMsg.toString(), 'Test Action Bar')
  assert.strictEqual(verified, null)
  assert.deepStrictEqual(titleTimes, [], 'an action bar is not a title_times update')
}
