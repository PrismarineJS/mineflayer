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
  } else if (message === "furnace") {
    watchFurnace();
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

function watchFurnace() {
  var furnaceBlock = findFurnace();
  if (! furnaceBlock) {
    bot.chat("no furnace found");
    return;
  }
  var furnace = bot.openFurnace(furnaceBlock);
  furnace.on('open', function() {
    var output = "";
    output += "input: " + itemStr(furnace.inputItem()) + ", ";
    output += "fuel: " + itemStr(furnace.fuelItem()) + ", ";
    output += "output: " + itemStr(furnace.outputItem());
    bot.chat(output);
  });
  furnace.on('updateSlot', function(oldItem, newItem) {
    bot.chat("furnace update: " + itemStr(oldItem) + " -> " + itemStr(newItem));
  });
  furnace.on('close', function() {
    bot.chat("furnace closed");
  });
  furnace.on('update', function() {
    console.log("fuel: " + Math.round(furnace.fuel * 100) +
      "% progress: " + Math.round(furnace.progress * 100) + "%");
  });

  bot.on('chat', onChat);
  
  function onChat(username, message) {
    var words, cmd, name, amount, item, fn;
    if (message === 'close') {
      furnace.close();
      bot.removeListener('chat', onChat);
    } else if (/^(input|fuel) (\d+)/.test(message)) {
      words = message.split(/\s+/);
      cmd = words[0];
      amount = parseInt(words[1], 10);
      name = words[2];
      item = itemByName(bot.inventory.items(), name);
      if (!item) {
        bot.chat("unknown item " + name);
        return;
      }
      fn = cmd === 'input' ? furnace.putInput : furnace.putFuel;
      fn.call(furnace, item.type, null, amount, function(err) {
        if (err) {
          bot.chat("unable to put " + amount + " " + item.name);
        } else {
          bot.chat("put " + amount + " " + item.name);
        }
      });
    } else if (/^take (input|fuel|output)$/.test(message)) {
      words = message.split(/\s+/);
      cmd = words[1];
      fn = {
        input: furnace.takeInput,
        fuel: furnace.takeFuel,
        output: furnace.takeOutput,
      }[cmd];
      fn.call(furnace, function(err, item) {
        if (err) {
          bot.chat("unable to take " + item.name + " from " + cmd);
        } else {
          bot.chat("took " + item.name + " " + cmd);
        }
      });
    }
  }
}

function watchChest() {
  var chestBlock = findChest();
  if (! chestBlock) {
    bot.chat("no chest found");
    return;
  }
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
  chest.on('updateSlot', function(oldItem, newItem) {
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

function findFurnace() {
  var cursor = mineflayer.vec3();
  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if (block.type === 61 || block.type === 62) return block;
      }
    }
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
    if (item && item.name === name) return item;
  }
  return null;
}

