var mineflayer = require('../');
var vec3 = mineflayer.vec3;

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node digger.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}
var bot = mineflayer.createBot({
  username: process.argv[4] ? process.argv[4] : "digger",
  verbose: true,
  port: parseInt(process.argv[3]),
  host: process.argv[2],
  password: process.argv[5]
});

bot.on('chat', function(username, message) {
  if(message === 'debug') {
    console.log(bot.inventory);
  } else if(message === 'dig') {
    dig();
  } else if(message === 'build') {
    build();
  } else if(message === 'list') {
    listInventory();
  } else if(message === 'dirt') {
    bot.equip(0x03, 'hand', function(err) {
      if(err) {
        console.error(err.stack);
        bot.chat("unable to equip dirt");
      } else {
        bot.chat("equipped dirt");
      }
    });
  } else if(message === 'creative') {
    bot.chat("/gamemode 1");
  } else if(message === 'survival') {
    bot.chat("/gamemode 0");
  }
});

bot.on('game', function() {
  bot.chat("game mode is " + bot.game.gameMode);
});

function dig() {
  if(bot.targetDigBlock) {
    bot.chat("already digging " + bot.targetDigBlock.name);
  } else {
    var target = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if(target && bot.canDigBlock(target)) {
      bot.chat("starting to dig " + target.name);
      bot.dig(target, onDiggingCompleted);
    } else {
      bot.chat("cannot dig");
    }
  }

  function onDiggingCompleted() {
    bot.chat("finished digging " + target.name);
  }
}


function build() {
  var referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1.0;
  bot.setControlState('jump', true);
  bot.on('move', placeIfHighEnough);

  function placeIfHighEnough() {
    if(bot.entity.position.y > jumpY) {
      bot.placeBlock(referenceBlock, vec3(0, 1, 0));
      bot.setControlState('jump', false);
      bot.removeListener('move', placeIfHighEnough);
    }
  }
}

function listInventory() {
  var id, count, item, idx, slot;
  var output = "";
  for(idx in bot.inventory.slots) {
    slot = bot.inventory.slots[idx];
    if(slot == null) continue;
    count = slot.count;
    id = slot.type;
    item = mineflayer.data.findItemOrBlockById(id);
    if(count) output += item.name + ": " + count + ", ";
  }
  if(!output)
    bot.chat('I have no items');
  else
    bot.chat(output);
}
