/*
* This example is for people with multiple (mojang) minecraft accounts,
* in a file in the format "username:password" on each line,
* change the file property of config to set your .txt file location
*/

const fs = require('fs')
const util = require('util')
const mineflayer = require('mineflayer')
const readFile = (fileName) => util.promisify(fs.readFile)(fileName, 'utf8')

const config = {
  host: 'localhost',
  port: 25565,
  file: './accounts.txt',
  interval: 500 // cooldown between joining server too prevent joining too quickly
}

function makeBot ([_u, _p], ix) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bot = mineflayer.createBot({
        username: _u,
        password: _p,
        host: config.host,
        port: config.port
      })
      bot.on('spawn', () => resolve(bot))
      bot.on('error', (err) => reject(err))
      setTimeout(() => reject(Error('Took too long to spawn.')), 5000) // 5 sec
    }, config.interval * ix)
  })
}

async function main () {
  // convert accounts.txt => array
  const file = await readFile(config.file)
  const accounts = file.split(/\r?\n/).map(login => login.split(':'))
  const botProms = accounts.map(makeBot)
  // const bots = await Promise.allSettled(botProms)
  const bots = (await Promise.allSettled(botProms)).map(({ value, reason }) => value || reason).filter(value => !(value instanceof Error))
  console.log(`Bots (${bots.length} / ${accounts.length}) successfully logged in.`)
}

main()
