const Vec3 = require('vec3').Vec3
const assert = require('assert')

// this test takes about 20min

const excludedBlocks = [
  // broken
  'bed',
  'double_stone_slab',
  'wooden_door',
  'iron_door',
  'redstone_ore',
  'lit_redstone_ore',
  'trapdoor',
  'double_wooden_slab',
  'jungle_stairs',
  'flower_pot',
  'carrots',
  'potatoes',
  'skull',
  'unpowered_comparator',
  'standing_banner',
  'wall_banner',
  'daylight_detector',
  'stone_slab2',
  'spruce_door',
  'birch_door',
  'jungle_door',
  'acacia_door',
  'dark_oak_door',

  // cannot be placed
  'piston_extension',
  'fire',
  'standing_sign',
  'reeds',
  'powered_repeater',
  'pumpkin_stem',
  'melon_stem',
  'brewing_stand',
  'cauldron',
  'lit_redstone_lamp',
  'tripwire',

  // cause problems
  'mob_spawner',
  'obsidian'
]

module.exports = (version) => {
  const mcData = require('minecraft-data')(version)

  const funcs = {}
  for (const id in mcData.blocks) {
    if (mcData.blocks.hasOwnProperty(id)) {
      const block = mcData.blocks[id]
      if (block.diggable && excludedBlocks.indexOf(block.name) === -1) {
        funcs[block.name] = ((blockId => (bot, done) => {
          digSomething(blockId, bot, done)
        }))(block.id)
      }
    }
  }

  return funcs
}

function digSomething (blockId, bot, done) {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  const diggingTest = [
    (cb) => {
      bot.test.setInventorySlot(36, new Item(blockId, 1, 0), cb)
    },
    (cb) => {
      // TODO: find a better way than this setTimeout(cb,200);
      bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(1, 0, 0)), () => {
        setTimeout(cb, 200)
      })
    },
    bot.test.clearInventory,
    (cb) => {
      bot.test.setInventorySlot(36, new Item(mcData.itemsByName['diamond_pickaxe'].id, 1, 0), cb)
    },
    bot.test.becomeSurvival,
    (cb) => {
      // we are bare handed
      bot.dig(bot.blockAt(bot.entity.position.plus(new Vec3(1, 0, 0))), (err) => {
        assert(!err)
        cb()
      })
    },
    (cb) => {
      // make sure that block is gone

      assert.strictEqual(bot.blockAt(bot.entity.position.plus(new Vec3(1, 0, 0))).type, 0)
      cb()
    }
  ]

  bot.test.callbackChain(diggingTest, done)
}
