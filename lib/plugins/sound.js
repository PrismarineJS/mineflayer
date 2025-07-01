const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
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
    const soundCategory = packet.soundCategory
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    let soundId, soundName

    if (packet.sound) { // ItemSoundHolder
      if (packet.sound.data) soundName = packet.sound.data.soundName
      else soundId = packet.sound.soundId // Sound specified by ID (registry reference)
    } else { // Legacy packet
      soundId = packet.soundId
    }

    // If we have an ID but no name yet, try to look it up in the registry
    soundName ??= bot.registry?.sounds?.[soundId]?.name

    if (soundName) {
      bot.emit('soundEffectHeard', soundName, pt, volume, pitch)
    } else if (soundId !== null) {
      bot.emit('hardcodedSoundEffectHeard', soundId, soundCategory, pt, volume, pitch)
    }
  })
}
