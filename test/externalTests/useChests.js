const Vec3 = require('vec3').Vec3
const assert = require('assert')

module.exports = () => (bot, done) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  const chestManagementTest = ((() => {
    const smallChestLocation = new Vec3(0, 4, -1)
    const largeChestLocations = [new Vec3(0, 4, 1), new Vec3(1, 4, 1)]
    const smallTrappedChestLocation = new Vec3(1, 4, 0)
    const largeTrappedChestLocations = [
      new Vec3(-1, 4, 1),
      new Vec3(-1, 4, 0)
    ]
    const chestSlot = 36
    const trappedChestSlot = 37
    const boneSlot = 38

    let blockItemsByName
    if (bot.supportFeature('itemsAreNotBlocks')) {
      blockItemsByName = 'itemsByName'
    } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
      blockItemsByName = 'blocksByName'
    }

    return [
      (cb) => {
        bot.test.setInventorySlot(chestSlot, new Item(mcData[blockItemsByName].chest.id, 3, 0), (err) => {
          assert.ifError(err)

          bot.test.setInventorySlot(trappedChestSlot, new Item(mcData[blockItemsByName].trapped_chest.id, 3, 0), (err) => {
            assert.ifError(err)

            bot.test.setInventorySlot(boneSlot, new Item(mcData.itemsByName.bone.id, 3, 0), (err) => {
              assert.ifError(err)
              cb()
            })
          })
        })
      },
      bot.test.becomeSurvival,
      (cb) => {
        // place the chests around us
        bot.test.placeBlock(chestSlot, largeChestLocations[0], () => {
          bot.test.placeBlock(chestSlot, largeChestLocations[1], () => {
            bot.test.placeBlock(chestSlot, smallChestLocation, () => {
              bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[0], () => {
                bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[1], () => {
                  bot.test.placeBlock(trappedChestSlot, smallTrappedChestLocation, () => {
                    cb()
                  })
                })
              })
            })
          })
        })
      },
      (cb) => {
        depositBones(smallChestLocation, 1, cb)
      },
      (cb) => {
        depositBones(largeChestLocations[0], 2, cb)
      },
      (cb) => {
        checkSlotsAreEmpty(bot.inventory)
        cb()
      },
      (cb) => {
        withdrawBones(smallChestLocation, 1, cb)
      },
      (cb) => {
        withdrawBones(largeChestLocations[0], 2, cb)
      },
      (cb) => {
        depositBones(smallTrappedChestLocation, 1, cb)
      },
      (cb) => {
        depositBones(largeTrappedChestLocations[0], 2, cb)
      },
      (cb) => {
        checkSlotsAreEmpty(bot.inventory)
        cb()
      },
      (cb) => {
        withdrawBones(smallTrappedChestLocation, 1, cb)
      },
      (cb) => {
        withdrawBones(largeTrappedChestLocations[0], 2, cb)
      },
      (cb) => {
        bot.test.sayEverywhere('chest management test: pass')
        cb()
      }
    ]

    function itemByName (items, name) {
      let item
      let i
      for (i = 0; i < items.length; ++i) {
        item = items[i]
        if (item && item.name === name) return item
      }
      return null
    }

    function depositBones (chestLocation, count, cb) {
      const chest = bot.openChest(bot.blockAt(chestLocation))
      chest.on('open', () => {
        checkSlotsAreEmpty(chest.window)
        const name = 'bone'
        const item = itemByName(bot.inventory.items(), name)
        if (!item) {
          bot.test.sayEverywhere(`unknown item ${name}`)
          throw new Error(`unknown item ${name}`)
        }
        chest.deposit(item.type, null, count, (err) => {
          assert(!err)
          chest.close()
          cb()
        })
      })
    }

    function withdrawBones (chestLocation, count, cb) {
      const chest = bot.openChest(bot.blockAt(chestLocation))
      chest.on('open', () => {
        const name = 'bone'
        const item = itemByName(chest.items(), name)
        if (!item) {
          bot.test.sayEverywhere(`unknown item ${name}`)
          throw new Error(`unknown item ${name}`)
        }
        chest.withdraw(item.type, null, count, (err) => {
          assert(!err)
          checkSlotsAreEmpty(chest.window)
          chest.close()
          cb()
        })
      })
    }

    function checkSlotsAreEmpty (window) {
      for (let i = 0; i < window.inventorySlotStart; i++) {
        assert(window.slots[i] == null)
      }
    }
  }))()

  bot.test.callbackChain(chestManagementTest, done)
}
