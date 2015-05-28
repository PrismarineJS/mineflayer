/*
 * Even bots need to rest sometimes.
 *
 * That's why we created an example that demonstrates how easy it is
 * to find and use a bed properly.
 *
 * You can ask the bot to sleep or wake up by sending a chat message.
 */
var mineflayer = require('../');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node sleeper.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "sleeper",
  password: process.argv[5],
  verbose: true,
});

bot.on('chat', function(username, message) {
  if(message === 'sleep') {
    var bedBlock = findBed();
    if(bedBlock) {
      bot.sleep(bedBlock, function(err) {
        if(err) {
          bot.chat("I can't sleep: " + err.message);
        } else {
          bot.chat("Good night!");
        }
      });
    } else {
      bot.chat("No nearby bed");
    }
  } else if(message === 'wake') {
    bot.wake(function(err) {
      if(err) {
        bot.chat("I can't wake up: " + err.message);
      } else {
        bot.chat("Good morning!");
      }
    });
  }
});

bot.on('sleep', function() {
  bot.chat("zzzz");
});

bot.on('wake', function() {
  bot.chat("I woke up");
});

function findBed() {
  var position = bot.entity.position;
  var cursor = mineflayer.vec3();
  var block;
  for(cursor.x = position.x - 4; cursor.x < position.x + 4; cursor.x++) {
    for(cursor.y = position.y - 4; cursor.y < position.y + 4; cursor.y++) {
      for(cursor.z = position.z - 4; cursor.z < position.z + 4; cursor.z++) {
        block = bot.blockAt(cursor);
        if(block.type === 26) return block;
      }
    }
  }
}
