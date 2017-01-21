var Vec3 = require('vec3').Vec3;

module.exports = inject;

function inject(bot,{version}) {
  const {instruments}=require('minecraft-data')(version);
  bot._client.on('block_action', function(packet) {
    // block action
    var pt = new Vec3(packet.location.x, packet.location.y, packet.location.z);
    var block = bot.blockAt(pt);
    if(packet.blockId === 25) {
      bot.emit('noteHeard', block, instruments[packet.byte1], packet.byte2);
    } else if(packet.blockId === 29 || packet.blockId === 33) {
      bot.emit('pistonMove', block, packet.byte1, packet.byte2);
    } else {
      bot.emit('chestLidMove', block, packet.byte2);
    }
  });

  bot._client.on('block_break_animation', function(packet) {
    var destroyStage = packet.destroyStage;
    var pt = new Vec3(packet.location.x, packet.location.y, packet.location.z);
    var block = bot.blockAt(pt);

    if(destroyStage < 0 || destroyStage > 9) {
      // http://wiki.vg/Protocol#Block_Break_Progress
      // "0-9 to set it, any other value to remove it"
      bot.emit('blockBreakProgressEnd', block);
    } else {
      bot.emit('blockBreakProgressObserved', block, destroyStage);
    }
  });
}
