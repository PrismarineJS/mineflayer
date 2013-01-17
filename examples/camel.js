var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "camel",
});

bot.on('chat', function(username, message) {
  var words, name, item;
  if (message === 'debug') {
    console.log(bot.inventory);
  } else if (message === 'list') {
    listInventory();
  } else if (/^toss /.test(message)) {
    words = message.split(" ");
    name = words[1];
    item = itemByName(name);
    if (item) {
      bot.tossStack(item, function(err) {
        if (err) {
          bot.chat("unable to toss " + item.name);
          console.log(err.stack);
        } else {
          bot.chat("tossed " + item.name);
        }
      });
    } else {
      bot.chat("I have no " + name);
    }
  } else if (/^equip /.test(message)) {
    words = message.split(" ");
    var destination = words[1];
    name = words[2];
    item = itemByName(name);
    if (item) {
      bot.equip(item.type, destination, function(err) {
        if (err) {
          bot.chat("unable to equip " + item.name);
          console.log(err.stack);
        } else {
          bot.chat("equipped " + item.name);
        }
      });
    } else {
      bot.chat("I have no " + name);
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

function itemByName(name) {
  var item, i;
  for (i = 0; i < bot.inventory.slots.length; ++i) {
    item = bot.inventory.slots[i];
    if (item && item.name === name) return item;
  }
  return null;
}
