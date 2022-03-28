const { Vec3 } = require('vec3')

module.exports = inject

const CARDINAL_DIRECTIONS = ['south', 'west', 'north', 'east']

function inject (bot) {
  bot.isSleeping = false

  const beds = new Set(['white_bed', 'orange_bed', 'magenta_bed', 'light_blue_bed', 'yellow_bed', 'lime_bed', 'pink_bed', 'gray_bed',
    'light_gray_bed', 'cyan_bed', 'purple_bed', 'blue_bed', 'brown_bed', 'green_bed', 'red_bed', 'black_bed', 'bed'])

  function isABed (block) {
    return beds.has(block.name)
  }

  function parseBedMetadata (bedBlock) {
    const metadata = {
      part: false, // true: head, false: foot
      occupied: 0,
      facing: 0, // 0: south, 1: west, 2: north, 3 east
      headOffset: new Vec3(0, 0, 1)
    }

    if (bot.supportFeature('blockStateId')) {
      const state = bedBlock.stateId - bot.registry.blocksByStateId[bedBlock.stateId].minStateId
      const bitMetadata = state.toString(2).padStart(4, '0') // FACING (first 2 bits), PART (3rd bit), OCCUPIED (4th bit)
      metadata.part = bitMetadata[3] === '0'
      metadata.occupied = bitMetadata[2] === '0'

      switch (bitMetadata.slice(0, 2)) {
        case '00':
          metadata.facing = 2
          metadata.headOffset.set(0, 0, -1)
          break
        case '10':
          metadata.facing = 1
          metadata.headOffset.set(-1, 0, 0)
          break
        case '11':
          metadata.facing = 3
          metadata.headOffset.set(1, 0, 0)
      }
    } else if (bot.supportFeature('blockMetadata')) {
      const bitMetadata = bedBlock.metadata.toString(2).padStart(4, '0') // PART (1st bit), OCCUPIED (2nd bit), FACING (last 2 bits)
      metadata.part = bitMetadata[0] === '1'
      metadata.occupied = bitMetadata[1] === '1'

      switch (bitMetadata.slice(2, 4)) {
        case '01':
          metadata.facing = 1
          metadata.headOffset.set(-1, 0, 0)
          break
        case '10':
          metadata.facing = 2
          metadata.headOffset.set(0, 0, -1)
          break
        case '11':
          metadata.facing = 3
          metadata.headOffset.set(1, 0, 0)
      }
    }

    return metadata
  }

  async function wake () {
    if (!bot.isSleeping) {
      throw new Error('already awake')
    } else {
      bot._client.write('entity_action', {
        entityId: bot.entity.id,
        actionId: 2,
        jumpBoost: 0
      })
    }
  }

  async function sleep (bedBlock) {
    const thunderstorm = bot.isRaining && (bot.thunderState > 0)
    if (!thunderstorm && !(bot.time.timeOfDay >= 12541 && bot.time.timeOfDay <= 23458)) {
      throw new Error("it's not night and it's not a thunderstorm")
    } else if (bot.isSleeping) {
      throw new Error('already sleeping')
    } else if (!isABed(bedBlock)) {
      throw new Error('wrong block : not a bed block')
    } else {
      const botPos = bot.entity.position.floored()
      const metadata = parseBedMetadata(bedBlock)
      let headPoint = bedBlock.position

      if (metadata.occupied) {
        throw new Error('the bed is occupied')
      }

      if (!metadata.part) { // Is foot
        const upperBlock = bot.blockAt(bedBlock.position.plus(metadata.headOffset))

        if (isABed(upperBlock)) {
          headPoint = upperBlock.position
        } else {
          const lowerBlock = bot.blockAt(bedBlock.position.plus(metadata.headOffset.scaled(-1)))

          if (isABed(lowerBlock)) {
            // If there are 2 foot parts, minecraft only lets you sleep if you click on the lower one
            headPoint = bedBlock.position
            bedBlock = lowerBlock
          } else {
            throw new Error("there's only half bed")
          }
        }
      }

      if (!bot.canDigBlock(bedBlock)) {
        throw new Error('cant click the bed')
      }

      const clickRange = [2, -3, -3, 2] // [south, west, north, east]
      const monsterRange = [7, -8, -8, 7]
      const oppositeCardinal = (metadata.facing + 2) % CARDINAL_DIRECTIONS.length

      if (clickRange[oppositeCardinal] < 0) {
        clickRange[oppositeCardinal]--
      } else {
        clickRange[oppositeCardinal]++
      }

      const nwClickCorner = headPoint.offset(clickRange[1], -2, clickRange[2]) // North-West lower corner
      const seClickCorner = headPoint.offset(clickRange[3], 2, clickRange[0]) // South-East upper corner
      if (botPos.x > seClickCorner.x || botPos.x < nwClickCorner.x || botPos.y > seClickCorner.y || botPos.y < nwClickCorner.y || botPos.z > seClickCorner.z || botPos.z < nwClickCorner.z) {
        throw new Error('the bed is too far')
      }

      if (bot.gameMode !== 'creative' || bot.supportFeature('creativeSleepNearMobs')) { // If in creative mode the bot should be able to sleep even if there are monster nearby (starting in 1.13)
        const nwMonsterCorner = headPoint.offset(monsterRange[1], -6, monsterRange[2]) // North-West lower corner
        const seMonsterCorner = headPoint.offset(monsterRange[3], 4, monsterRange[0]) // South-East upper corner

        for (const key of Object.keys(bot.entities)) {
          const entity = bot.entities[key]
          if (entity.kind === 'Hostile mobs') {
            const entityPos = entity.position.floored()
            if (entityPos.x <= seMonsterCorner.x && entityPos.x >= nwMonsterCorner.x && entityPos.y <= seMonsterCorner.y && entityPos.y >= nwMonsterCorner.y && entityPos.z <= seMonsterCorner.z && entityPos.z >= nwMonsterCorner.z) {
              throw new Error('there are monsters nearby')
            }
          }
        }
      }

      await bot.activateBlock(bedBlock)
    }
  }

  bot._client.on('game_state_change', (packet) => {
    if (packet.reason === 0) {
      // occurs when you can't spawn in your bed and your spawn point gets reset
      bot.emit('spawnReset')
    }
  })

  bot.on('entitySleep', (entity) => {
    if (entity === bot.entity) {
      bot.isSleeping = true
      bot.emit('sleep')
    }
  })

  bot.on('entityWake', (entity) => {
    if (entity === bot.entity) {
      bot.isSleeping = false
      bot.emit('wake')
    }
  })

  bot.parseBedMetadata = parseBedMetadata
  bot.wake = wake
  bot.sleep = sleep
  bot.isABed = isABed
}
