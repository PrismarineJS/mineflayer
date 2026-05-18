/*
 * This example demonstrates connecting to a Velocity proxy server
 * and handling server transfers (1.20.2+)
 *
  * The velocity plugin is loaded by default and will automatically:
 * - Handle the configuration phase during transfers
 * - Accept resource packs during configuration
 * - Block physics packets while in configuration phase
 * - Re-enable physics after configuration completes
 *
 * To disable the velocity plugin, add to createBot options:
 *   plugins: { velocity: false }
 *
 * Note: The plugin is harmless even if loaded - it only activates
 * during configuration phase (Velocity transfers, not normal gameplay)
 *
 * This fixes the issue: https://github.com/PrismarineJS/mineflayer/issues/3764
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node velocity_transfer.js <host> <port> [<name>] [online?]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'velocity_bot',
  auth: process.argv[5] ? 'microsoft' : 'offline'
  // The velocity plugin is enabled by default
  // To disable it, uncomment the following line:
  // plugins: { velocity: false }
})

bot.on('login', () => {
  console.log('Logged in to Velocity proxy')
})

bot.on('spawn', () => {
  console.log('Spawned in server:', bot.game.dimension)
})

// Track configuration phase events
bot.on('configurationPhase', (phase) => {
  if (phase === 'start') {
    console.log('Entering configuration phase (server transfer starting...)')
  } else if (phase === 'end') {
    console.log('Exiting configuration phase (server transfer complete)')
  }
})

// Optional: Track resource pack acceptance
bot.on('resourcePack', (url, uuid) => {
  console.log('Resource pack received:', url)
  console.log('Note: Resource packs are automatically accepted during configuration phase')
})

bot.on('end', (reason) => {
  console.log('Bot disconnected:', reason)
})

bot.on('error', (err) => {
  console.error('Error:', err.message)
})

bot.on('kicked', (reason) => {
  console.log('Kicked:', reason)
})
