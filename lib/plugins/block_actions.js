var instruments = require('../enums/instruments')
  , Vec3 = require('vec3').Vec3

module.exports = inject;

function inject(bot) {
  bot.client.on(0x36, function(packet) {
    // block action
    var pt = new Vec3(packet.x, packet.y, packet.z);
    var block = bot.blockAt(pt);
    if (packet.blockId === 25) {
      bot.emit('noteHeard', block, instruments[packet.byte1], packet.byte2);
    } else if (packet.blockId === 29 || packet.blockId === 33) {
      bot.emit('pistonMove', block, packet.byte1, packet.byte2);
    } else {
      bot.emit('chestLidMove', block, packet.byte2);
    }
  });
}
