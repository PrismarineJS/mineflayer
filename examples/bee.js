import { createBot } from 'mineflayer'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node bee.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

// TODO: commands
console.log('Commands :\n' +
  '  show villagers\n' +
  '  show inventory\n' +
  '  show trades <id>\n' +
  '  trade <id> <trade> [<times>]')

const bot = createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'bee',
  password: process.argv[5]
})rbose: true
})

// /gamemode creative bee

let i = 0
function loop (n) {
  if (i > n) {
    bot.chat('My flight was amazing !')
    return
  }
  i += 1

  const { position } = bot.entity

  // Draw a spiral
  bot.creative.flyTo(position.offset(Math.sin(i) * 2, 0.5, Math.cos(i) * 2), () => {
    loop(n)
  })
}

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'loaded':
      bot.waitForChunksToLoad(() => {
        bot.chat('Ready!')
      })
      break
    case 'fly':
      bot.creative.startFlying()
      loop(10)
      break
  }
})
