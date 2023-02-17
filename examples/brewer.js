/*
 * simple example for using the built-in brewing stand methods
 * give the bot 3 water bottles, nether wart, a ghast tear, and blaze powder for fuel
 * place a brewing stand near the bot, then type 'open' in chat to have the bot open the brewing stand
 * type 'brew' in chat, then the bot will brew a potion of regeneration
 * type 'info' at any time, and the bot will log info about the brewing stand to the console
 *
 * made by Jovan04 2/15/2023
 */

const mineflayer = require('mineflayer')
const { once } = require('events')
let stand

if (process.argv.length < 6 || process.argv.length > 8) {
  console.log('Usage : node brewer.js <host> <port> [<username>] [<auth>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] || 'brewer',
  auth: process.argv[5] || 'offline'
})

bot.once('spawn', () => {
  console.log(`bot joined the game with username ${bot.username}`)
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return

  if (message === 'open') {
    const standBlock = bot.findBlock({
      maxDistance: 6,
      matching: bot.registry.blocksByName.brewing_stand.id
    })

    if (!standBlock) {
      console.log("I couldn't find a brewing stand block near me!")
      return
    }

    stand = await bot.openBrewingStand(standBlock)
  }

  if (message === 'info') {
    if (!stand) {
      console.log("I don't have a brewing stand open!")
      return
    }

    console.log(`fuel: ${stand.fuel}; progress: ${stand.progress}; seconds: ${stand.progressSeconds}.`)
    if (bot.registry.isNewerOrEqualTo('1.9')) { // before 1.9, blaze powder wasn't needed for brewing
      console.log('fuelItem:')
      console.log(stand.fuelItem())
    }
    console.log('ingredient:')
    console.log(stand.ingredientItem())
    console.log('potions:')
    console.log(stand.potions())
  }

  if (message === 'brew') {
    if (!stand) {
      console.log("I don't have a brewing stand open!")
      return
    }

    await stand.putPotion(0, bot.registry.itemsByName.potion.id, null, 1)
    await stand.putPotion(1, bot.registry.itemsByName.potion.id, null, 1)
    await stand.putPotion(2, bot.registry.itemsByName.potion.id, null, 1)
    if (bot.registry.isNewerOrEqualTo('1.9')) { // before 1.9, blaze powder wasn't needed for brewing
      await stand.putFuel(bot.registry.itemsByName.blaze_powder.id, null, 1)
    }
    await stand.putIngredient(bot.registry.itemsByName.nether_wart.id, null, 1)
    await once(stand, 'brewingStopped')
    await stand.putIngredient(bot.registry.itemsByName.ghast_tear.id, null, 1)
    await once(stand, 'brewingStopped')
    await stand.takePotions()
  }
})
