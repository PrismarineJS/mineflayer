var mineflayer = require('../../index');
var Vec3 = require('vec3').Vec3;
var assert = require("assert");

module.exports=function() {

  return function(bot,done){
    var chestManagementTest = (function() {
      var smallChestLocation = new Vec3(0, 4, -1);
      var largeChestLocations = [new Vec3(0, 4, 1), new Vec3(1, 4, 1)];
      var smallTrappedChestLocation = new Vec3(1, 4, 0);
      var largeTrappedChestLocations = [new Vec3(-1, 4, 1), new Vec3(-1, 4, 0)];
      var chestSlot = 36;
      var trappedChestSlot = 37;
      var boneSlot = 38;

      return [
        function(cb) {
          bot.test.setInventorySlot(chestSlot, new mineflayer.Item(mineflayer.ItemIndex.blocksByName["chest"].id, 3, 0), function() {
            bot.test.setInventorySlot(trappedChestSlot, new mineflayer.Item(mineflayer.ItemIndex.blocksByName["trappedChest"].id, 3, 0), function() {
              bot.test.setInventorySlot(boneSlot, new mineflayer.Item(mineflayer.ItemIndex.itemsByName["bone"].id, 3, 0), cb);
            });
          });
        },
        bot.test.becomeSurvival,
        function(cb) {
          // place the chests around us
          bot.test.placeBlock(chestSlot, largeChestLocations[0], function() {
            bot.test.placeBlock(chestSlot, largeChestLocations[1], function() {
              bot.test.placeBlock(chestSlot, smallChestLocation, function() {
                bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[0], function() {
                  bot.test.placeBlock(trappedChestSlot, largeTrappedChestLocations[1], function() {
                    bot.test.placeBlock(trappedChestSlot, smallTrappedChestLocation, function() {
                      cb();
                    });
                  });
                });
              });
            });
          });
        },
        function(cb) { depositBones(smallChestLocation, 1, cb); },
        function(cb) { depositBones(largeChestLocations[0], 2, cb); },
        function(cb) {
          checkSlotsAreEmpty(bot.inventory);
          cb();
        },
        function(cb) { withdrawBones(smallChestLocation, 1, cb); },
        function(cb) { withdrawBones(largeChestLocations[0], 2, cb); },
        function(cb) { depositBones(smallTrappedChestLocation, 1, cb); },
        function(cb) { depositBones(largeTrappedChestLocations[0], 2, cb); },
        function(cb) {
          checkSlotsAreEmpty(bot.inventory);
          cb();
        },
        function(cb) { withdrawBones(smallTrappedChestLocation, 1, cb); },
        function(cb) { withdrawBones(largeTrappedChestLocations[0], 2, cb); },
        function(cb) {
          bot.test.sayEverywhere("chest management test: pass");
          cb();
        },
      ];

      function depositBones(chestLocation, count, cb) {
        var chest = bot.openChest(bot.blockAt(chestLocation));
        chest.on("open", function() {
          checkSlotsAreEmpty(chest.window);
          chest.deposit(mineflayer.ItemIndex.itemsByName["bone"].id, 0, count, function(err) {
            assert(!err);
            chest.close();
            cb();
          });
        });
      }
      function withdrawBones(chestLocation, count, cb) {
        var chest = bot.openChest(bot.blockAt(chestLocation));
        chest.on("open", function() {
          chest.withdraw(mineflayer.ItemIndex.itemsByName["bone"].id, 0, count, function(err) {

            assert(!err);
            checkSlotsAreEmpty(chest.window);
            chest.close();
            cb();
          });
        });
      }
      function checkSlotsAreEmpty(window) {
        for (var i = 0; i < window.inventorySlotStart; i++) {
          assert(window.slots[i] == null);
        }
      }
    })();

    bot.test.callbackChain(chestManagementTest,done);
  };
};
