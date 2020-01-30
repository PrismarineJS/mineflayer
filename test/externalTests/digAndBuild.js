const Vec3 = require('vec3').Vec3
const assert = require('assert')

module.exports = () => (bot, done) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  const dirtCollectTest = [
    (cb) => {
      bot.test.setInventorySlot(36, new Item(mcData.blocksByName.dirt.id, 1, 0), (err) => {
        assert.ifError(err)
        cb()
      })
    },
    (cb) => {
      bot.test.fly(new Vec3(0, 2, 0), cb)
    },
    (cb) => {
      bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(0, -2, 0)), cb)
    },
    bot.test.clearInventory,
    (cb) => {
      bot.creative.stopFlying()
      waitForFall(cb)
    },
    bot.test.becomeSurvival,
    (cb) => {
      // we are bare handed
      bot.dig(bot.blockAt(bot.entity.position.plus(new Vec3(0, -1, 0))), (err) => {
        assert.ifError(err)
        cb()
      })
    },
    (cb) => {
      // make sure we collected das dirt
      setTimeout(() => {
        assert(Item.equal(bot.inventory.slots[36], new Item(mcData.blocksByName.dirt.id, 1, 0)))
        bot.test.sayEverywhere('dirt collect test: pass')
        cb()
      }, 1000)
    }
  ]

  function waitForFall (cb) {
    assert(!bot.entity.onGround, 'waitForFall called when we were already on the ground')
    const startingPosition = bot.entity.position.clone()
    bot.on('move', function onMove () {
      if (bot.entity.onGround) {
        const distance = startingPosition.distanceTo(bot.entity.position)
        assert(distance > 0.2, `waitForFall didn't fall very far: ${distance}`)
        bot.removeListener('move', onMove)
        cb()
      }
    })
  }

  bot.test.callbackChain(dirtCollectTest, done)
}
