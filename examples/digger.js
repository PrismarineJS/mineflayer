var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "digger",
});

bot.on('chat', function(username, message) {
  if (message === 'dig') {
    if (bot.targetDigBlock) {
      bot.chat("already digging " + bot.targetDigBlock.name);
    } else {
      var target = bot.blockAt(bot.entity.position.offset(0, -1,  0));
      if (target && bot.canDigBlock(target)) {
        bot.chat("starting to dig " + target.name);
        bot.startDigging(target);
      } else {
        bot.chat("cannot dig");
      }
    }
  }
});
bot.on('diggingCompleted', function(oldBlock) {
  bot.chat("finished digging " + oldBlock.name);
});
bot.on('diggingFailure', function(block) {
  bot.chat("unable to dig the " + block.name);
});
