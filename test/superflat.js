var assert = require("assert");
var Vec3 = require('vec3').Vec3;
var mineflayer = require('../');

var Item = mineflayer.Item;
var blocksByName = mineflayer.ItemIndex.blocksByName;

var bot = mineflayer.createBot({
    username: process.argv[4] ? process.argv[4] : "bot",
    viewDistance: "tiny",
    verbose: true,
    port:parseInt(process.argv[3]),
    host:process.argv[2],
    password:process.argv[5]
});

bot.on('login', function() {
  console.log("waiting a second...");
  // this wait is to get all the window updates out of the way before we start expecting exactly what we cause.
  // there are probably other updates coming in that we want to get out of the way too, like health updates.
  setTimeout(startTesting, 1000);
});

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
  bot.creative.setInventorySlot(targetSlot, item);
  bot.inventory.once("windowUpdate", function(slot, oldItem, newItem) {
    //console.log("windowUpdate:", slot, oldItem, newItem);
    assert(slot === targetSlot);
    assert(Item.equal(item, newItem));
    cb();
  });
}
function startTesting() {
  callbackChain([
    becomeCreative,
    clearInventory,
    function(cb) {
      console.log("starting test");
      setInventorySlot(36, new Item(blocksByName.dirt.id, 1, 0), cb);
    },
    function(cb) {
      fly(new Vec3(0, 2, 0), cb);
    },
    function(cb) {
      placeBlock(36, new Vec3(0, -2, 0), cb);
    },
    function(cb) {
      bot.creative.stopFlying();
      cb();
    },
  ], function() {
    console.log("done");
  });
}
function becomeCreative(cb) {
  // this function behaves the same whether we start in creative mode or not.
  // also, creative mode is always allowed for ops, even if server.properties says force-gamemode=true in survival mode.
  bot.chat("/gamemode creative");
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
    console.log("I didn't expect this message:", jsonMsg);
  });
}

function fly(delta, cb) {
  bot.creative.flyTo(bot.entity.position.plus(delta), cb);
}
function placeBlock(slot, delta, cb) {
  bot.setQuickBarSlot(slot - 36);
  var position = bot.entity.position.plus(delta);
  bot.placeBlock(bot.blockAt(position), delta.scaled(-1));
  setImmediate(cb);
}

function sayEverywhere(message) {
  bot.chat(message);
  console.log(message);
}

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
