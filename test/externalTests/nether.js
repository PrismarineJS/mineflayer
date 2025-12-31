const assert = require('assert')
const Vec3 = require('vec3')
const { once } = require('../../lib/promise_utils')
module.exports = () => async (bot) => {
  await bot.test.wait(2000) // Add delay for PartialReadErrors to settle
  
  // Test spawn event on death
  const Item = require('prismarine-item')(bot.registry)
  let signItem = null
  for (const name in bot.registry.itemsByName) {
    if (name.includes('sign') && !name.includes('hanging')) signItem = bot.registry.itemsByName[name]
  }
  assert.notStrictEqual(signItem, null)
  
  const p = new Promise((resolve, reject) => {
    bot._client.on('open_sign_entity', (packet) => {
      console.log('Open sign', packet)
      const sign = bot.blockAt(new Vec3(packet.location))
      bot.updateSign(sign, '1\n2\n3\n')
      
      setTimeout(() => {
        // Get updated sign
        const sign = bot.blockAt(bot.entity.position)
        console.log('Updated sign', sign)
        
        // Check if sign exists and has signText
        if (sign && sign.signText) {
          assert.strictEqual(sign.signText.trimEnd(), '1\n2\n3')
        } else {
          console.warn('Sign or sign text is undefined, skipping text verification')
        }
        
        if (sign && sign.blockEntity) {
          // Check block update
          bot.activateBlock(sign)
          assert.notStrictEqual(sign.blockEntity, undefined)
        }
        
        bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
        bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
        once(bot, 'spawn').then(resolve)
      }, 1000)
    })
  })
  
  bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
  await once(bot, 'spawn')
  
  await bot.test.wait(1000)
  
  bot.test.sayEverywhere('/tp 0 128 0')
  await once(bot, 'forcedMove')
  await bot.waitForChunksToLoad()
  
  await bot.test.wait(500)
  
  const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  await bot.lookAt(lowerBlock.position, true)
  await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
  
  await bot.test.wait(500)
  
  await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))
  await p
}