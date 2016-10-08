/*
 * Watch out, this is a big one!
 *
 * This is a demonstration to show you how you can interact with:
 * - Chests
 * - Furnaces
 * - Dispensers
 * - Enchantment Tables
 *
 * and of course with your own inventory.
 *
 * Each of the main commands makes the bot interact with the block and open
 * its window. From there you can send another set of commands to actually
 * interact with the window and make awesome stuff.
 *
 * There's also a bonus example which shows you how to use the /invsee command
 * to see what items another user has in his inventory and what items he has
 * equipped.
 * This last one is usually reserved to Server Ops so make sure you have the
 * appropriate permission to do it or it won't work.
 */
var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node chest.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "chest",
  password: process.argv[5],
  verbose: true,
});

bot.on('experience', function() {
  bot.chat("I am level " + bot.experience.level);
});

bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  switch(true) {
    case /^list$/.test(message):
      sayItems();
      break;
    case /^chest$/.test(message):
      watchChest();
      break;
    case /^furnace$/.test(message):
      watchFurnace();
      break;
    case /^dispenser$/.test(message):
      watchDispenser();
      break;
    case /^enchant$/.test(message):
      watchEnchantmentTable();
      break;
    case /^chestminecart$/.test(message):
      watchChest(true);
      break;
    case /^invsee \w+( \d)?$/.test(message):
      // invsee Herobrine [or]
      // invsee Herobrine 1
      var command = message.split(' ');
      useInvsee(command[0], command[1]);
      break;
  }
});

function sayItems(items) {
  items = items || bot.inventory.items();
  var output = items.map(itemToString).join(', ');
  if(output) {
    bot.chat(output);
  } else {
    bot.chat("empty");
  }
}

function watchChest(minecart) {
  var chestToOpen;
  if (minecart) {
    chestToOpen = Object.keys(bot.entities)
      .map(function (id) {
        return bot.entities[id];
      }).find(function (e) {
        return e.entityType === 10 &&
          e.objectData.intField === 1 &&
          bot.entity.position.distanceTo(e.position) < 3;
      });
    if(!chestToOpen) {
      bot.chat("no chest minecart found");
      return;
    }
  } else {
    chestToOpen = bot.findBlock({
      matching: [54, 130, 146]
    });
    if(!chestToOpen) {
      bot.chat("no chest found");
      return;
    }
  }
  var chest = bot.openChest(chestToOpen);
  chest.on('open', function() {
    sayItems(chest.items());
  });
  chest.on('updateSlot', function(oldItem, newItem) {
    bot.chat("chest update: " + itemToString(oldItem) + " -> " + itemToString(newItem));
  });
  chest.on('close', function() {
    bot.chat("chest closed");
  });

  bot.on('chat', onChat);

  function onChat(username, message) {
    if(username === bot.username) return;
    var command = message.split(' ');
    switch(true) {
      case /^close$/.test(message):
        closeChest();
        break;
      case /^withdraw \d+ \w+$/.test(message):
        // withdraw amount name
        // ex: withdraw 16 stick
        withdrawItem(command[2], command[1]);
        break;
      case /^deposit \d+ \w+$/.test(message):
        // deposit amount name
        // ex: deposit 16 stick
        depositItem(command[2], command[1]);
        break;
    }
  }

  function closeChest() {
    chest.close();
    bot.removeListener('chat', onChat);
  }

  function withdrawItem(name, amount) {
    var item = itemByName(chest.items(), name);
    if(item) {
      chest.withdraw(item.type, null, amount, function(err) {
        if(err) {
          bot.chat("unable to withdraw " + amount + " " + item.name);
        } else {
          bot.chat("withdrew " + amount + " " + item.name);
        }
      });
    } else {
      bot.chat("unknown item " + name);
    }
  }

  function depositItem(name, amount) {
    var item = itemByName(bot.inventory.items(), name);
    if(item) {
      chest.deposit(item.type, null, amount, function(err) {
        if(err) {
          bot.chat("unable to deposit " + amount + " " + item.name);
        } else {
          bot.chat("deposited " + amount + " " + item.name);
        }
      });
    } else {
      bot.chat("unknown item " + name);
    }
  }
}

