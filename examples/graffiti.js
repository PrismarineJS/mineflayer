var mineflayer = require('../');
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({
  username: "graffiti",
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  var sign = nearestSign();
  if (! sign) {
    bot.chat("can't find sign");
    return;
  }
  if (message === "read") {
    bot.chat("sign says " + sign.signText);
    console.log(JSON.stringify(sign.signText));
  } else {
    bot.updateSign(sign, message);
  }
});

function nearestSign() {
  var cursor = vec3();
  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
        var block = bot.blockAt(cursor);
        if (block.signText) return block;
      }
    }
  }
}
