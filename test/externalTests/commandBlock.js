const assert = require('assert')
const { once } = require('events')
const { Vec3 } = require('vec3')

module.exports = () => async (bot) => {
  return new Promise(async (resolve, reject) => {
    const command = `/say ${Math.floor(Math.random() * 1000)}`
    const commandBlockPos = new Vec3(1, 5, 1)
    const commandBlockPosText = commandBlockPos.toArray().join(' ')
  
    // Put and activate the command block
    const p = once(bot.world, `blockUpdate:(${commandBlockPos.x}, ${commandBlockPos.y}, ${commandBlockPos.z})`)
    bot.test.sayEverywhere(`/setblock ${commandBlockPosText} minecraft:command_block`)
    await p
    bot.setCommandBlock(commandBlockPos, command, false)
  
    const messageListener = (message) => {
      if (message.json.with[0] === command) {
        assert(message.json.translate === 'advMode.setCommand.success')
        bot.off('message', messageListener)
        clearTimeout(timeout)
        resolve()
      }
    }
    const timeout = setTimeout(() => {
      bot.off('message', messageListener)
      reject(new Error('Timed out waiting for command block command to be set'))
    }, 5000)
    bot.on('message', messageListener)
  })
}
