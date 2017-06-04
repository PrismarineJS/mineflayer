var Vec3 = require('vec3').Vec3;
var assert = require("assert");

// this test takes about 20min

var excludedBlocks = [
  // broken
  "bed", "double_stone_slab", "wooden_door", "iron_door", "redstone_ore", "lit_redstone_ore",
  "trapdoor", "double_wooden_slab", "jungle_stairs", "flower_pot", "carrots", "potatoes", "skull",
  "unpowered_comparator", "standing_banner", "wall_banner", "daylight_detector",
  "stone_slab2", "spruce_door", "birch_door", "jungle_door", "acacia_door", "dark_oak_door",

  //cannot be placed
  "piston_extension", "fire", "standing_sign", "reeds",
  "powered_repeater", "pumpkin_stem", "melon_stem", "brewing_stand", "cauldron", "lit_redstone_lamp", "tripwire",

  //cause problems
  "mob_spawner", "obsidian"];

module.exports = function(version) {
  const mcData=require('minecraft-data')(version);

  var funcs = {};
  for(var id in mcData.blocks) {
    if(mcData.blocks.hasOwnProperty(id)) {
      var block = mcData.blocks[id];
      if(block.diggable && excludedBlocks.indexOf(block.name) === -1)
        funcs[block.name] = (function(blockId) {
          return function(bot, done) {
            digSomething(blockId, bot, done)
          }
        })(block.id);
    }
  }

  return funcs;
};


function digSomething(blockId, bot, done) {
  var mcData=require('minecraft-data')(bot.version);
  var Item=require('prismarine-item')(bot.version);


  var diggingTest = [
    function(cb) {
      bot.test.setInventorySlot(36, new Item(blockId, 1, 0), cb);
    },
    function(cb) {
      //ToDo: find a better way than this setTimeout(cb,200);
      bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(1, 0, 0)), function() {
        setTimeout(cb, 200);
      });
    },
    bot.test.clearInventory,
    function(cb) {
      bot.test.setInventorySlot(36, new Item(mcData.itemsByName["diamond_pickaxe"].id, 1, 0), cb);
    },
    bot.test.becomeSurvival,
    function(cb) {
      // we are bare handed
      bot.dig(bot.blockAt(bot.entity.position.plus(new Vec3(1, 0, 0))), function(err) {
        assert(!err);
        cb();
      });
    },
    function(cb) {
      // make sure that block is gone

      assert.equal(bot.blockAt(bot.entity.position.plus(new Vec3(1, 0, 0))).type, 0);
      cb();
    },
  ];

  bot.test.callbackChain(diggingTest, done);
}