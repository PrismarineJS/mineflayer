const vec3 = require('vec3')
const { sleep } = require('../../lib/promise_utils')

module.exports = () => async (bot, done) => {
  const command = `/say ${Math.floor(Math.random() * 1000)}`
  const commandBlockPos = vec3(1, 5, 1)
  const commandBlockPosText = commandBlockPos.toArray().join(' ')

  function onMessage (message) {
    if (message.json.translate === 'advMode.setCommand.success' && message.json.with[0] === command) { done() }
  }

  bot.on('message', onMessage)

  // Put and activate the command block
  bot.test.sayEverywhere(`/setblock ${commandBlockPosText} minecraft:command_block`)
  await sleep(100)
  bot.setCommandBlock(commandBlockPos, command, false)
}
