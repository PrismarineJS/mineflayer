const mineflayer = require('../../index.js')

// Microsoft authentication example for Forge servers
// Requires: npm install mineflayer prismarine-auth

async function createForgeBot() {
  const bot = mineflayer.createBot({
    host: 'localhost', // Replace with your Forge server
    port: 25565,
    username: 'your-email@example.com', // Microsoft account email
    auth: 'microsoft', // Use Microsoft authentication
    version: '1.20.1', // Match your Forge server version
    
    // Forge-specific options
    brand: 'forge', // Helps with mod detection
    
    // Optional: Handle authentication flow
    authTitle: '127.0.0.1', // Device code auth title
    deviceCodeCallback: (userCode) => {
      console.log(`[AUTH] Please visit https://microsoft.com/link and enter code: ${userCode}`)
    },
    
    // Optional: Persist authentication tokens
    profilesFolder: './minecraft_profiles', // Cache auth tokens
  })

  // Handle successful login
  bot.once('spawn', () => {
    console.log('[BOT] Successfully connected to Forge server!')
    
    // Check server brand to confirm Forge
    if (bot.game.serverBrand) {
      console.log(`[SERVER] Brand: ${bot.game.serverBrand}`)
    }
    
    // Display server information
    console.log(`[SERVER] Version: ${bot.version}`)
    console.log(`[SERVER] Game mode: ${bot.game.gameMode}`)
    console.log(`[SERVER] Difficulty: ${bot.game.difficulty}`)
    
    // Check if server has custom channels (common with Forge mods)
    if (bot._client.channels) {
      console.log('[MODS] Detected custom channels:')
      Object.keys(bot._client.channels).forEach(channel => {
        console.log(`  - ${channel}`)
      })
    }
  })

  // Handle chat messages
  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    console.log(`[CHAT] ${username}: ${message}`)
    
    // Simple command handling
    if (message === 'info') {
      bot.chat(`Running on ${bot.game.serverBrand || 'Unknown'} server`)
    }
  })

  // Handle custom payload packets (common with Forge mods)
  bot._client.on('custom_payload', (packet) => {
    console.log(`[MOD] Received custom payload on channel: ${packet.channel}`)
    
    // Example: Handle Forge handshake
    if (packet.channel === 'forge:handshake') {
      console.log('[FORGE] Handshake packet received')
    }
  })

  // Handle kicks/disconnects
  bot.on('kicked', (reason) => {
    console.log('[BOT] Kicked:', reason)
    if (reason.includes('mod')) {
      console.log('[INFO] Server may require specific mods to join')
    }
  })

  bot.on('error', (err) => {
    console.error('[ERROR]', err)
  })

  bot.on('end', (reason) => {
    console.log('[BOT] Disconnected:', reason)
  })

  // Handle authentication errors
  bot.on('login', () => {
    console.log('[AUTH] Successfully authenticated with Microsoft')
  })
}

// Run the bot
createForgeBot().catch(err => {
  console.error('[STARTUP ERROR]', err)
  if (err.message.includes('auth')) {
    console.log('\n[TIP] Make sure you have:')
    console.log('  1. Installed prismarine-auth: npm install prismarine-auth')
    console.log('  2. Have a valid Microsoft account')
    console.log('  3. Own Minecraft Java Edition')
  }
})