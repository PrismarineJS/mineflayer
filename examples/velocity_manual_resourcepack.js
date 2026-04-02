/*
 * This example shows how to disable the velocity plugin
 * and manually handle resource packs during Velocity transfers
 *
 * Use this if you want full control over resource pack acceptance
 * instead of the automatic behavior.
 *
 * WARNING: Disabling the velocity plugin will cause bot disconnections
 * during Velocity server transfers unless you handle the configuration
 * phase manually (advanced users only).
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node velocity_manual_resourcepack.js <host> <port> [<name>] [online?]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'manual_bot',
  auth: process.argv[5] ? 'microsoft' : 'offline',
  // Disable the velocity plugin
  plugins: {
    velocity: false
  }
})

bot.on('login', () => {
  console.log('Logged in (velocity plugin disabled)')
})

bot.on('spawn', () => {
  console.log('Spawned in server:', bot.game.dimension)
})

// Manually accept resource packs
bot.on('resourcePack', (url, uuid) => {
  console.log('Resource pack received:', url)
  console.log('Accepting manually...')
  bot.acceptResourcePack()
})

bot.on('end', (reason) => {
  console.log('Bot disconnected:', reason)
})

bot.on('error', (err) => {
  console.error('Error:', err.message)
})

bot.on('kicked', (reason) => {
  console.log('Kicked:', reason)
  console.log('Note: If kicked during transfer, you may need to enable the velocity plugin')
})