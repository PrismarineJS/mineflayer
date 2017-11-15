const Vec3 = require('vec3').Vec3

module.exports = inject

function inject (bot) {
  bot._client.on('named_sound_effect', (packet) => {
    const soundName = packet.soundName
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    bot.emit('soundEffectHeard', soundName, pt, volume, pitch)
  })

  bot._client.on('sound_effect', (packet) => {
    const soundId = packet.soundId
    const soundCategory = packet.soundCategory
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    bot.emit('hardcodedSoundEffectHeard', soundId, soundCategory, pt, volume, pitch)
  })
}
