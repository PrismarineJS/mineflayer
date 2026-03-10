// This example will shoot the player that said "fire" in chat, when it is said in chat.
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node elytra.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'elytraer',
  password: process.argv[5]
})

bot.on('error', err => {
  console.log(err)
})

bot.on('kicked', err => {
  console.log(err)
})

bot.on('spawn', async function () {
  bot.chat(`/give ${bot.username} minecraft:elytra`)
  bot.chat(`/give ${bot.username} minecraft:firework_rocket 64`)

  await sleep(1000)
  const elytraItem = bot.inventory.slots.find(item => item?.name === 'elytra')
  if (elytraItem == null) {
    console.log('no elytra')
    return
  }
  await bot.equip(elytraItem, 'torso')
  const fireworkItem = bot.inventory.slots.find(item => item?.name === 'firework_rocket')
  if (fireworkItem == null) {
    console.log('no fireworks')
    return
  }
  await bot.equip(fireworkItem, 'hand')
})

bot.on('chat', async (username, message) => {
  if (message === 'fly') {
    await bot.look(bot.entity.yaw, 50 * Math.PI / 180)
    bot.setControlState('jump', true)
    bot.setControlState('jump', false)
    await sleep(50)

    // try to fly
    try {
      await bot.elytraFly()
    } catch (err) {
      bot.chat(`Failed to fly: ${err}`)
      return
    }
    await sleep(50)

    // use rocket
    bot.activateItem()
  }
})

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
