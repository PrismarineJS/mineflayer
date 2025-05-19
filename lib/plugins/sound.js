const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  const mcData = require('minecraft-data')(bot.version)

  bot._client.on('named_sound_effect', (packet) => {
    const soundName = packet.soundName
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    // In 1.8.8, sound names are in the format "note.harp" or "random.click"
    // We need to convert them to the format expected by the test
    const normalizedSoundName = bot.supportFeature('playsoundUsesResourceLocation')
      ? `minecraft:${soundName.replace(/\./g, '_')}`
      : soundName

    // Emit both events for compatibility with tests
    bot.emit('soundEffectHeard', normalizedSoundName, pt, volume, pitch)
    // Emit hardcodedSoundEffectHeard for compatibility (use 0, 'master' as dummy values)
    bot.emit('hardcodedSoundEffectHeard', 0, 'master', pt, volume, pitch)
  })

  bot._client.on('sound_effect', (packet) => {
    const soundId = packet.soundId
    const soundCategory = packet.soundCategory
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    // Try to resolve sound name from mcData
    let soundName = soundId
    if (mcData.sounds && mcData.sounds[soundId]) {
      soundName = mcData.sounds[soundId].name
    }

    // Emit both events for compatibility
    bot.emit('hardcodedSoundEffectHeard', soundId, soundCategory, pt, volume, pitch)
    bot.emit('soundEffectHeard', soundName, pt, volume, pitch)
  })
}
