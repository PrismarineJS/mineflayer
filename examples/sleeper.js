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
  if(username === bot.username) return;
  switch(message) {
    case 'sleep':
      goToSleep();
      break;
    case 'wakeup':
      wakeUp();
      break;
  }
});

bot.on('sleep', function() {
  bot.chat("Good night!");
});
bot.on('wake', function() {
  bot.chat("Good morning!");
});

function goToSleep() {
  var bed = findBed();
  if(bed) {
    bot.sleep(bed, function(err) {
      if(err) {
        bot.chat("I can't sleep: " + err.message);
      } else {
        bot.chat("I'm sleeping");
      }
    });
  } else {
    bot.chat("No nearby bed");
  }

  function findBed() {
    var center = bot.entity.position;
    var cursor = mineflayer.vec3();
    for(cursor.x = center.x - 4; cursor.x < center.x + 4; cursor.x++) {
      for(cursor.y = center.y - 4; cursor.y < center.y + 4; cursor.y++) {
        for(cursor.z = center.z - 4; cursor.z < center.z + 4; cursor.z++) {
          var block = bot.blockAt(cursor);
          if(block.type === 26) return block;
        }
      }
    }
  }
}

function wakeUp() {
  bot.wake(function(err) {
    if(err) {
      bot.chat("I can't wake up: " + err.message);
    } else {
      bot.chat("I woke up");
    }
  });
}
