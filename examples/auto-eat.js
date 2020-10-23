const mineflayer = require('mineflayer')
const autoeat = require('mineflayer-auto-eat')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3],
  username: process.argv[4],
  password: process.argv[5]
})

bot.loadPlugin(autoeat) // Load the plugin

bot.autoEat = {
  priority: 'foodPoints', // What the bot should prioritize (options: "foodPoints" or "saturation").
  startAt: 14, // If the bot reaches this amount of food points the auto eat plugin will start eating.
  bannedFood: ['golden_apple', 'enchanted_golden_apple'] // Food which the bot should not eat.
}

// The bot eats food automatically and emits these events when it starts eating and stops eating.

bot.on('autoeat_started', () => {
  console.log('Auto Eat started!')
})

bot.on('autoeat_stopped', () => {
  console.log('Auto Eat stopped!')
})
