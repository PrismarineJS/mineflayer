var mineflayer = require('../');
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({ username: "player", });
bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
});
bot.on('login', function() {
  console.log("I logged in.");
  console.log("settings", bot.settings);
});
bot.on('playerJoined', function(player) {
  bot.chat("hello, " + player.username + "! welcome to the server.");
});
bot.on('playerLeft', function(player) {
  console.log("bye " + player.username);
});
bot.on('rain', function() {
  if (bot.isRaining) {
    bot.chat("it started raining");
  } else {
    bot.chat("it stopped raining.");
  }
});
bot.on('kicked', function(reason) {
  console.log("I got kicked for", reason, "lol");
});
bot.on('spawn', function() {
  bot.chat("I have spawned");
  console.log("game", bot.game);
});
bot.on('death', function() {
  bot.chat("I died x.x");
});
bot.on('chat', function(username, message) {
  if (message === 'pos') {
    bot.chat("I am at " + bot.entity.position + ", you are at " + bot.game.players[username].entity.position);
  } else if (message === 'spawn') {
    bot.chat("spawn is at " + bot.game.spawnPoint);
  } else if (message === 'quit') {
    bot.quit(username + "told me to");
  } else if (message === 'set') {
    bot.setSettings({viewDistance: 'normal'});
  }
});
