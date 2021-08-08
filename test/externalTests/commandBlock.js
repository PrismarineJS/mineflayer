const assert = require('assert')
const { once } = require('events')
const { Vec3 } = require('vec3')

module.exports = () => async (bot) => {
  const command = `/say ${Math.floor(Math.random() * 1000)}`
  const commandBlockPos = new Vec3(1, 5, 1)
  const commandBlockPosText = commandBlockPos.toArray().join(' ')

  // Put and activate the command block
  const p = once(bot.world, `blockUpdate:(${commandBlockPos.x}, ${commandBlockPos.y}, ${commandBlockPos.z})`)
  bot.test.sayEverywhere(`/setblock ${commandBlockPosText} minecraft:command_block`)
  await p
  bot.setCommandBlock(commandBlockPos, command, false)

  const [message] = await once(bot, 'message')
  assert(message.json.translate === 'advMode.setCommand.success')
  assert(message.json.with[0] === command)
}
