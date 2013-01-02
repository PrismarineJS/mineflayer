var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "player",
  // either put email and password here,
  // or test this against a server with
  // online-mode set to false.
});
bot.on('chat', function(username, message) {
  bot.chat(message);
});
