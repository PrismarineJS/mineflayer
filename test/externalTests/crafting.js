var mineflayer = require('../../index');
var Vec3 = require('vec3').Vec3;
var assert = require("assert");


module.exports=function(){
  return function(bot,done) {
    function findItemType(name) {
      var id;
      for (id in mineflayer.items) {
        var item = mineflayer.items[id];
        if (item.name === name) return item;
      }
      for (id in mineflayer.blocks) {
        var block = mineflayer.blocks[id];
        if (block.name === name) return block;
      }
      return null;
    }


    function findCraftingTable() {
      var cursor = mineflayer.vec3();
      for (cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
        for (cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
          for (cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
            var block = bot.blockAt(cursor);
            if (block.type === 58) return block;
          }
        }
      }
    }

    function craft(amount, name,cb) {
      item = findItemType(name);
      var craftingTable = findCraftingTable();
      var wbText = craftingTable ? "with a crafting table, " : "without a crafting table, ";
      if (item == null) {
        bot.test.sayEverywhere(wbText + "unknown item: " + name);
        throw(new Error(wbText + "unknown item: " + name));
      } else {
        var recipes = bot.recipesFor(item.id, null, 1, craftingTable); // doesn't check if it's possible to do it amount times
        if (recipes.length) {
          bot.test.sayEverywhere(wbText + "I can make " + item.name);
          bot.craft(recipes[0], amount, craftingTable, function (err) {
            if (err) {
              bot.test.sayEverywhere("error making " + item.name);
              console.error(err.stack);
              throw(new Error("error making " + item.name));
            } else {
              bot.test.sayEverywhere("did the recipe for " + item.name + " " + amount + "times");
              cb();
            }
          });
        } else {
          bot.test.sayEverywhere(wbText + "I can't make " + item.name);
          throw(new Error(wbText + "I can't make " + item.name));
        }
      }
    }

    var craftTest = [
      function (cb) {
        bot.test.setInventorySlot(36, new mineflayer.Item(mineflayer.ItemIndex.blocksByName["log"].id, 1, 0), cb);
      },
      bot.test.becomeSurvival,
      function (cb) {
        craft(1,"planks",cb);
      },
    ];


    bot.test.callbackChain(craftTest, done);
  };
};