var assert = require("assert");
var mineflayer = require('../');

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
  setTimeout(startTesting, 1000);
});

function clearInventory(cb) {
  for (var i = 0; i < bot.inventory.slots.length; i++) {
    if (bot.inventory.slots[i] == null) continue;
    clearSlot(i);
    return;
  }
  // done
  cb();

  function clearSlot(targetSlot) {
    console.log("clearing slot", targetSlot);
    bot.creative.setInventorySlot(targetSlot, null);
    bot.inventory.once("windowUpdate", function(slot, oldItem, newItem) {
      //console.log("windowUpdate:", slot, oldItem, newItem);
      assert(slot === targetSlot);
      assert(newItem == null);
      clearInventory(cb);
    });
  }
}
function startTesting() {
  console.log("starting test");
  clearInventory(function() {
    slashGive("dirt", 1, function() {
      console.log("done");
    });
  });
}

function slashGive(itemName, count, cb) {
  var message = "/give " + bot.username + " " + itemName + " " + count;
  console.log("saying:", message);
  bot.chat(message);
  bot.inventory.once("windowUpdate", function(slot, oldItem, newItem) {
    //console.log("windowUpdate:", slot, oldItem, newItem);
    cb();
  });
}
