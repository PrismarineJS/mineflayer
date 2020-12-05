/*
 * Jumping is fun. Riding pigs is even funnier!
 *
 * Learn how to make your bot interactive with this example.
 *
 * This bot can move, jump, ride vehicles, attack nearby entities and much more.
 */
const mineflayer = require('mineflayer')
const { on, once } = require('events')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node jumper.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'jumper',
  password: process.argv[5]
})

let target = null

async function commandHandler () {
  for await (const [username, message] of on(bot, 'chat')) {
    if (username === bot.username) return
    target = bot.players[username].entity
    let entity
    switch (message) {
      case 'forward':
        bot.setControlState('forward', true)
        break
      case 'back':
        bot.setControlState('back', true)
        break
      case 'left':
        bot.setControlState('left', true)
        break
      case 'right':
        bot.setControlState('right', true)
        break
      case 'sprint':
        bot.setControlState('sprint', true)
        break
      case 'stop':
        bot.clearControlStates()
        break
      case 'jump':
        bot.setControlState('jump', true)
        bot.setControlState('jump', false)
        break
      case 'jump a lot':
        bot.setControlState('jump', true)
        break
      case 'stop jumping':
        bot.setControlState('jump', false)
        break
      case 'attack':
        entity = bot.nearestEntity()
        if (entity) {
          bot.attack(entity, true)
        } else {
          bot.chat('no nearby entities')
        }
        break
      case 'mount':
        entity = bot.nearestEntity((entity) => { return entity.type === 'object' })
        if (entity) {
          bot.mount(entity)
        } else {
          bot.chat('no nearby objects')
        }
        break
      case 'dismount':
        bot.dismount()
        break
      case 'move vehicle forward':
        bot.moveVehicle(0.0, 1.0)
        break
      case 'move vehicle backward':
        bot.moveVehicle(0.0, -1.0)
        break
      case 'move vehicle left':
        bot.moveVehicle(1.0, 0.0)
        break
      case 'move vehicle right':
        bot.moveVehicle(-1.0, 0.0)
        break
      case 'tp':
        bot.entity.position.y += 10
        break
      case 'pos':
        bot.chat(bot.entity.position.toString())
        break
      case 'yp':
        bot.chat(`Yaw ${bot.entity.yaw}, pitch: ${bot.entity.pitch}`)
        break
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function looker () {
  await once(bot, 'spawn')
  // keep your eyes on the target, so creepy!
  while (true) {
    await sleep(50)
    if (!target) continue
    await bot.lookAt(target.position.offset(0, target.height, 0))
  }
}

async function mounter () {
  for await (const e of on(bot, 'mount')) { // eslint-disable-line
    bot.chat(`mounted ${bot.vehicle.objectType}`)
  }
}

async function dismounter () {
  for await (const [vehicle] of on(bot, 'dismount')) {
    bot.chat(`dismounted ${vehicle.objectType}`)
  }
}

commandHandler()
looker()
mounter()
dismounter()