function watchFurnace() {
  var furnaceBlock = bot.findBlock({
    matching: [61, 62]
  });
  if(!furnaceBlock) {
    bot.chat("no furnace found");
    return;
  }
  var furnace = bot.openFurnace(furnaceBlock);
  furnace.on('open', function() {
    var output = "";
    output += "input: " + itemToString(furnace.inputItem()) + ", ";
    output += "fuel: " + itemToString(furnace.fuelItem()) + ", ";
    output += "output: " + itemToString(furnace.outputItem());
    bot.chat(output);
  });
  furnace.on('updateSlot', function(oldItem, newItem) {
    bot.chat("furnace update: " + itemToString(oldItem) + " -> " + itemToString(newItem));
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
    if(username === bot.username) return;
    var command = message.split(' ');
    switch (true) {
      case /^close$/.test(message):
        closeFurnace();
        break;
      case /^(input|fuel) \d+ \w+$/.test(message):
        // input amount name
        // ex: input 32 coal
        putInFurnace(command[0], command[2], command[1]);
        break;
      case /^take (input|fuel|output)$/.test(message):
        // take what
        // ex: take output
        takeFromFurnace(command[0]);
        break;
    }

    function closeFurnace() {
      furnace.close();
      bot.removeListener('chat', onChat);
    }

    function putInFurnace(where, name, amount) {
      var item = itemByName(bot.inventory.items(), name);
      if(item) {
        var fn = {
          input: furnace.putInput,
          fuel: furnace.putFuel,
        }[where];
        fn.call(furnace, item.type, null, amount, function(err) {
          if(err) {
            bot.chat("unable to put " + amount + " " + item.name);
          } else {
            bot.chat("put " + amount + " " + item.name);
          }
        });
      } else {
        bot.chat("unknown item " + name);
      }
    }

    function takeFromFurnace(what) {
      var fn = {
        input: furnace.takeInput,
        fuel: furnace.takeFuel,
        output: furnace.takeOutput,
      }[what];
      fn.call(furnace, function(err, item) {
        if(err) {
          bot.chat("unable to take " + item.name + " from " + cmd);
        } else {
          bot.chat("took " + item.name + " " + cmd);
        }
      });
    }
  }
}

function watchDispenser() {
  var dispenserBlock = bot.findBlock({
    matching: 23
  });
  if(!dispenserBlock) {
    bot.chat("no dispenser found");
    return;
  }
  var dispenser = bot.openDispenser(dispenserBlock);
  dispenser.on('open', function() {
    sayItems(dispenser.items());
  });
  dispenser.on('updateSlot', function(oldItem, newItem) {
    bot.chat("dispenser update: " + itemToString(oldItem) + " -> " + itemToString(newItem));
  });
  dispenser.on('close', function() {
    bot.chat("dispenser closed");
  });

  bot.on('chat', onChat);

  function onChat(username, message) {
    if(username === bot.username) return;
    var command = message.split(' ');
    switch(true) {
      case /^close$/.test(message):
        closeDispenser();
        break;
      case /^withdraw \d+ \w+$/.test(message):
        // withdraw amount name
        // ex: withdraw 16 stick
        withdrawItem(command[2], command[1]);
        break;
      case /^deposit \d+ \w+$/.test(message):
        // deposit amount name
        // ex: deposit 16 stick
        depositItem(command[2], command[1]);
        break;
    }
  }

  function closeDispenser() {
    dispenser.close();
    bot.removeListener('chat', onChat);
  }

  function withdrawItem(name, amount) {
    var item = itemByName(dispenser.items(), name);
    if(item) {
      dispenser.withdraw(item.type, null, amount, function(err) {
        if(err) {
          bot.chat("unable to withdraw " + amount + " " + item.name);
        } else {
          bot.chat("withdrew " + amount + " " + item.name);
        }
      });
    } else {
      bot.chat("unknown item " + name);
    }
  }

  function depositItem(name, amount) {
    var item = itemByName(bot.inventory.items(), name);
    if(item) {
      dispenser.deposit(item.type, null, amount, function(err) {
        if(err) {
          bot.chat("unable to deposit " + amount + " " + item.name);
        } else {
          bot.chat("deposited " + amount + " " + item.name);
        }
      });
    } else {
      bot.chat("unknown item " + name);
    }
  }
}

function watchEnchantmentTable() {
  var enchantTableBlock = bot.findBlock({
    matching: 116
  });
  if(!enchantTableBlock) {
    bot.chat("no enchantment table found");
    return;
  }
  var table = bot.openEnchantmentTable(enchantTableBlock);
  table.on('open', function() {
    bot.chat(itemToString(table.targetItem()));
  });
  table.on('updateSlot', function(oldItem, newItem) {
    bot.chat("enchantment table update: " + itemToString(oldItem) + " -> " + itemToString(newItem));
  });
  table.on('close', function() {
    bot.chat("enchantment table closed");
  });
  table.on('ready', function() {
    bot.chat("ready to enchant. choices are " + table.enchantments.map(function(o) {
        return o.level;
      }).join(', '));
  });

  bot.on('chat', onChat);

  function onChat(username, message) {
    if(username === bot.username) return;
    var command = message.split(' ');
    switch(true) {
      case /^close$/.test(message):
        closeEnchantmentTable();
        break;
      case /^put \w+$/.test(message):
        // put name
        // ex: put diamondsword
        putItem(command[1]);
        break;
      case /^add lapis$/.test(message):
        addLapis();
        break;
      case /^enchant \d+$/.test(message):
        // enchant choice
        // ex: enchant 2
        enchantItem(command[1]);
        break;
      case /^take$/.test(message):
        takeEnchantedItem();
        break;
    }

    function closeEnchantmentTable() {
      table.close();
    }

    function putItem(name) {
      var item = itemByName(table.window.items(), name);
      if(item) {
        table.putTargetItem(item, function(err) {
          if(err) {
            bot.chat("error putting " + itemToString(item));
          } else {
            bot.chat("I put " + itemToString(item));
          }
        });
      } else {
        bot.chat("unknown item " + name);
      }
    }

    function addLapis() {
      var item = itemByType(table.window.items(), 351);
      if(item) {
        table.putLapis(item, function(err) {
          if(err) {
            bot.chat("error putting " + itemToString(item));
          } else {
            bot.chat("I put " + itemToString(item));
          }
        });
      } else {
        bot.chat("I don't have any lapis");
      }
    }

    function enchantItem(choice) {
      choice = parseInt(choice, 10);
      table.enchant(choice, function(err, item) {
        if(err) {
          bot.chat("error enchanting");
        } else {
          bot.chat("enchanted " + itemToString(item));
        }
      });
    }

    function takeEnchantedItem() {
      table.takeTargetItem(function(err, item) {
        if(err) {
          bot.chat("error getting item");
        } else {
          bot.chat("got " + itemToString(item));
        }
      });
    }
  }
}

function useInvsee(username, showEquipment) {
  bot.once('windowOpen', function(window) {
    var count = window.containerItems().length;
    var what = showEquipment ? 'equipment' : 'inventory items';
    if(count) {
      bot.chat(username + "'s " + what + ":");
      sayItems(window.containerItems());
    } else {
      bot.chat(username + " has no " + what);
    }
  });
  if(showEquipment) {
    // any extra parameter triggers the easter egg
    // and shows the other player's equipment
    bot.chat('/invsee ' + username + ' 1');
  } else {
    bot.chat('/invsee ' + username);
  }
}

function itemToString(item) {
  if(item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}

function itemByType(items, type) {
  var item, i;
  for(i = 0; i < items.length; ++i) {
    item = items[i];
    if(item && item.type === type) return item;
  }
  return null;
}

function itemByName(items, name) {
  var item, i;
  for(i = 0; i < items.length; ++i) {
    item = items[i];
    if(item && item.name === name) return item;
  }
  return null;
}
