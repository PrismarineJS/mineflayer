/*
 * This is one of the simplest examples.
 *
 * We created a simple bot that echoes back everything that is said on chat.
 *
 * It's not very useful yet, but you can use this as a starting point
 * to create your own bot.
 */
var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node echo.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "echo",
  password: process.argv[5],
  verbose: true,
});

bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  bot.chat(message);
});
