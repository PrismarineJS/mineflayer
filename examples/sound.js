const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node sound.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'sound_bot',
  password: process.argv[5]
})

// Listen for any sound effect
bot.on('soundEffectHeard', (soundId, soundCategory, x, y, z, volume, pitch) => {
  console.log(`Heard sound: ${soundId} at ${x}, ${y}, ${z}`)
})

// Listen for note block sounds
bot.on('noteHeard', (block, instrument, pitch) => {
  console.log(`Heard note block: ${instrument.name} at pitch ${pitch}`)
})

// Listen for hardcoded sound effects (like mob sounds)
bot.on('hardcodedSoundEffectHeard', (soundId, soundCategory, x, y, z, volume, pitch) => {
  console.log(`Heard hardcoded sound: ${soundId} (${soundCategory}) at ${x}, ${y}, ${z}`)
})

bot.on('spawn', () => {
  console.log('Bot spawned!')
})
