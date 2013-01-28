var mineflayer = require('../');
var bot = mineflayer.createBot();

bot.on('end', function(reason) {
  console.log("end", reason);
});

bot.on('kicked', function(reason) {
  console.log("kicked for", reason);
});

bot.on('chat', function(username, message) {
  if (message === "list") {
    listInventory();
  } else if (message === "chest") {
    watchChest();
  }
});

function listInventory() {
  var output = "";
  bot.inventory.items().forEach(function(item) {
    output += itemStr(item) + ", ";
  });
  if (output) {
    bot.chat(output);
  } else {
    bot.chat("empty");
  }
}

function watchChest() {
  var chestBlock = findChest();
  if (! chestBlock) {
    bot.chat("no chest found");
    return;
  }
  console.log("opening chest");
  var chest = bot.openChest(chestBlock);
  chest.on('open', function() {
    var output = "";
    chest.items().forEach(function(item) {
      output += itemStr(item) + ", ";
    });
    if (output) {
      bot.chat(output);
    } else {
      bot.chat("empty");
    }
  });
  chest.on('update', function(oldItem, newItem) {
    bot.chat("chest update: " + itemStr(oldItem) + " -> " + itemStr(newItem));
  });
  chest.on('close', function() {
    bot.chat("chest closed");
  });

  bot.on('chat', onChat);
  
  function onChat(username, message) {
    var words, name, amount, item;
    if (message === 'close') {
      chest.close();
      bot.removeListener('chat', onChat);
    } else if (/^withdraw (\d+)/.test(message)) {
      words = message.split(/\s+/);
      amount = parseInt(words[1], 10);
      name = words[2];
      item = itemByName(chest.items(), name);
      if (!item) {
        bot.chat("unknown item " + name);
        return;
      }
      chest.withdraw(item.type, null, amount, function(err) {
        if (err) {
          bot.chat("unable to withdraw " + amount + " " + item.name);
        } else {
          bot.chat("withdrew " + amount + " " + item.name);
        }
      });
    } else if (/^deposit (\d+)/.test(message)) {
      words = message.split(/\s+/);
      amount = parseInt(words[1], 10);
      name = words[2];
      item = itemByName(bot.inventory.items(), name);
      if (!item) {
        bot.chat("unknown item " + name);
        return;
      }
      chest.deposit(item.type, null, amount, function(err) {
        if (err) {
          bot.chat("unable to deposit " + amount + " " + item.name);
        } else {
          bot.chat("deposited " + amount + " " + item.name);
        }
      });
    }
  }
}

function itemStr(item) {
  if (item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}

function findChest() {
  var cursor = mineflayer.vec3();
  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if (block.type === 54) return block;
      }
    }
  }
}

function itemByName(items, name) {
  var item, i;
  for (i = 0; i < items.length; ++i) {
    item = items[i];
    if (item.name === name) return item;
  }
  return null;
}

