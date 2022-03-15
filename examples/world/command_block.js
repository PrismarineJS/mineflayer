/*
 * An example on how to set and read command blocks
 */

const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node command_block.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'command_block',
  password: process.argv[5]
})

let mcData
bot.once('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  const command = message.split(' ')
  switch (true) {
    case /^setCommandBlock (.+)$/.test(message): {
      const commandBlock = bot.findBlock({
        matching: mcData.blocksByName.command_block.id
      })
      bot.setCommandBlock(commandBlock.position, command[1], false)
      break
    }
  }
})
