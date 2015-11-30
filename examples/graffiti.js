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
var mineflayer = require('mineflayer');

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
    case /^watch$/.test(message):
      watchPaintingOrSign();
      break;
    case /^write .+$/.test(message):
      // write message
      // ex: write I love diamonds
      updateSign(message);
      break;
  }
});

function watchPaintingOrSign() {
  var paintingBlock = bot.findBlock({
    matching: function(block) {
      return !!block.painting;
    }
  });
  var signBlock = bot.findBlock({
    matching: [63, 68]
  });
  if(signBlock) {
    bot.chat('The sign says: ' + signBlock.signText);
  } else if(paintingBlock) {
    bot.chat('The painting is: ' + paintingBlock.painting.name);
  } else {
    bot.chat('There are no signs or paintings near me');
  }
}

function updateSign(message) {
  var signBlock = bot.findBlock({
    matching: [63, 68]
  });
  if(signBlock) {
    bot.updateSign(signBlock, message.split(' ').slice(1).join(' '));
    bot.chat('Sign updated');
  } else {
    bot.chat('There are no signs near me');
  }
}
