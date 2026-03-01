/*
 *
 * Update Proxy Minecraft Protocol Example for MineFlayer Proxy Example
 *
 */
const mineflayer = require('mineflayer')
const socks = require('socks').SocksClient
const ProxyAgent = require('proxy-agent')

if (process.argv.length < 7 || process.argv.length > 8) {
  console.log("Type: node proxy.js mhost mport phost pport username password/if")
  process.exit(1)
}

const bot = mc.createBot({
  connect: client => {
    socks.createConnection({
      proxy: {
        host: process.argv[4],
        port: process.argv[5],
        type: 5
      },
      command: 'connect',
      destination: {
        host: process.argv[2],
        port: process.argv[3]
      }
    }, (err, info) => {
      if (err) {
        console.log(err)
        return
      }

      client.setSocket(info.socket)
      client.emit('connect')
    })
  },
  agent: new ProxyAgent({ protocol: 'socks5', host: proxyHost, port: proxyPort }),
  username: process.argv[6],
  version: "1.12.2",
  password: process.argv[7]
})

bot.on('message', (message) => {
  console.log(message.toAnsi())
})
