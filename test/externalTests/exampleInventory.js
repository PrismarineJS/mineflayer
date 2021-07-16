const assert = require('assert')

let tests = [
  {
    command: 'list',
    wantedMessage: 'dirt x 64, stick x 7, iron_ore x 64, diamond_boots x 1'
  },
  {
    command: 'equip off-hand dirt',
    wantedMessage: 'equipped dirt'
  },
  {
    command: 'equip hand dirt',
    wantedMessage: 'equipped dirt'
  },
  {
    command: 'toss 32 dirt',
    wantedMessage: 'tossed 32 x dirt'
  },
  {
    command: 'craft 1 ladder',
    wantedMessage: 'I can make ladder'
  },
  {
    command: '',
    wantedMessage: 'did the recipe for ladder 1 times'
  },
  {
    command: 'equip feet diamond_boots',
    wantedMessage: 'equipped diamond_boots'
  },
  {
    command: 'toss iron_ore',
    wantedMessage: 'tossed iron_ore'
  },
  {
    command: 'unequip feet',
    wantedMessage: 'unequipped'
  },
  { // after tests layout
    command: 'list',
    wantedMessage: 'ladder x 3, diamond_boots x 1'
  }
]
module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  await bot.test.runExample('examples/inventory.js', async (name, cb) => {
    assert.strictEqual(name, 'inventory')
    bot.chat('/op inventory') // to counteract spawn protection
    bot.chat('/clear inventory')
    bot.chat('/setblock 52 4 0 crafting_table') // to make stone bricks stairs
    bot.chat('/give inventory dirt 64')
    bot.chat('/give inventory stick 7')
    bot.chat('/give inventory iron_ore 64')
    bot.chat('/give inventory diamond_boots 1')
    await bot.test.wait(2000)
    if (mcData.isOlderThan('1.9')) {
      tests.splice(tests.indexOf(tests.find(t => t.command.includes('off-hand'))), 1)
    }
    const testFuncs = tests.map(test => makeTest(test.command, test.wantedMessage))
    for (const test of testFuncs) {
      await test()
      await bot.test.wait(100)
    }
    // cleanup
    bot.chat('/setblock 52 4 0 air')
    cb()

    function makeTest (inStr, outStr) {
      return () => bot.test.tellAndListen(name, inStr, makeListener(outStr))
    }
  })
}

function makeListener (wantedMessage) {
  return (message) => {
    if (!message.startsWith(wantedMessage)) {
      assert.fail(`Unexpected message: ${message}`) // error
    }
    return true // stop listening
  }
}
