import { createBot } from 'mineflayer'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node trader.js <host> <port> [<name>] [<password>]')
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
  username: process.argv[4] ? process.argv[4] : 'fisherman',
  password: process.argv[5]
})

let mcData
bot.on('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

// To fish we have to give bot the fishing rod and teleport bot to the water
// /give fisherman fishing_rod 1
// /teleport fisherman ~ ~ ~

// To eat we have to apply hunger first
// /effect fisherman minecraft:hunger 1 255

bot.on('message', (cm) => {
  if (cm.toString().includes('start')) {
    startFishing()
  }

  if (cm.toString().includes('stop')) {
    stopFishing()
  }

  if (cm.toString().includes('eat')) {
    eat()
  }
})

let nowFishing = false

function onCollect (player, entity) {
  if (entity.kind === 'Drops' && player === bot.entity) {
    bot.removeListener('playerCollect', onCollect)
    startFishing()
  }
}

function startFishing () {
  bot.chat('Fishing')
  bot.equip(mcData.itemsByName.fishing_rod.id, 'hand', (err) => {
    if (err) {
      return bot.chat(err.message)
    }

    nowFishing = true
    bot.on('playerCollect', onCollect)

    bot.fish((err) => {
      nowFishing = false

      if (err) {
        bot.chat(err.message)
      }
    })
  })
}

function stopFishing () {
  bot.removeListener('playerCollect', onCollect)

  if (nowFishing) {
    bot.activateItem()
  }
}

function eat () {
  stopFishing()

  bot.equip(mcData.itemsByName.fish.id, 'hand', (err) => {
    if (err) {
      return bot.chat(err.message)
    }

    bot.consume((err) => {
      if (err) {
        return bot.chat(err.message)
      }
    })
  })
}
