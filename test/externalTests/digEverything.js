var mineflayer = require('../../index');
var Vec3 = require('vec3').Vec3;
var assert = require("assert");

// this test takes about 20min

var excludedBlocks=[
  // broken
  "bed","stoneSlabDouble","doorOak","doorIron","oreRedstone","oreRedstoneGlowing","notGateInactive",
  "trapdoor","netherStalk","woodSlabDouble","stairsWoodJungle","flowerPot","carrots","potatoes","skull",
  "redstoneComparatorInactive","redstoneComparatorActive","bannerStanding","bannerWall","daylightDetectorInverted",
  "stoneSlab2Double","doorSpruce","doorBirch","doorJungle","doorAcacia","doorDarkOak",

  //cannot be placed
  "pistonExtension","fire","redstoneDust","crops","signPost","signWall","reeds",
  "redstoneRepeaterActive","pumpkinStem","melonStem","brewingStand","cauldron","redstoneLightActive","tripWire",

  //cause problems
  "mobSpawner","obsidian"];

module.exports=function() {
  var funcs={};
  for(var id in mineflayer.blocks)
  {
    if(mineflayer.blocks.hasOwnProperty(id))
    {
      var block=mineflayer.blocks[id];
      if(block.diggable && excludedBlocks.indexOf(block.name)===-1)
        funcs[block.name]=(function(blockId){return function(bot,done){digSomething(blockId,bot,done)}})(block.id);
    }
  }

  return funcs;
};



function digSomething(blockId,bot,done) {
  var diggingTest = [
    function (cb) {
      bot.test.setInventorySlot(36, new mineflayer.Item(blockId, 1, 0), cb);
    },
    function (cb) {
      //TODO: find a better way than this setTimeout(cb,200);
      bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(1, 0, 0)), function () {
        setTimeout(cb, 200);
      });
    },
    bot.test.clearInventory,
    function (cb) {
      bot.test.setInventorySlot(36, new mineflayer.Item(mineflayer.ItemIndex.itemsByName["pickaxeDiamond"].id, 1, 0), cb);
    },
    bot.test.becomeSurvival,
    function (cb) {
      // we are bare handed
      bot.dig(bot.blockAt(bot.entity.position.plus(new Vec3(1, 0, 0))), function (err) {
        assert(!err);
        cb();
      });
    },
    function (cb) {
      // make sure we that block is gone

      assert.equal(bot.blockAt(bot.entity.position.plus(new Vec3(1, 0, 0))).type, 0);
      cb();
    },
  ];

  bot.test.callbackChain(diggingTest, done);
}