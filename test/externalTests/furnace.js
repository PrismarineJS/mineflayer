const assert = require('assert')

module.exports = () => (bot, done) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  // All of the following names are valid furnace types, but we shouldn't actually test ones that don't exist in this version
  const furnaceTypes = ['furnace', 'smoker', 'blast_furnace'].filter(furnaceType => Boolean(mcData.itemsByName[furnaceType]))
  const foodInputType = [mcData.itemsByName.porkchop, mcData.itemsByName.cooked_porkchop]
  const oreInputType = [mcData.itemsByName.iron_ore, mcData.itemsByName.iron_ingot]
  const itemInputTypeByFurnaceType = {
    furnace: foodInputType,
    smoker: foodInputType,
    blast_furnace: oreInputType
  }

  function testFurnaceChain (furnaceType) {
    return (subTestDone) => {
      const [inputType, outputType] = itemInputTypeByFurnaceType[furnaceType]

      let furnace
      const furnacePos = bot.entity.position.offset(2, 0, 0).floored()
      const fuelInputId = mcData.itemsByName.coal.id
      const inputId = inputType.id
      const outputId = outputType.id
      const fuelInputCount = 2
      const itemInputCount = 2
      const miningToolId = mcData.itemsByName.diamond_pickaxe.id

      bot.test.callbackChain([
        (cb) => { // Test setup
          bot.test.setInventorySlot(36, new Item(mcData.itemsByName[furnaceType].id, 1), (err) => { // Get furnace
            assert.ifError(err)
            bot.test.placeBlock(36, furnacePos, (err) => { // Place furnace
              assert.ifError(err)
              bot.test.setInventorySlot(37, new Item(inputId, itemInputCount), (err) => { // Get porkchop
                assert.ifError(err)
                bot.test.setInventorySlot(38, new Item(fuelInputId, fuelInputCount), (err) => { // Get coal
                  assert.ifError(err)
                  bot.test.setInventorySlot(39, new Item(miningToolId, 1), (err) => { // Add pickaxe for cleanup at the end
                    assert.ifError(err)
                    if (bot.supportFeature('itemsAreAlsoBlocks')) {
                      assert.strictEqual(bot.blockAt(furnacePos).type, mcData.itemsByName[furnaceType].id)
                    } else {
                      assert.strictEqual(bot.blockAt(furnacePos).type, mcData.blocksByName[furnaceType].id)
                    }
                    cb()
                  })
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

            furnace.putFuel(fuelInputId, null, fuelInputCount, (err) => {
              assert.ifError(err)

              assert.strictEqual(furnace.fuelItem(), furnace.window.slots[1])
              assert.strictEqual(furnace.fuelItem().type, fuelInputId)
              assert.strictEqual(furnace.fuelItem().count, fuelInputCount)

              furnace.putInput(inputId, null, itemInputCount, async (err) => {
                assert.ifError(err)

                assert.strictEqual(furnace.inputItem(), furnace.window.slots[0])
                assert.strictEqual(furnace.inputItem().type, inputId)
                assert.strictEqual(furnace.inputItem().count, itemInputCount)

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
              assert.strictEqual(furnace.outputItem().type, outputId)
              assert.strictEqual(furnace.outputItem().count, 1)

              assert.strictEqual(furnace.inputItem().type, inputId)
              assert.strictEqual(furnace.inputItem().count, itemInputCount - 1)

              assert.strictEqual(furnace.fuelItem().type, fuelInputId)
              assert.strictEqual(furnace.fuelItem().count, fuelInputCount - 1)

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
          const smeltedItemCount = bot.inventory.count(outputId)
          const unsmeltedItemCount = bot.inventory.count(inputId)
          const coalCount = bot.inventory.count(fuelInputId)

          assert.strictEqual(smeltedItemCount, 1)
          assert.strictEqual(unsmeltedItemCount, itemInputCount - 1)
          assert.strictEqual(coalCount, fuelInputCount - 1)

          // remove the furnace so the next test is "clean"
          bot.dig(bot.blockAt(furnacePos), cb)
        }
      ], subTestDone)
    }
  }

  bot.test.callbackChain(furnaceTypes.map(testFurnaceChain), done)
}
