var mineflayer = require('../');
if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node echo.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}
var bot = mineflayer.createBot({
  username: process.argv[4] ? process.argv[4] : "player",
  verbose: true,
  port: parseInt(process.argv[3]),
  host: process.argv[2],
  password: process.argv[5]
});
bot.on('chat', function(username, message) {
  if(username === bot.username) return;
  bot.chat(message);
});
