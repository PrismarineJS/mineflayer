const { Vec3 } = require('vec3')

const CARDINAL_OFFSETS = {
  north: new Vec3(0, 0, -1),
  south: new Vec3(0, 0, 1),
  west: new Vec3(-1, 0, 0),
  east: new Vec3(1, 0, 0)
}

const CHEST_FACING_MAP = {
  north: { west: 'right', east: 'left' },
  south: { west: 'left', east: 'right' },
  west: { north: 'left', south: 'right' },
  east: { north: 'right', south: 'left' }
}

function parseChestMetadata (bot, chestBlock) {
  const chestTypes = ['single', 'right', 'left']

  return bot.supportFeature('doesntHaveChestType')
    ? { facing: Object.keys(CARDINAL_OFFSETS)[chestBlock.metadata - 2] }
    : {
        waterlogged: !(chestBlock.metadata & 1),
        type: chestTypes[(chestBlock.metadata >> 1) % 3],
        facing: Object.keys(CARDINAL_OFFSETS)[Math.floor(chestBlock.metadata / 6)]
      }
}

const getChestType = (bot, chestBlock) => { // Returns 'single', 'right' or 'left'
  if (bot.supportFeature('doesntHaveChestType')) {
    const facing = parseChestMetadata(bot, chestBlock).facing

    if (!facing) return 'single'

    // We have to check if the adjacent blocks in the perpendicular cardinals are the same type
    const perpendicularCardinals = Object.keys(CHEST_FACING_MAP[facing])
    for (const cardinal of perpendicularCardinals) {
      const cardinalOffset = CARDINAL_OFFSETS[cardinal]
      if (bot.blockAt(chestBlock.position.plus(cardinalOffset))?.type === chestBlock.type) {
        return CHEST_FACING_MAP[cardinal][facing]
      }
    }

    return 'single'
  } else {
    return parseChestMetadata(bot, chestBlock).type
  }
}

module.exports = { CARDINAL_OFFSETS, CHEST_FACING_MAP, parseChestMetadata, getChestType }
