var mineflayer = require('../');
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({ username: "player", });
bot.on('health', function() {
  bot.chat("I have " + bot.health + " and " + bot.food + " food");
});
bot.on('login', function() {
  console.log("I'm in.", bot.game);
});
bot.on('rain', function() {
  if (bot.isRaining) {
    bot.chat("it started raining");
  } else {
    bot.chat("it stopped raining.");
  }
});
bot.on('chat', function(username, message) {
  if (message === 'pos') {
    bot.chat("I am at " + bot.entity.position + ", you are at " + bot.game.players[username].entity.position);
  } else if (message === 'spawn') {
    bot.chat("spawn is at " + bot.game.spawnPoint);
  }
});
