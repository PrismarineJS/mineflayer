const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node tab_complete.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'tabComplete',
  password: process.argv[5]
})

bot.on('message', (cm) => {
  if (cm.toString().includes('complete')) {
    const message = cm.toString()
    const str = cm.toString().slice(message.indexOf('complete') + 9)
    complete(str)
  }
})

async function complete (str) {
  try {
    const matches = await bot.tabComplete(str)
    console.log(str, matches)
    bot.chat(`Matches for "${str}": ${matches.join(', ')}`)
  } catch (err) {
    bot.chat(err.message)
  }
}
