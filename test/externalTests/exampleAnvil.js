const assert = require('assert')

module.exports = () => async (bot) => {
  await bot.test.runExample('examples/use_anvil.js', async (name, done) => {
    assert.strictEqual(name, 'anvilman')
    bot.chat('/op anvilman') // to counteract spawn protection
    bot.chat('/setblock 52 4 0 anvil')
    console.log('placed block!')
    bot.chat('/clear anvilman')
    bot.chat('/give anvilman diamond_sword 1')
    getBook(bot)
    await bot.test.wait(1000)
    await bot.test.tellAndListen('anvilman', 'anvil combine 36 37', makeListener('Anvil used successfully.'))
    bot.chat('/setblock 52 4 0 air')
    done()
  })
}

function getBook (bot) {
  const mcData = require('minecraft-data')(bot.version)
  if (mcData.isNewerOrEqualTo('1.13')) bot.chat('/give anvilman enchanted_book{StoredEnchantments:[{id:"minecraft:sharpness",lvl:5s}]}')
  else bot.chat('/give anvilman enchanted_book 1 0 {StoredEnchantments:[{id:16s,lvl:5s}]}')
}

function makeListener (wantedMessage) {
  return (message) => {
    if (!message.startsWith(wantedMessage)) {
      assert.fail(`Unexpected message: ${message}`) // err
    }
    return true // stop listening
  }
}
