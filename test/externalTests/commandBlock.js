const assert = require('assert')
const { once } = require('events')
const { Vec3 } = require('vec3')

module.exports = () => async (bot) => {
  const command = `/say ${Math.floor(Math.random() * 1000)}`
  const commandBlockPos = new Vec3(1, 5, 1)
  const commandBlockPosText = commandBlockPos.toArray().join(' ')

  // Put and activate the command block
  bot.test.sayEverywhere(`/setblock ${commandBlockPosText} minecraft:command_block`)
  await bot.test.wait(100)
  bot.setCommandBlock(commandBlockPos, command, false)

  const [message] = await once(bot, 'message')
  assert(message.json.translate === 'advMode.setCommand.success')
  assert(message.json.with[0] === command)
}
