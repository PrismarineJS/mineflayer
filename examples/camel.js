var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "camel",
});

bot.on('chat', function(username, message) {
  var words, name, item, amount, destination;
  if (message === 'debug') {
    console.log(bot.inventory);
  } else if (message === 'list') {
    listInventory();
  } else if (/^toss (\d+) /.test(message)) {
    words = message.split(" ");
    amount = parseInt(words[1], 10);
    name = words[2];
    item = itemByName(name);
    if (item) {
      bot.toss(item.type, null, amount, function(err) {
        if (err) {
          bot.chat("unable to toss " + item.name);
          console.error(err.stack);
        } else {
          bot.chat("tossed " + amount + " " + item.name);
        }
      });
    } else {
      bot.chat("I have no " + name);
    }
  } else if (/^toss /.test(message)) {
    words = message.split(" ");
    name = words[1];
    item = itemByName(name);
    if (item) {
      bot.tossStack(item, function(err) {
        if (err) {
          bot.chat("unable to toss " + item.name);
          console.error(err.stack);
        } else {
          bot.chat("tossed " + item.name);
        }
      });
    } else {
      bot.chat("I have no " + name);
    }
  } else if (/^equip /.test(message)) {
    words = message.split(" ");
    destination = words[1];
    name = words[2];
    item = itemByName(name);
    if (item) {
      bot.equip(item.type, destination, function(err) {
        if (err) {
          bot.chat("unable to equip " + item.name);
          console.error(err.stack);
        } else {
          bot.chat("equipped " + item.name);
        }
      });
    } else {
      bot.chat("I have no " + name);
    }
  } else if (/^unequip /.test(message)) {
    words = message.split(" ");
    destination = words[1];
    bot.unequip(destination, function(err) {
      if (err) {
        bot.chat("unable to unequip");
        console.error(err.stack);
      } else {
        bot.chat("unequipped");
      }
    });
  } else if (/^recipe /.test(message)) {
    words = message.split(" ");
    name = words[1];
    item = findItemType(name);
    if (item == null) {
      bot.chat("unknown item: " + name);
    } else {
      var recipes = bot.recipesFor(item.id);
      if (recipes.length) {
        bot.chat("I can make " + item.name);
        console.log(recipes);
      } else {
        bot.chat("I can't make " + item.name);
      }
    }
  }
});

function listInventory() {
  var output = "";
  bot.inventory.items().forEach(function(item) {
    output += item.name + ": " + item.count + ", ";
  });
  if (output) {
    bot.chat(output);
  } else {
    bot.chat("empty inventory");
  }
}

function itemByName(name) {
  var item, i;
  for (i = 0; i < bot.inventory.slots.length; ++i) {
    item = bot.inventory.slots[i];
    if (item && item.name === name) return item;
  }
  return null;
}

function findItemType(name) {
  for (var id in mineflayer.items) {
    var item = mineflayer.items[id];
    if (item.name.indexOf(name) !== -1) return item;
  }
  return null;
}
