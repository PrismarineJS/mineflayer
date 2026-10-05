const { createConfig, createState, step } = require('../core/health')
const { createCodec } = require('../core/healthCodec')
const { createDriver } = require('../core/driver')

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
