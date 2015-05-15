var mineflayer = require('../');
if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node quitter.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}
var bot = mineflayer.createBot({
  username: process.argv[4] ? process.argv[4] : "emobot",
  verbose: true,
  port: parseInt(process.argv[3]),
  host: process.argv[2],
  password: process.argv[5]
});
bot.once('spawn', function() {
  bot.chat('Goodbye, cruel world!');
  bot.quit();
});