const { Vec3 } = require('vec3')
const assert = require('assert')
const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  // Retry helper for handling test failures (slime deaths, timing issues, etc.)
  const retryOnFailure = async (operation, maxAttempts = 3) => {
    let lastError
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[useChests] Starting attempt ${attempt}/${maxAttempts}`)
      let deathListener
      let messageListener
      let killedBySlime = false

      const deathPromise = new Promise((resolve) => {
        messageListener = (message) => {
          const msgString = message.toString()
          if (msgString.includes('slain by Slime') || msgString.includes('killed by Slime')) {
            console.log(`[useChests] Bot killed by slime (attempt ${attempt}/${maxAttempts}): ${msgString}`)
            killedBySlime = true
            resolve()
          }
        }
        deathListener = () => {
          // Death event fired, but we need the message to confirm it was a slime
          // The message listener above will handle it
        }
        bot.on('death', deathListener)
        bot.on('message', messageListener)
      })

      try {
        const result = await Promise.race([
          operation(),
          deathPromise.then(() => { throw new Error('Killed by slime') })
        ])
        bot.removeListener('death', deathListener)
        bot.removeListener('message', messageListener)
        console.log(`[useChests] Attempt ${attempt} succeeded!`)
        return result
      } catch (error) {
        bot.removeListener('death', deathListener)
        bot.removeListener('message', messageListener)
        lastError = error

        if (attempt < maxAttempts) {
          if (killedBySlime) {
            console.log(`[useChests] Killed by slime, cleaning up and retrying (attempt ${attempt + 1}/${maxAttempts})...`)
          } else {
            console.log(`[useChests] Test failed: ${error.message}, retrying (attempt ${attempt + 1}/${maxAttempts})...`)
          }
          bot.chat('/kill @e[type=slime]')
          await new Promise(resolve => setTimeout(resolve, 2000))
          await bot.test.resetState()
        } else {
          console.log(`[useChests] Attempt ${attempt} failed, no more retries: ${error.message}`)
          break
        }
      }
    }
    throw lastError
  }

  bot.test.groundY = bot.supportFeature('tallWorld') ? -60 : 4

  const smallChestLocation = new Vec3(0, bot.test.groundY, -1)
  const largeChestLocations = [new Vec3(0, bot.test.groundY, 1), new Vec3(1, bot.test.groundY, 1)]
  const smallTrappedChestLocation = new Vec3(1, bot.test.groundY, 0)
  const largeTrappedChestLocations = [
    new Vec3(-1, bot.test.groundY, 1),
    new Vec3(-1, bot.test.groundY, 0)
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

  const chestBlockId = bot.registry.blocksByName.chest.id
  const trappedChestBlockId = bot.registry.blocksByName.trapped_chest.id

  function itemByName (items, name) {
    for (let i = 0; i < items.length; ++i) {
      const item = items[i]
      if (item && item.name === name) return item
    }
    return null
  }

  async function depositBones (chestLocation, count) {
    const chest = await bot.openContainer(bot.blockAt(chestLocation))
    assert(chest.containerItems().length === 0)
    assert(chest.items().length > 0)
    const name = 'bone'
    const item = itemByName(chest.items(), name)
    if (!item) {
      bot.test.sayEverywhere(`unknown item ${name}`)
      throw new Error(`unknown item ${name}`)
    }
    await chest.deposit(item.type, null, count)
    chest.close()
  }

  async function withdrawBones (chestLocation, count) {
    const chest = await bot.openContainer(bot.blockAt(chestLocation))
    const name = 'bone'
    const item = itemByName(chest.containerItems(), name)
    if (!item) {
      bot.test.sayEverywhere(`unknown item ${name}`)
      throw new Error(`unknown item ${name}`)
    }
    await chest.withdraw(item.type, null, count)
    assert(chest.containerItems().length === 0)
    assert(chest.items().length > 0)
    chest.close()
  }

  // Kill all slimes before starting the test to prevent interference
  console.log('[useChests] Killing all slimes before test starts...')
  bot.chat('/kill @e[type=slime]')
  await new Promise(resolve => setTimeout(resolve, 1000))

  await retryOnFailure(async () => {
    // Kill slimes again at the start of each attempt
    bot.chat('/kill @e[type=slime]')
    await new Promise(resolve => setTimeout(resolve, 500))

    await bot.test.setInventorySlot(chestSlot, new Item(bot.registry[blockItemsByName].chest.id, 3, 0))
    await bot.test.setInventorySlot(trappedChestSlot, new Item(bot.registry[blockItemsByName].trapped_chest.id, 3, 0))
    await bot.test.setInventorySlot(boneSlot, new Item(bot.registry.itemsByName.bone.id, 3, 0))

    await bot.test.becomeSurvival()

    // place the chests around us
    await bot.test.placeBlock(chestSlot, largeChestLocations[0])
    await bot.test.placeBlock(chestSlot, largeChestLocations[1])
    await bot.test.placeBlock(chestSlot, smallChestLocation)
    await bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[0])
    await bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[1])
    await bot.test.placeBlock(trappedChestSlot, smallTrappedChestLocation)

    assert.strictEqual(bot.blockAt(largeChestLocations[0]).type, chestBlockId)
    assert.strictEqual(bot.blockAt(largeChestLocations[1]).type, chestBlockId)
    assert.strictEqual(bot.blockAt(smallChestLocation).type, chestBlockId)
    assert.strictEqual(bot.blockAt(largeTrappedChestLocations[0]).type, trappedChestBlockId)
    assert.strictEqual(bot.blockAt(largeTrappedChestLocations[1]).type, trappedChestBlockId)
    assert.strictEqual(bot.blockAt(smallTrappedChestLocation).type, trappedChestBlockId)

    // Test that "chestLidMove" is emitted only once when opening a double chest
    let emitted = false
    bot.on('chestLidMove', handler)
    async function handler (block, isOpen, block2) {
      if (emitted) {
        assert.fail(new Error('chestLidMove emitted twice'))
      } else {
        emitted = true

        let blockAssert = false; let block2Assert = false
        for (const location of largeChestLocations) {
          if (location.equals(block.position)) blockAssert = true
          if (location.equals(block2.position)) block2Assert = true
        }
        assert(blockAssert && block2Assert, new Error('The block instance emitted by chestLidMove is not part of the chest oppened'))
        assert.strictEqual(isOpen, 1, new Error('isOpen should be 1 when opened by one only player'))

        await bot.test.wait(500)

        bot.removeListener('chestLidMove', handler)
        chest.close()
      }
    }
    const chest = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
    await once(chest, 'close')

    await depositBones(smallChestLocation, 1)
    await depositBones(largeChestLocations[0], 2)

    assert(bot.inventory.items().length === 0)

    await withdrawBones(smallChestLocation, 1)
    await withdrawBones(largeChestLocations[0], 2)

    await depositBones(smallTrappedChestLocation, 1)
    await depositBones(largeTrappedChestLocations[0], 2)

    assert(bot.inventory.items().length === 0)

    await withdrawBones(smallTrappedChestLocation, 1)
    await withdrawBones(largeTrappedChestLocations[0], 2)

    const itemsWithStackSize = {
      64: ['stone', 'mycelium'],
      16: ['ender_pearl', 'egg'],
      1: ['fishing_rod', 'bow']
    }

    function getRandomStackableItem () {
      if (Math.random() < 0.75) {
        return itemsWithStackSize[64][~~(Math.random() * itemsWithStackSize[64].length)]
      } else {
        if (Math.random() < 0.5) {
          return itemsWithStackSize[16][~~(Math.random() * itemsWithStackSize[16].length)]
        } else {
          return itemsWithStackSize[1][~~(Math.random() * itemsWithStackSize[1].length)]
        }
      }
    }

    async function createRandomLayout (window, slotPopulationFactor) {
      await bot.test.becomeCreative()

      for (let slot = 0; slot < window.inventoryStart; slot++) {
        if (Math.random() < slotPopulationFactor) {
          const randomItem = getRandomStackableItem()
          const item = bot.registry.itemsByName[randomItem]
          bot.chat(`/give ${bot.username} ${item.name} ${Math.ceil(Math.random() * item.stackSize)}`)
          await onceWithCleanup(window, 'updateSlot', {
            timeout: 5000,
            checkCondition: (slot, oldItem, newItem) => slot === window.hotbarStart && newItem?.name === item.name
          })

          // await bot.clickWindow(slot, 0, 2)
          await bot.moveSlotItem(window.hotbarStart, slot)
          await bot.test.wait(100)
        }
      }

      await bot.test.becomeSurvival()
    }

    async function testMouseClick (window, clicks) {
      let iterations = 0
      while (iterations++ < clicks) {
        await bot.clickWindow(~~(Math.random() * window.inventoryStart), 0, 0)
      }
    }

    function clearLargeChest () {
      bot.chat(`/setblock ${largeChestLocations[0].x} ${largeChestLocations[0].y} ${largeChestLocations[0].z} chest`)
      bot.chat(`/setblock ${largeChestLocations[1].x} ${largeChestLocations[1].y} ${largeChestLocations[1].z} chest`)
    }

    const window = await bot.openContainer(bot.blockAt(largeChestLocations[0]))
    await createRandomLayout(window, 0.95)

    await testMouseClick(window, 250)

    window.close()
    clearLargeChest()
  })
}
