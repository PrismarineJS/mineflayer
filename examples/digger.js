var mineflayer = require('../');
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({
  username: "digger",
});

bot.on('chat', function(username, message) {
  if (message === 'dig') {
    dig();
  } else if (message === 'build') {
    build();
  } else if (message === 'dirt') {
    bot.equip(0x03, 'hand');
  }
});

function dig() {
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

function build() {
  bot.setControlState('jump', true);
  var targetBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1;
  bot.on('move', placeIfHighEnough);
  
  function placeIfHighEnough() {
    if (bot.entity.position.y > jumpY) {
      bot.placeBlock(targetBlock, vec3(0, 1, 0));
      bot.setControlState('jump', false);
      bot.removeListener('move', placeIfHighEnough);
    }
  }
}
bot.on('diggingCompleted', function(oldBlock) {
  bot.chat("finished digging " + oldBlock.name);
});
bot.on('diggingFailure', function(block) {
  bot.chat("unable to dig the " + block.name);
});
