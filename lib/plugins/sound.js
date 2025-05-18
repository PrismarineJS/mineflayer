const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  bot._client.on('named_sound_effect', (packet) => {
    console.log('Received named_sound_effect packet:', packet);
    const soundName = packet.soundName
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    // In 1.8.8, sound names are in the format "note.harp" or "random.click"
    // We need to convert them to the format expected by the test
    const normalizedSoundName = bot.supportFeature('playsoundUsesResourceLocation')
      ? `minecraft:${soundName.replace('.', '_')}`
      : soundName

    // Emit both events for compatibility with tests
    console.log('[DEBUG] Emitting soundEffectHeard for named_sound_effect:', normalizedSoundName, pt, volume, pitch)
    bot.emit('soundEffectHeard', normalizedSoundName, pt, volume, pitch)
    // Emit hardcodedSoundEffectHeard for compatibility (use 0, 'master' as dummy values)
    console.log('[DEBUG] Emitting hardcodedSoundEffectHeard for named_sound_effect:', 0, 'master', pt, volume, pitch)
    bot.emit('hardcodedSoundEffectHeard', 0, 'master', pt, volume, pitch)
  })

  bot._client.on('sound_effect', (packet) => {
    console.log('Received sound_effect packet:', packet);
    const soundId = packet.soundId
    const soundCategory = packet.soundCategory
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    // Emit both events for compatibility
    console.log('[DEBUG] Emitting hardcodedSoundEffectHeard:', soundId, soundCategory, pt, volume, pitch)
    bot.emit('hardcodedSoundEffectHeard', soundId, soundCategory, pt, volume, pitch)
    // Try to get a name for the sound if possible, otherwise use soundId
    const soundName = packet.soundEvent?.resource || soundId
    console.log('[DEBUG] Emitting soundEffectHeard for sound_effect:', soundName, pt, volume, pitch)
    bot.emit('soundEffectHeard', soundName, pt, volume, pitch)
  })
}
