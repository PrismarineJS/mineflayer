var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "jumper",
});
bot.once('spawn', function() {
  // so creepy
  setInterval(watch, 50);
});
var target = null;
function watch() {
  if (! target) return;
  bot.lookAt(target.position.offset(0, target.height, 0));
}
bot.on('chat', function(username, message) {
  target = bot.players[username].entity;
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
