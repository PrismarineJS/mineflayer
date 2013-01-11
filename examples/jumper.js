var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "jumper",
});
bot.on('chat', function(username, message) {
  if (message === 'jump') {
    bot.setControlState('jump', true);
    bot.setControlState('jump', false);
  }
});
