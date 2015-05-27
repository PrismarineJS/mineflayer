var mineflayer = require('../');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node graffiti.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "graffiti",
  password: process.argv[5],
  verbose: true,
});

bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  var signBlock = nearestBlock('signText');
  var paintingBlock = nearestBlock('painting');
  if(signBlock) {
    if(message === "read") {
      bot.chat("sign says " + signBlock.signText);
      console.log(JSON.stringify(signBlock.signText));
    } else if(message === "") {
      bot.updateSign(signBlock, message);
    }
  } else if(paintingBlock) {
    console.log("painting", paintingBlock.painting);
    bot.chat("painting " + paintingBlock.painting.name);
  } else {
    bot.chat("can't find sign or painting");
  }
});

function nearestBlock(prop) {
  var cursor = mineflayer.vec3();
  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if(block[prop]) return block;
      }
    }
  }
}
