const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.dirt.id, 1, 0))
  await bot.test.fly(new Vec3(0, 2, 0))
  await bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(0, -2, 0)))
  await bot.test.clearInventory()
  await bot.creative.stopFlying()
  await waitForFall()
  await bot.test.becomeSurvival()
  // we are bare handed
  await bot.dig(bot.blockAt(bot.entity.position.plus(new Vec3(0, -1, 0))))
  // make sure we collected das dirt
  await bot.test.wait(1000)
  assert(Item.equal(bot.inventory.slots[36], new Item(bot.registry.itemsByName.dirt.id, 1, 0)))
  bot.test.sayEverywhere('dirt collect test: pass')

  async function waitForFall () {
    return new Promise((resolve, reject) => {
      assert(!bot.entity.onGround, 'waitForFall called when we were already on the ground')
      const startingPosition = bot.entity.position.clone()
      bot.on('move', function onMove () {
        if (bot.entity.onGround) {
          const distance = startingPosition.distanceTo(bot.entity.position)
          assert(distance > 0.2, `waitForFall didn't fall very far: ${distance}`)
          bot.removeListener('move', onMove)
          resolve()
        }
      })
    })
  }
}
