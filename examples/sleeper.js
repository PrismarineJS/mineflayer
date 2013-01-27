var mineflayer = require('../');
var bot = mineflayer.createBot();
bot.on('chat', function(username, message) {
  if (message === 'sleep') {
    var bedBlock = findBed();
    if (bedBlock) {
      bot.chat("counting sheep");
      bot.sleep(bedBlock);
    } else {
      bot.chat("no nearby bed");
    }
  } else if (message === 'wake') {
    bot.wake();
  }
});

bot.on('sleep', function() {
  bot.chat("zzzz");
});

bot.on('wake', function() {
  bot.chat("I woke up");
});

function findBed() {
  var cursor = mineflayer.vec3();
  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if (block.type === 26) return block;
      }
    }
  }
}
