const assert = require('assert')
const { once } = require('events')
const { Vec3 } = require('vec3')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)
  
  await bot.test.setInventorySlot(36, new Item(mcData[blockItemsByName].water_bucket.id, 3, 0))
  await bot.test.becomeSurvival()
  await bot.test.placeBlock(36, new Vec3(0, 0, 1))

  await once(bot, 'breath')
  await new Promise((resolve, reject) => setTimeout(resolve, 5000))
  assert.strictEqual(bot.oxygenLevel, 20, 'Wrong oxygen level')
}
