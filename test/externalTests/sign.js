const assert = require('assert')
const Vec3 = require('vec3')

module.exports = (version) => {
  const mcData = require('minecraft-data')(version)
  const Item = require('prismarine-item')(version)

  async function runTest (bot, testFunction) {
    await testFunction(bot)
  }

  const tests = []

  function addTest (name, f) {
    tests[name] = bot => runTest(bot, f)
  }

  let signItem = null
  for (const name in mcData.itemsByName) {
    if (name.includes('sign')) signItem = mcData.itemsByName[name]
  }
  assert.notStrictEqual(signItem, null)

  addTest('update sign', /** @param {import('mineflayer').Bot} bot */ async (bot) => {
    const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    await bot.lookAt(lowerBlock.position, true)
    await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
    const p = new Promise((resolve) => {
      bot.on('signOpen', (packet) => {
        const sign = bot.blockAt(new Vec3(packet.position))
        bot.updateSign(sign, '1\n2\n3\n')

        setTimeout(() => {
          // Get updated sign
          const sign = bot.blockAt(bot.entity.position)

          assert.strictEqual(sign.signText, '1\n2\n3\n')

          if (sign.blockEntity) {
            // Check block update
            bot.activateBlock(sign)
            assert.notStrictEqual(sign.blockEntity, undefined)
          }

          resolve()
        }, 500)
      })
    })
    await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))
    console.info('Placed sign at ' + lowerBlock.position.offset(0, 1, 0).toString())
    return p
  })

  addTest('place and update sign', /** @param {import('mineflayer').Bot} bot */ async (bot) => {
    await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))

    // Basically the graffiti example
    // Look for solid blocs first
    const solidBlocks = bot.findBlocks({
      matching: (block) => {
        return block.boundingBox === 'block'
      },
      maxDistance: 4,
      count: 100
    })

    // Then filter for blocks that have an air gap above them
    const placeOnPos = solidBlocks.find((pos) => {
      const block = bot.blockAt(pos.offset(0, 1, 0))
      return block && block.boundingBox === 'empty' && block.name.includes('air')
    })
    assert.ok(placeOnPos)
    await bot.placeSign(placeOnPos.offset(0, 1, 0), '1\n2\n3\n')
    console.info('Placed sign at ' + placeOnPos.offset(0, 1, 0).toString())
    await bot.test.wait(500)

    // Get updated sign
    const sign = bot.blockAt(placeOnPos.offset(0, 1, 0))

    assert.strictEqual(sign.signText, '1\n2\n3\n')

    if (sign.blockEntity) {
      // Check block update
      bot.activateBlock(sign)
      assert.notStrictEqual(sign.blockEntity, undefined)
    }
  })

  return tests
}
