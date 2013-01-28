var mineflayer = require('../');
var bot = mineflayer.createBot();

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
    output += item.name + ": " + item.count + ", ";
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
  var chest = bot.openChest(chestBlock);
  chest.on('open', function() {
    var output = "";
    chest.items().forEach(function(item) {
      output += item.name + " x " + item.count + ", ";
    });
    if (output) {
      bot.chat(output);
    } else {
      bot.chat("empty");
    }
  });
  chest.on('update', function(oldItem, newItem) {
    bot.chat("chest update: " + oldItem.displayName + " x " + oldItem.count +
      " -> " + newItem.displayName + " x " + newItem.count);
  });
  chest.on('close', function() {
    bot.chat("chest closed");
  });

  bot.on('chat', onChat);
  
  function onChat(username, message) {
    if (message === 'close') {
      chest.close();
      bot.removeListener('chat', onChat);
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
