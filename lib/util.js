const red = '\x1b[31m'
const startUnderline = '\x1b[4m'
const white = '\x1b[37m'
const endUnderline = '\x1b[0m'

let spawned = false

function sendCalledTooEarly (bot, obj, propertyName) {
  if (spawned) {
    bot[propertyName] = obj
    return
  }
  console.error(`${red}[${white}${startUnderline}WARNING${endUnderline}${red}] ${white}You are looking for {bot}.${propertyName} too early, bot hasn't spawned yet.\nSee: https://github.com/PrismarineJS/mineflayer/blob/add-warnings/docs/FAQ.md#warning-you-are-looking-for-bot-too-early-bot-hasnt-spawned-yet`)
}

function makeProxyFrom (bot, obj, propertyName) {
  bot[propertyName] = new Proxy(obj, {
    get (target, prop, receiver) {
      sendCalledTooEarly(bot, obj, propertyName)
      return target[prop]
    }
  })
}

module.exports = {
  makeProxyFrom,
  botSpawned: () => { spawned = true }
}
