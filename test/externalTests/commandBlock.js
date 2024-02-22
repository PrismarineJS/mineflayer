const assert = require('assert')
const { Vec3 } = require('vec3')
const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const command = `/say ${Math.floor(Math.random() * 1000)}`
  const commandBlockPos = new Vec3(1, 5, 1)
  const commandBlockPosText = commandBlockPos.toArray().join(' ')

  // Put and activate the command block
  const p = once(bot.world, `blockUpdate:(${commandBlockPos.x}, ${commandBlockPos.y}, ${commandBlockPos.z})`)
  bot.test.sayEverywhere(`/setblock ${commandBlockPosText} minecraft:command_block`)
  await p
  bot.setCommandBlock(commandBlockPos, command, false)

  const [message] = await onceWithCleanup(bot, 'message', {
    timeout: 5000,
    checkCondition: (message) => message.json.with[0] === command
  })
  assert(message.json.translate === 'advMode.setCommand.success')
}
