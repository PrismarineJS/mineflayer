var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "camel",
});

bot.on('chat', function(username, message) {
  if (message === 'debug') {
    console.log(bot.inventory);
  } else if (message === 'list') {
    listInventory();
  } else if (/^equip /.test(message)) {
    var words = message.split(" ");
    var destination = words[1];
    var name = words[2];
    var item, block;
    for (var i = 0; i < bot.inventory.slots.length; ++i) {
      item = bot.inventory.slots[i];
      if (item && item.name === name) {
        bot.equip(item.type, destination, onEquip);
        return;
      }
    }
    bot.chat("I have no " + name);
  }
  function onEquip(err) {
    if (err) {
      bot.chat("unable to equip " + item.name);
      console.log(err.stack);
    } else {
      bot.chat("equipping " + item.name);
    }
  }
});

function listInventory() {
  var id, count, item;
  var output = "";
  for (id in bot.inventory.count) {
    count = bot.inventory.count[id];
    item = mineflayer.items[id] || mineflayer.blocks[id];
    if (count) output += item.name + ": " + count + ", ";
  }
  bot.chat(output);
}
