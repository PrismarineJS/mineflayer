var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "jumper",
});
bot.on('chat', function(username, message) {
  if (message === 'jump') {
    bot.setControlState('jump', true);
    bot.setControlState('jump', false);
  } else if (message === 'forward') {
    bot.setControlState('forward', true);
  } else if (message === 'back') {
    bot.setControlState('back', true);
  } else if (message === 'left') {
    bot.setControlState('left', true);
  } else if (message === 'right') {
    bot.setControlState('right', true);
  } else if (message === 'stop') {
    bot.clearControlStates();
  }
});
