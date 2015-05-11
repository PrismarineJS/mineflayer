var mineflayer = require('../');
if(process.argv.length<4 || process.argv.length>6)
{
    console.log("Usage : node sleeper.js <host> <port> [<name>] [<password>]");
    process.exit(1);
}
var bot = mineflayer.createBot({
    username: process.argv[4] ? process.argv[4] : "sleeper",
    verbose: true,
    port:parseInt(process.argv[3]),
    host:process.argv[2],
    password:process.argv[5]
});
bot.on('chat', function(username, message) {
  if (message === 'sleep') {
    var bedBlock = findBed();
    if (bedBlock) {
      bot.sleep(bedBlock,function(err){
        if(err)
        {
          console.log(err);
          bot.chat("I can't sleep");
        }
        else
          bot.chat("counting sheep");
      });
    } else {
      bot.chat("no nearby bed");
    }
  } else if (message === 'wake') {
    bot.wake(function(err){
      if(err)
      {
        console.log(err);
        bot.chat("I can't wake up");
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
