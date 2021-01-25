const assert = require('assert')

const tests = [
  {
    command: 'list',
    wantedMessage: 'dirt x 64, stone x 64, iron_ore x 64, diamond_boots x 1'
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
    command: 'craft 16 stone_brick_stairs',
    wantedMessage: 'I cannot make stone_brick_stairs'
  },

  {
    command: 'craft 16 stone_bricks',
    wantedMessage: 'did the recipe for stone_bricks 16 times'
  },

  {
    command: 'craft 10 stone_brick_stairs',
    wantedMessage: 'did the recipe for stick 10 stone_brick_stairs'
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
    wantedMessage: 'stone_bricks x 4, stone_brick_stairs x 40, diamond_boots x 1'
  }
]

module.exports = () => (bot, done) => {
  bot.test.runExample('examples/inventory.js', (ign, cb) => {
    assert.strictEqual(ign, 'inventory')
    bot.chat('/op inventory') // to counteract spawn protection
    bot.chat('/setblock ~2 ~ ~2 crafting_table') // to make stone bricks stairs
    bot.chat('/give inventory dirt 64')
    bot.chat('/give inventory stone 64')
    bot.chat('/give inventory iron_ore 64')
    bot.chat('/give inventory diamond_boots 1')
    const inventoryTest = Object.values(tests).map(testData => generateTest(testData, cb))
    inventoryTest.push(removeCraftingTable)
    // start test
    setTimeout(() => {
      bot.test.callbackChain(inventoryTest, cb)
    }, 2000)

    function generateTest ({ command, wantedMessage }, cb) {
      return () => bot.test.tellAndListen(ign, command, makeListener(wantedMessage), cb)
    }
    function removeCraftingTable () {
      bot.chat('/setblock ~2 ~ ~2 air')
      return true
    }
  }, done)
}

function makeListener (wantedMessage) {
  return message => {
    if (!message.startsWith(wantedMessage)) {
      assert.fail(`Unexpected message: ${message}`) // error
    }
    return true // stop listening
  }
}
