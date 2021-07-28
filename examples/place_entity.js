const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')
const bot = mineflayer.createBot()

bot.on('chat', async (_, msg) => {
  if (msg === 'go_endcrystal') {
    const crystal = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
    console.log(crystal)
  } else if (msg === 'go_boat') {
    const boat = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, -2, -2)), new Vec3(0, 1, 0))
    console.log(boat)
  } else if (msg === 'go_spawnegg') {
    const mob = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, -2)), new Vec3(0, 1, 0))
    console.log(mob)
  } else if (msg === 'go_armorstand') {
    const armorstand = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, -2)), new Vec3(0, 1, 0))
    console.log(armorstand)
  }
})
