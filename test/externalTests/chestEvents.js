const assert = require('assert')

module.exports = () => (bot, done) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  let blockItemsByName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    blockItemsByName = 'itemsByName'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    blockItemsByName = 'blocksByName'
  }

  const chestSlot = 36
  const chestLocation1 = bot.entity.position.offset(0, 0, -1)
  const chestLocation2 = bot.entity.position.offset(1, 0, -1)

  bot.test.setInventorySlot(chestSlot, new Item(mcData[blockItemsByName].chest.id, 2, 0), (err) => {
    assert.ifError(err)
    bot.test.placeBlock(chestSlot, chestLocation1, (err) => {
      assert.ifError(err)
      bot.test.placeBlock(chestSlot, chestLocation2, (err) => {
        assert.ifError(err)

        bot.openChest(bot.blockAt(chestLocation2))

        bot.on('chestLidMove', (block, isOpen) => {
          assert.strictEqual(isOpen, 1)
          done() // If 'chestLidMove' is emitted twice, done() would be called twice and thus failing tests
        })
      })
    })
  })
}
