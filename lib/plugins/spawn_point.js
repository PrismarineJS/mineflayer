var Vec3 = require('vec3').Vec3;

module.exports = inject;

function inject(bot) {
  // we share bot.game with other plugins
  bot.game = bot.game || {};

  bot.game.spawnPoint = new Vec3(0, 0, 0);
  bot.client.on(0x06, function(packet) {
    bot.game.spawnPoint.set(packet.x, packet.y, packet.z);
  });
}
