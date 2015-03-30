var assert = require("assert");
var Vec3 = require('vec3').Vec3;
var mineflayer = require('../../../index');


module.exports = inject;

function inject(bot)
{
  bot.test={};
  bot.test.callbackChain=callbackChain;
  bot.test.sayEverywhere=sayEverywhere;
  bot.test.clearInventory=clearInventory;
  bot.test.becomeSurvival=becomeSurvival;
  bot.test.fly=fly;
  bot.test.resetState=resetState;
  bot.test.setInventorySlot=setInventorySlot;
  bot.test.placeBlock=placeBlock;
  bot.test.becomeSurvival=becomeSurvival;


  function callbackChain(functions, cb) {
    var i = 0;
    callNext();
    function callNext() {
      if (i < functions.length) {
        functions[i++](callNext);
      } else {
        cb();
      }
    }
  }

  var superflatLayers = [
    new mineflayer.Block(mineflayer.ItemIndex.blocksByName["bedrock"].id),
    new mineflayer.Block(mineflayer.ItemIndex.blocksByName["dirt"].id),
    new mineflayer.Block(mineflayer.ItemIndex.blocksByName["dirt"].id),
    new mineflayer.Block(mineflayer.ItemIndex.blocksByName["grass"].id),
    // and then air
  ];

  function resetBlocksToSuperflat(cb) {
    var groundY = 4;
    for (var y = groundY + 4; y >= groundY - 1; y--) {
      var expectedBlock = superflatLayers[y];
      for (var i = 0; i < deltas3x3.length; i++) {
        var position = bot.entity.position.plus(deltas3x3[i]);
        position.y = y;
        var block = bot.blockAt(position);
        if (expectedBlock == null) {
          if (block.name === "air") continue;
          // dig it
          return digAndResume(position);
        } else {
          if (expectedBlock.type === block.type) continue;
          // fix it
          if (block.type !== 0) {
            // dig it
            return digAndResume(position);
          }
          // place it
          return placeAndResume(position, expectedBlock);
        }
      }
    }
    // all good
    cb();

    function digAndResume(position) {
      bot.dig(bot.blockAt(position), resume);
    }
    function placeAndResume(position, block) {
      setInventorySlot(36, new mineflayer.Item(block.type, 1, 0), function() {
        placeBlock(36, position);
        resume();
      });
    }
    function resume() {
      resetBlocksToSuperflat(cb);
    }
  }



  function placeBlock(slot, position, cb) {
    bot.setQuickBarSlot(slot - 36);
    // always place the block on the top of the block below it, i guess.
    var referenceBlock = bot.blockAt(position.plus(new Vec3(0, -1, 0)));
    bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));
    setImmediate(cb);
  }



// always leaves you in creative mode
  function resetState(cb) {
    callbackChain([
      becomeCreative,
      clearInventory,
      function(cb) {
        bot.creative.startFlying();
        teleport(new Vec3(0, 4, 0), cb);
      },
      waitForChunksToLoad,
      resetBlocksToSuperflat,
      clearInventory,
    ], cb);
  }

  function becomeCreative(cb) { setCreativeMode(true, cb); }
  function becomeSurvival(cb) { setCreativeMode(false, cb); }
  function setCreativeMode(value, cb) {
    // this function behaves the same whether we start in creative mode or not.
    // also, creative mode is always allowed for ops, even if server.properties says force-gamemode=true in survival mode.
    bot.chat("/gamemode " + (value ? "creative" : "survival"));
    bot.on("message", function onMessage(jsonMsg) {
      switch (jsonMsg.translate) {
        case "gameMode.changed":
          // good.
          bot.removeListener("message", onMessage);
          return cb();
        case "commands.generic.permission":
          sayEverywhere("ERROR: I need to be an op (allow cheats).");
          bot.removeListener("message", onMessage);
          // at this point we just wait forever.
          // the intention is that someone ops us while we're sitting here, then you kill and restart the test.
          return;
      }
      //console.log("I didn't expect this message:", jsonMsg);
    });
  }


  function clearInventory(cb) {
    for (var i = 0; i < bot.inventory.slots.length; i++) {
      if (bot.inventory.slots[i] == null) continue;
      setInventorySlot(i, null, function() {
        // start over until we have nothing to do
        clearInventory(cb);
      });
      return;
    }
    // done
    cb();
  }

// you need to be in creative mode for this to work
  function setInventorySlot(targetSlot, item, cb) {
    if (mineflayer.Item.equal(bot.inventory.slots[targetSlot], item)) {
      // already good to go
      return setImmediate(cb);
    }
    bot.creative.setInventorySlot(targetSlot, item);
    bot.inventory.once("windowUpdate", function(slot, oldItem, newItem) {
      assert(slot === targetSlot);
      assert(mineflayer.Item.equal(item, newItem));
      setImmediate(cb);
    });
  }


  function teleport(position, cb) {
    bot.chat("/tp " + bot.username + " " + position.x + " " + position.y + " " + position.z);
    bot.on("move", function onMove() {
      if (bot.entity.position.distanceTo(position) < 0.9) {
        // close enough
        bot.removeListener("move", onMove);
        cb();
      }
    });
  }

  function sayEverywhere(message) {
    bot.chat(message);
    console.log(message);
  }


  var deltas3x3 = [
    new Vec3(-1, 0, -1),
    new Vec3( 0, 0, -1),
    new Vec3( 1, 0, -1),
    new Vec3(-1, 0,  0),
    new Vec3( 0, 0,  0),
    new Vec3( 1, 0,  0),
    new Vec3(-1, 0,  1),
    new Vec3( 0, 0,  1),
    new Vec3( 1, 0,  1),
  ];

  function waitForChunksToLoad(cb) {
    var isLoaded = true;
    // check 3x3 chunks around us
    for (var i = 0; i < deltas3x3.length; i++) {
      if (bot.blockAt(bot.entity.position.plus(deltas3x3[i].scaled(64))) == null) {
        // keep wait
        return setTimeout(function() {
          waitForChunksToLoad(cb);
        }, 100);
      }
    }
    cb();
  }


  function fly(delta, cb) {
    bot.creative.flyTo(bot.entity.position.plus(delta), cb);
  }
}
