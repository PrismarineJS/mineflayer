const mineflayer = require('mineflayer')
const repl = require('repl')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node repl.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'repl',
  password: process.argv[5],
  verbose: true
})

bot.on('login', () => {
  const r = repl.start('> ')
  r.context.bot = bot

  r.on('exit', () => {
    bot.end()
  })
})
