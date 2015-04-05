var mineflayer = require('../../index');
var Vec3 = require('vec3').Vec3;
var assert = require("assert");

module.exports=function(){
  return function(bot,done) {
    var dirtCollectTest = [
      function (cb) {
        bot.test.setInventorySlot(36, new mineflayer.Item(mineflayer.ItemIndex.blocksByName["dirt"].id, 1, 0), cb);
      },
      function (cb) {
        bot.test.fly(new Vec3(0, 2, 0), cb);
      },
      function (cb) {
        bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(0, -2, 0)), cb);
      },
      bot.test.clearInventory,
      function (cb) {
        bot.creative.stopFlying();
        waitForFall(cb);
      },
      bot.test.becomeSurvival,
      function (cb) {
        // we are bare handed
        bot.dig(bot.blockAt(bot.entity.position.plus(new Vec3(0, -1, 0))), function(err){
          assert(!err);
          cb();
        });
      },
      function (cb) {
        // make sure we collected das dirt
        setTimeout(function () {
          assert(mineflayer.Item.equal(bot.inventory.slots[36], new mineflayer.Item(mineflayer.ItemIndex.blocksByName["dirt"].id, 1, 0)));
          bot.test.sayEverywhere("dirt collect test: pass");
          cb();
        }, 1000);
      },
    ];

    function waitForFall(cb) {
      assert(!bot.entity.onGround, "waitForFall called when we were already on the ground");
      var startingPosition = bot.entity.position.clone();
      bot.on("move", function onMove() {
        if (bot.entity.onGround) {
          var distance = startingPosition.distanceTo(bot.entity.position);
          assert(distance > 0.2, "waitForFall didn't fall very far: " + distance);
          bot.removeListener("move", onMove);
          cb();
        }
      });
    }

    bot.test.callbackChain(dirtCollectTest, done);
  };
};