// This example shows how to tell the bot to place an end crystal
// Example commands:
// "place crystal near bot" - find a block near the bot that has a block empty above it, then place a crystal on it
// "place crystal near ExplodeMe" - find a block near the player with username "ExplodeMe" that has an empty block above it, then place a crystal on it

const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')
const AABB = require('prismarine-physics/lib/aabb')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node ansi.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}
const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'crystal_bot',
  password: process.argv[5],
  plugins: [pathfinder.pathfinder]
})

const MAX_DIST_FROM_BLOCK_TO_PLACE = 4

let mcData = null
bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.on('chat', async (ign, msg) => {
  if (!mcData) mcData = require('minecraft-data')(bot.version)

  // solve where the bot will place the crystal near
  let findBlocksNearPoint = null
  if (msg === 'place crystal near bot') {
    findBlocksNearPoint = bot.entity.position
  } else if (msg.startsWith('place crystal near ')) {
    const playerUsername = msg.split(' ').pop()
    const player = bot.players[playerUsername]
    if (!player) return bot.chat(`Couldn't find player with the username: "${playerUsername}"`)
    findBlocksNearPoint = player.entity.position
  } else {
    return // don't do anything
  }

  // find end crystal(s) in inventory
  const item = bot.inventory.findInventoryItem(mcData.itemsByName.end_crystal.id)
  if (!item) bot.chat("I don't have any ender crystals")

  // find the crystal
  const block = bot.findBlock({
    point: findBlocksNearPoint,
    matching: ['bedrock', 'obsidian'].map(blockName => mcData.blocksByName[blockName].id),
    useExtraInfo: block => {
      const hasAirAbove = bot.blockAt(block.position.offset(0, 1, 0)).name === 'air'
      const botNotStandingOnBlock = block.position.xzDistanceTo(bot.entity.position) > 2
      // do no intersecting entity check
      const { x: aboveX, y: aboveY, z: aboveZ } = block.position.offset(0, 1, 0)
      const blockBoundingBox = new AABB(aboveX, aboveY, aboveZ, aboveX + 1, aboveY + 2, aboveZ + 1)
      const entityAABBs = Object.values(bot.entities).map(entity => {
        // taken from taken from https://github.com/PrismarineJS/prismarine-physics/blob/d145e54a4bb8604300258badd7563f59f2101922/index.js#L92
        const w = entity.height / 2
        const { x, y, z } = entity.position
        return new AABB(-w, 0, -w, w, entity.height, w).offset(x, y, z)
      })
      const hasIntersectingEntities = entityAABBs.filter(aabb => aabb.intersects(blockBoundingBox)).length === 0
      return hasAirAbove && botNotStandingOnBlock && !hasIntersectingEntities
    }
  })
  if (!block) return bot.chat("Couldn't find bedrock or obsidian block that has air above it near myself.")

  // get to the crystal
  if (block.position.xzDistanceTo(bot.entity.position) > MAX_DIST_FROM_BLOCK_TO_PLACE) await bot.pathfinder.goto(new pathfinder.goals.GoalNear(block.position.x, block.position.y, block.position.z, MAX_DIST_FROM_BLOCK_TO_PLACE))
  // get ready to place crystal
  await bot.equip(item, 'hand')
  await bot.lookAt(block.position, true)
  // place crystal
  await bot.placeEntity(block, new Vec3(0, 1, 0))
  bot.chat('I placed an end crystal!')
})
