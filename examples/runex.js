const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')
const bot = mineflayer.createBot({ port: 25566 })
const { once } = require('events')

bot.on('chat', async (_, msg) => {
  const mcData = require('minecraft-data')(bot.version)
  if (msg === 'go_boat') {
    // far 3 blocks
    bot.chat('/setblock ~-1 ~-1 ~-2 water')
    bot.chat('/setblock ~ ~-1 ~-2 water')
    bot.chat('/setblock ~1 ~-1 ~-2 water')
    // close 3 blocks
    bot.chat('/setblock ~-1 ~-1 ~-1 water')
    bot.chat('/setblock ~ ~-1 ~-1 water')
    bot.chat('/setblock ~1 ~-1 ~-1 water')

    const p = once(bot.inventory, 'updateSlot')
    bot.chat(`/give ${bot.username} ${mcData?.itemsByName?.oak_boat ? 'oak_boat' : 'boat'}`)
    await p // await getting the boat

    const boat = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, -1, -2)), new Vec3(0, 1, 0))
    console.log(boat)
  }
})
