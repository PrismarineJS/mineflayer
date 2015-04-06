var Vec3 = require('vec3').Vec3;

module.exports = inject;

function inject(bot) {
  bot._client.on('named_sound_effect', function(packet) {
    var soundName = packet.soundName;
    var pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8);
    var volume = packet.volume;
    var pitch = packet.pitch;

    bot.emit('soundEffectHeard', soundName, pt, volume, pitch);
  });
  // TODO: world_particles sound effects
}
