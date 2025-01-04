const mineflayer = require('mineflayer')

const username = 'Bot'
const server = 'localhost'

options = {
    version: 'bedrock_1.21.50',
    host: server,
    skipPing: true,
    viewDistance: 5,
    autoInitPlayer: true,
    port: 19132,
    offline: true,
    username: username
}

const bot = mineflayer.createBot(options)

bot.on('message', (message, type, sender, verified) => {
    if (sender === bot._client.username) return
    console.log([message, type, sender, verified])
    bot.chat(message.getText(0))
})