const { createState, step } = require('../core/health')
const { createDriver } = require('../core/driver')

module.exports = inject

function inject (bot, options) {
  const state = createState({ supportFeature: bot.supportFeature, respawn: options.respawn })
  const { dispatch, exposeState } = createDriver(bot, step, state)

  exposeState(['isAlive', 'health', 'food', 'foodSaturation'])

  for (const name of ['respawn', 'update_health']) {
    bot._client.on(name, (data) => dispatch({ type: 'packet', name, data }))
  }

  bot.respawn = () => dispatch({ type: 'command', name: 'respawn' })
}
