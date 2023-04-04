/*
 * This example demonstrates how easy it is to create a bot
 * that fetches monster spawners mob type
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node block_entity.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'block_entity',
  password: process.argv[5]
})

bot.on('message', (cm) => {
  if (cm.toString().includes('spawner')) {
    spawner()
  }
})

function spawner () {
  let blockName
  if (bot.supportFeature('mobSpawner')) {
    blockName = bot.registry.blocksByName.mob_spawner.id
  } else if (bot.supportFeature('spawner')) {
    blockName = bot.registry.blocksByName.spawner.id
  }
  const block = bot.findBlock({
    matching: blockName,
    point: bot.entity.position
  })

  if (!block) {
    return bot.chat('Monster spawner not found')
  }

  bot.chat(`Entity type: ${block.blockEntity.SpawnData.id}`)
  bot.chat(`Delay: ${block.blockEntity.Delay}`)
  console.log(block.blockEntity)
}
