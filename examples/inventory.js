var mineflayer = require('../');
var bot = mineflayer.createBot();

bot.on('chat', function(username, message) {
  var words, name, item, amount, destination;
  if (message === 'debug') {
    console.log(bot.inventory);
  } else if (message === 'list') {
    listInventory();
  } else if (message === 'look') {
    var entity = bot.players[username].entity;
    bot.lookAt(entity.position.offset(0, entity.height, 0));
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
      bot.equip(item, destination, function(err) {
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
  } else if (/^craft (\d+)/.test(message)) {
    words = message.split(" ");
    amount = parseInt(words[1], 10);
    name = words[2];
    item = findItemType(name);
    var craftingTable = findCraftingTable();
    var wbText = craftingTable ? "with a crafting table, " : "without a crafting table, ";
    if (item == null) {
      bot.chat(wbText + "unknown item: " + name);
    } else {
      var recipes = bot.recipesFor(item.id, null, 1, craftingTable);
      if (recipes.length) {
        bot.chat(wbText + "I can make " + item.name);
        bot.craft(recipes[0], amount, craftingTable, function(err) {
          if (err) {
            bot.chat("error making " + item.name);
            console.error(err.stack);
          } else {
            bot.chat("made " + amount + " " + item.name);
          }
        });
      } else {
        bot.chat(wbText + "I can't make " + item.name);
      }
    }
  } else if (message === "use") {
    bot.chat("activating");
    bot.activateItem();
  } else if (message === "stop") {
    bot.chat("stopping");
    bot.clearControlStates();
    bot.deactivateItem();
  } else if (message === "food") {
    bot.chat("food: " + bot.food);
  } else if (message === "jump") {
    bot.setControlState('jump', true);
  } else if (message === "health") {
    bot.chat("health: " + bot.health);
  } else if (message === "difficulty") {
    bot.chat("difficulty: " + bot.game.difficulty);
  }
});


function listInventory() {
  bot.chat(bot.inventory.items().map(itemStr).join(", "));
}

function itemStr(item) {
  if (item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}

function itemByName(name) {
  return bot.inventory.items().filter(function(item) {
    return item.name === name;
  })[0];
}

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
  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if (block.type === 58) return block;
      }
    }
  }
}
