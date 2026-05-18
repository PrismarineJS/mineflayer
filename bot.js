const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({ 
  host: 'TheBestStrengthSMP.play.hosting', 
  username: 'AFKBot', 
  auth: 'offline', 
  version: '1.20.6'
}); // <-- Make sure this line has the closing };

bot.on('spawn', () => {
  console.log('Bot has spawned! Anti-AFK routines activated.')
  
  // 1. Send the chat message immediately, then every 30 minutes
  bot.chat('im afk trust')
  setInterval(() => {
    bot.chat('im afk trust')
  }, 1800000) // 30 minutes

  // 2. Jump and spin in a circle every 2 minutes
  setInterval(() => {
    console.log('Performing jump and circle routine...')
    
    // Make the bot jump
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 500)

    // Make the bot look around in a full circle over 1 second
    let angle = 0
    const spinInterval = setInterval(() => {
      angle += 0.4 // Adjust step size for rotation speed
      
      // bot.look takes (yaw, pitch). Pitch 0 looks straight ahead.
      bot.look(angle, 0)

      if (angle >= Math.PI * 2) {
        clearInterval(spinInterval) // Stop spinning once a full circle is done
      }
    }, 50) // Updates every 50ms for a smooth visual spin

  }, 120000) // 2 minutes
})

// Keep connection open and catch logouts/crashes
bot.on('chat', (username, message) => {
  if (username === bot.username) return
})

bot.on('kicked', console.log)
bot.on('error', console.log)
