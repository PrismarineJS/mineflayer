const { createConfig, createState, step } = require('./core')
const { createCodec } = require('./codec')
const { createDriver } = require('../../sansio/driver')

module.exports = inject

function inject (bot, options) {
  const state = createState()
  const { dispatch, listen, exposeState } = createDriver(bot, {
    step,
    config: createConfig({ respawn: options.respawn }),
    state,
    codec: createCodec(bot.supportFeature)
  })

  exposeState(['isAlive', 'health', 'food', 'foodSaturation'])
  listen()

  bot.respawn = () => dispatch({ type: 'respawnCommand' })
}
