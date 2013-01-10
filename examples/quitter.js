var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "emobot",
});

bot.once('spawn', function() {
    bot.chat('Goodbye, cruel world!');
    bot.quit();
});