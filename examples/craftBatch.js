const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: process.argv[2] ? process.argv[2] : 'localhost',
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'Crafter',
  password: process.argv[5]
})

bot.on('spawn', function () {
  const mcData = require('minecraft-data')(bot.version)

  const p = bot.entity.position.floored().offset(0, 2, 3)

  bot.chat(`/setblock ${p.x} ${p.y} ${p.z} minecraft:crafting_table`)

  bot.chat('/time set day')
  bot.chat('Ready!')

  bot.chat('/clear')
  bot.chat(`/give ${bot.username} minecraft:oak_log 64`)

  bot.on('windowOpen', () => {
    console.log('Windows opened')
  })
  bot.on('windowClose', () => {
    console.log('Closed windows')
  })

  console.log('Spawned')
  setTimeout(() => {
    console.log('Start')
    const craftingTableID = mcData.blocksByName.crafting_table.id
    const craftingTable = bot.findBlock({
      matching: craftingTableID,
      maxDistance: 3
    })

    const plankRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id)[0]

    const recipes = [
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      },
      {
        recipe: plankRecipe,
        count: 2
      }
    ]

    bot.craftBatch(recipes, craftingTable)
      .then(() => {
        console.log('Finish to craft')
      })
      .catch((e) => {
        console.log(e)
      })
  }, 3000)
})
