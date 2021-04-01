const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')
const bot = mineflayer.createBot()

bot.on('chat', async (username, ms) => {
  if (ms === 'go_endCrystal') {
    const crystal = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
    console.log(crystal)
  } else if (ms === 'go_boat') {
    const boat = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, -1, -2)), new Vec3(0, 1, 0))
    console.log(boat)
  } else if (ms === 'go_spawnegg') {
    const mob = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, -2)), new Vec3(0, 1, 0))
    console.log(mob)
  }
})
