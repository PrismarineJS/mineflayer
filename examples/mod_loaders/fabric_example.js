/**
 * Basic Fabric server connection example
 * Demonstrates how to connect to a Fabric server
 */

const mineflayer = require('../../index.js')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node fabric_example.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

// Create bot with Fabric support
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'FabricBot',
  password: process.argv[5],
  auth: process.argv[5] ? 'microsoft' : 'offline',
  
  // Mod loader configuration
  modLoader: {
    enabled: true,
    strict: false,
    handshakeTimeout: 30000,
    enableCompatibilityChecks: true,
    debugMode: true
  }
})

// Handle connection events
bot.on('connect', () => {
  console.log('Connected to Fabric server')
})

bot.on('login', () => {
  console.log('Logged in successfully')
  console.log(`Server brand: ${bot.game.serverBrand}`)
  console.log(`Mod loader: ${bot.game.modLoader || 'vanilla'}`)
})

// Handle mod loader detection
bot.on('modLoaderDetected', (info) => {
  console.log('\n=== Fabric Detected ===')
  console.log(`Type: ${info.type}`)
  console.log(`Version: ${info.version || 'unknown'}`)
})

// Handle mod loader ready
bot.on('modLoaderReady', (modLoader) => {
  console.log('\n=== Fabric Ready ===')
  
  if (modLoader.getType() === 'fabric') {
    const stats = modLoader.getStats()
    console.log(`Fabric Loader: ${stats.fabricLoaderVersion || 'unknown'}`)
    console.log(`Fabric API: ${stats.fabricApiVersion || 'unknown'}`)
    console.log(`Configuration Phase: ${stats.configurationPhase}`)
    
    // Get Fabric mods (limited information available)
    const fabricMods = modLoader.getFabricMods()
    if (fabricMods.length > 0) {
      console.log('\n=== Fabric Components ===')
      fabricMods.forEach(mod => {
        console.log(`${mod.name}: ${mod.version} (${mod.type})`)
      })
    }
  }
})

// Fabric-specific events
bot.on('fabricVersionSync', (versionInfo) => {
  console.log('\n=== Fabric Version Sync ===')
  console.log(`Fabric Loader: ${versionInfo.fabricLoader}`)
  console.log(`Fabric API: ${versionInfo.fabricApi}`)
  console.log(`Minecraft: ${versionInfo.minecraft}`)
})

bot.on('configurationStarted', () => {
  console.log('Fabric configuration phase started')
})

bot.on('registrySync', (data) => {
  console.log(`Fabric registry sync: ${data.registryName} (${data.mappings.size} entries)`)
})

// Chat commands
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const args = message.split(' ')
  const command = args[0].toLowerCase()
  
  switch (command) {
    case '!fabric':
      if (bot.game.modLoader === 'fabric') {
        if (bot.modLoader) {
          const stats = bot.modLoader.getStats()
          bot.chat(`Fabric Loader: ${stats.fabricLoaderVersion || 'unknown'}, API: ${stats.fabricApiVersion || 'unknown'}`)
        } else {
          bot.chat('Fabric mod loader not available')
        }
      } else {
        bot.chat('This is not a Fabric server')
      }
      break
      
    case '!registries':
      if (bot.modLoader && bot.modLoader.registrySync) {
        const registryCount = bot.modLoader.registrySync.size
        bot.chat(`Fabric registries synced: ${registryCount}`)
      } else {
        bot.chat('No registry information available')
      }
      break
  }
})

bot.once('spawn', () => {
  console.log('\nBot spawned on Fabric server')
  
  // Test Fabric-specific functionality
  if (bot.game.modLoader === 'fabric') {
    console.log('\n=== Testing Fabric Features ===')
    
    // Note: Fabric has limited mod detection compared to Forge
    // Most Fabric servers appear as vanilla to the client
    console.log('Fabric servers may appear as vanilla due to different mod architecture')
  }
})

// Error handling
bot.on('error', (err) => {
  console.error('Bot error:', err.message)
})

bot.on('end', (reason) => {
  console.log(`Bot disconnected: ${reason}`)
  process.exit(0)
})

bot.on('kicked', (reason) => {
  console.log(`Bot kicked: ${reason}`)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('\nShutting down...')
  bot.end()
  process.exit(0)
})

console.log('Connecting to Fabric server...')
console.log('Note: Fabric detection may be limited compared to Forge')
console.log('Use chat commands: !fabric, !registries')