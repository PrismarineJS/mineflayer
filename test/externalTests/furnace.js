const assert = require('assert')

module.exports = () => (bot, done) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  let furnace
  const furnacePos = bot.entity.position.offset(2, 0, 0).floored()
  const coalId = mcData.itemsByName.coal.id
  const porkchopId = mcData.itemsByName.porkchop.id
  const cookedPorkchopId = mcData.itemsByName.cooked_porkchop.id
  const coalInputCount = 2
  const porkchopInputCount = 2

  bot.test.callbackChain([
    (cb) => { // Test setup
      bot.test.setInventorySlot(36, new Item(mcData.itemsByName.furnace.id, 1), (err) => { // Get furnace
        assert.ifError(err)
        bot.test.placeBlock(36, furnacePos, (err) => { // Place furnace
          assert.ifError(err)
          bot.test.setInventorySlot(37, new Item(porkchopId, porkchopInputCount), (err) => { // Get porkchop
            assert.ifError(err)
            bot.test.setInventorySlot(38, new Item(coalId, coalInputCount), (err) => { // Get coal
              assert.ifError(err)
              if (bot.supportFeature('itemsAreAlsoBlocks')) {
                assert.strictEqual(bot.blockAt(furnacePos).type, mcData.itemsByName.furnace.id)
              } else {
                assert.strictEqual(bot.blockAt(furnacePos).type, mcData.blocksByName.furnace.id)
              }
              cb()
            })
          })
        })
      })
    },
    (cb) => { // Put inputs
      furnace = bot.openFurnace(bot.blockAt(furnacePos))
      furnace.once('open', () => {
        assert.strictEqual(furnace.inputItem(), furnace.window.slots[0])
        assert.strictEqual(furnace.fuelItem(), furnace.window.slots[1])
        assert.strictEqual(furnace.outputItem(), furnace.window.slots[2])
        assert.strictEqual(furnace.inputItem(), null)
        assert.strictEqual(furnace.fuelItem(), null)
        assert.strictEqual(furnace.outputItem(), null)

        furnace.putFuel(coalId, null, coalInputCount, (err) => {
          assert.ifError(err)

          assert.strictEqual(furnace.fuelItem(), furnace.window.slots[1])
          assert.strictEqual(furnace.fuelItem().type, coalId)
          assert.strictEqual(furnace.fuelItem().count, coalInputCount)

          furnace.putInput(porkchopId, null, porkchopInputCount, async (err) => {
            assert.ifError(err)

            assert.strictEqual(furnace.inputItem(), furnace.window.slots[0])
            assert.strictEqual(furnace.inputItem().type, porkchopId)
            assert.strictEqual(furnace.inputItem().count, porkchopInputCount)

            cb()
          })
        })
      })
    },
    (cb) => { // Wait and take the output and inputs
      setTimeout(() => {
        assert(furnace.fuel > 0 && furnace.fuel < 1)
        assert(furnace.progress > 0 && furnace.progress < 1)

        setTimeout(() => {
          assert.strictEqual(furnace.outputItem(), furnace.window.slots[2])
          assert.strictEqual(furnace.outputItem().type, cookedPorkchopId)
          assert.strictEqual(furnace.outputItem().count, 1)

          assert.strictEqual(furnace.inputItem().type, porkchopId)
          assert.strictEqual(furnace.inputItem().count, porkchopInputCount - 1)

          assert.strictEqual(furnace.fuelItem().type, coalId)
          assert.strictEqual(furnace.fuelItem().count, coalInputCount - 1)

          furnace.takeOutput((err) => {
            assert.ifError(err)
            furnace.takeInput((err) => {
              assert.ifError(err)
              furnace.takeFuel((err) => {
                assert.ifError(err)
                furnace.once('close', () => {
                  setTimeout(cb, 500)
                })
                furnace.close()
              })
            })
          })
        }, furnace.progressSeconds * 1000 + 500)
      }, 500)
    },
    (cb) => { // Check inventory
      const cookedPorkchopCount = bot.inventory.count(cookedPorkchopId)
      const porkchopCount = bot.inventory.count(porkchopId)
      const coalCount = bot.inventory.count(coalId)

      assert.strictEqual(cookedPorkchopCount, 1)
      assert.strictEqual(porkchopCount, porkchopInputCount - 1)
      assert.strictEqual(coalCount, coalInputCount - 1)

      cb()
    }
  ], done)
}
