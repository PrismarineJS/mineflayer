/*
 * An example on how to set and read command blocks
 */

var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node command_block.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "command_block",
  password: process.argv[5],
  verbose: true
});

bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  var command = message.split(' ');
  switch(true) {
    case /^setCommandBlock (.+)$/.test(message):
      var commandBlock = bot.findBlock({
        matching: 137
      });
      bot.setCommandBlock(commandBlock.position,command[1],false);
      break;
  }
});