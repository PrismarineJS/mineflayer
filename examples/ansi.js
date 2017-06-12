/*
 *
 * A simple bot that logs everything that is said to the console.
 *
 */
var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node ansi.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "ansi",
  password: process.argv[5],
  verbose: true
});

bot.on('message', function(message) {
  console.log(message.toAnsi());
});
