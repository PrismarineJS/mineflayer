module.exports = inject

// ClientboundPlayerAbilitiesPacket's flag bits.
const FLAG_INVULNERABLE = 1
const FLAG_FLYING = 2
const FLAG_MAY_FLY = 4
const FLAG_INSTANT_BUILD = 8

function inject (bot) {
  // Abilities' defaults, until the server says otherwise.
  bot.abilities = {
    invulnerable: false,
    flying: false,
    mayFly: false,
    instantBuild: false,
    flyingSpeed: 0.05,
    walkingSpeed: 0.1
  }

  bot._client.on('abilities', (packet) => {
    bot.abilities = {
      invulnerable: (packet.flags & FLAG_INVULNERABLE) !== 0,
      flying: (packet.flags & FLAG_FLYING) !== 0,
      mayFly: (packet.flags & FLAG_MAY_FLY) !== 0,
      instantBuild: (packet.flags & FLAG_INSTANT_BUILD) !== 0,
      flyingSpeed: packet.flyingSpeed,
      walkingSpeed: packet.walkingSpeed
    }
    // prismarine-physics reads the flight state off the entity.
    if (bot.entity) {
      bot.entity.flying = bot.abilities.flying
      bot.entity.flyingSpeed = bot.abilities.flyingSpeed
    }
    bot.emit('abilities', bot.abilities)
  })
}
