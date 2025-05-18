const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  bot._client.on('named_sound_effect', (packet) => {
    console.log('Received named_sound_effect packet:', packet);
    const soundName = packet.soundName
    const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
    const volume = packet.volume
    const pitch = packet.pitch

    console.log('[DEBUG] Emitting soundEffectHeard for named_sound_effect:', soundName, pt, volume, pitch)
    bot.emit('soundEffectHeard', soundName, pt, volume, pitch)
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

  // Handle old sound packets (pre-1.9)
  if (bot.supportFeature('usesOldSoundPacket')) {
    bot._client.on('sound_effect_old', (packet) => {
      console.log('Received sound_effect_old packet:', packet);
      const soundId = packet.soundId
      const pt = new Vec3(packet.x / 8, packet.y / 8, packet.z / 8)
      const volume = packet.volume
      const pitch = packet.pitch

      // Emit both events for compatibility
      console.log('[DEBUG] Emitting hardcodedSoundEffectHeard for old packet:', soundId, 0, pt, volume, pitch)
      bot.emit('hardcodedSoundEffectHeard', soundId, 0, pt, volume, pitch)
      console.log('[DEBUG] Emitting soundEffectHeard for old packet:', soundId, pt, volume, pitch)
      bot.emit('soundEffectHeard', soundId, pt, volume, pitch)
    })
  }
}
