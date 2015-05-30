/*
 * What's better than a bot that knows how to read and understands art?
 *
 * Learn how easy it is to interact with signs and paintings in this example.
 *
 * You can send commands to this bot using chat messages, the bot will
 * reply by telling you the name of the nearest painting or the text written on
 * the nearest sign, and you can also update signs with custom messages!
 *
 * To update a sign simply send a message in this format: write [your message]
 */
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
  switch(true) {
    case /^watch/.test(message):
      watchPaintingOrSign();
      break;
    case /^write /.test(message):
      updateSign(message);
      break;
  }
});

function watchPaintingOrSign() {
  var paintingBlock = nearestBlock('painting');
  var signBlock = nearestBlock('signText');
  if (signBlock) {
    bot.chat('The sign says: ' + signBlock.signText);
  } else if (paintingBlock) {
    bot.chat('The painting is: ' + paintingBlock.painting.name);
  } else {
    bot.chat('There are no signs or paintings near me');
  }
}

function updateSign(message) {
  var signBlock = nearestBlock('signText');
  if (signBlock) {
    bot.updateSign(signBlock, message.split(' ').slice(1).join(' '));
    bot.chat('Sign updated');
  } else {
    bot.chat('There are no signs near me');
  }
}

function nearestBlock(prop) {
  var center = bot.entity.position;
  var cursor = mineflayer.vec3();
  for(cursor.x = center.x - 4; cursor.x < center.x + 4; cursor.x++) {
    for(cursor.y = center.y - 4; cursor.y < center.y + 4; cursor.y++) {
      for(cursor.z = center.z - 4; cursor.z < center.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if(block[prop]) return block;
      }
    }
  }
}
