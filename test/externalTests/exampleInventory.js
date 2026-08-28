const assert = require('assert')

const tests = [
  {
    command: 'list',
    wantedMessage: 'dirt x 64, stick x 7, iron_ore x 64, diamond_boots x 1'
  },
  {
    command: 'equip off-hand dirt',
    wantedMessage: 'equipped dirt'
  },
  {
    command: 'list',
    wantedMessage: 'stick x 7, iron_ore x 64, diamond_boots x 1, dirt x 64'
  },
  {
    command: 'equip hand dirt',
    wantedMessage: 'equipped dirt'
  },
  {
    command: 'toss 64 dirt',
    wantedMessage: 'tossed 64 x dirt'
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
  await bot.test.runExample('examples/inventory.js', async (name) => {
    assert.strictEqual(name, 'inventory')
    bot.chat('/op inventory') // to counteract spawn protection
    bot.chat('/clear inventory')
    await bot.test.setBlock({ x: 52, y: bot.test.groundY, z: 0, blockName: 'crafting_table' })
    bot.chat('/give inventory dirt 64')
    bot.chat('/give inventory stick 7')
    bot.chat('/give inventory iron_ore 64')
    bot.chat('/give inventory diamond_boots 1')
    if (bot.registry.isOlderThan('1.9')) {
      tests.splice(tests.indexOf(tests.find(t => t.command.includes('off-hand'))), 2) // Delete off-hand command and the command after it as they don't work in 1.9
    }
    for (const test of tests) {
      await makeTest(test.command, test.wantedMessage)()
    }
    // cleanup
    bot.chat(`/setblock 52 ${bot.test.groundY} 0 air`)

    function makeTest (inStr, outStr) {
      return () => bot.test.tellAndListen(name, inStr, makeListener(outStr))
    }
  })
}

function makeListener (wantedMessage) {
  return (message) => {
    if (!message.startsWith(wantedMessage)) {
      assert.fail(`Unexpected message: ${message}, wanted ${wantedMessage}`) // error
    }
    return true // stop listening
  }
}
