const mineflayer = require('mineflayer')

const username = 'Bot'
const server = 'localhost'

const options = {
  version: 'bedrock',
  host: server,
  port: 19132,
  offline: true,
  username
}

const bot = mineflayer.createBot(options)

bot.on('message', (message, type, sender, verified) => {
  if (sender === bot._client.username) return
  console.log([message, type, sender, verified])
  bot.chat(message.getText(0))
})
