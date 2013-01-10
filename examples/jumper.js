var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "jumper",
});
bot.on('chat', function(username, message) {
  bot.setControlState('jump', true);
  bot.setControlState('jump', false);
});
