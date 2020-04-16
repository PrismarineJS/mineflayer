const Vec3 = require('vec3').Vec3

module.exports = inject

const CARDINAL_DIRECTIONS = ['south', 'west', 'north', 'east']

function noop (err) {
  if (err) throw err
}

function inject (bot) {
  bot.isSleeping = false
  const beds = new Set(['white_bed', 'orange_bed', 'magenta_bed', 'light_blue_bed', 'yellow_bed', 'lime_bed', 'pink_bed', 'gray_bed',
    'light_gray_bed', 'cyan_bed', 'purple_bed', 'blue_bed', 'brown_bed', 'green_bed', 'red_bed', 'black_bed', 'bed'])

  function isABed (block) {
    return beds.has(block.name)
  }

  function parseBedMetadata (bedBlock) {
    const bitMetadata = bedBlock.metadata.toString(2).padStart(4, '0')

    const metadata = {
      part: parseInt(bitMetadata[0], 2),
      occupied: parseInt(bitMetadata[1], 2),
      facing: 0,
      headOffset: new Vec3(0, 0, 1)
    }

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

    return metadata
  }

  function wake (cb) {
    if (!bot.isSleeping) {
      cb(new Error('already awake'))
    } else {
      bot._client.write('entity_action', {
        entityId: bot.entity.id,
        actionId: 2,
        jumpBoost: 0
      })
      cb()
    }
  }

  function sleep (bedBlock, cb) {
    cb = cb || noop
    if (!(bot.time.day >= 12541 && bot.time.day <= 23458)) {
      cb(new Error("it's not night"))
    } else if (bot.isSleeping) {
      cb(new Error('already sleeping'))
    } else if (!isABed(bedBlock)) {
      cb(new Error('wrong block : not a bed block'))
    } else {
      const botPos = bot.entity.position.floored()
      const metadata = parseBedMetadata(bedBlock)
      let headPoint = bedBlock.position

      if (metadata.occupied === 1) {
        return cb(new Error('the bed is occupied'))
      }

      if (metadata.part === 0) {
        const upperBlock = bot.blockAt(bedBlock.position.plus(metadata.headOffset))

        if (upperBlock.type === 26) {
          headPoint = upperBlock.position
        } else {
          const lowerBlock = bot.blockAt(bedBlock.position.plus(metadata.headOffset.scaled(-1)))

          if (lowerBlock.type === 26) {
            // If there are 2 foot parts, minecraft only lets you sleep if you click on the lower one
            headPoint = bedBlock.position
            bedBlock = lowerBlock
          } else {
            return cb(new Error("there's only half bed"))
          }
        }
      }

      if (!bot.canDigBlock(bedBlock)) {
        return cb(new Error('cant click the bed'))
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
        return cb(new Error('the bed is too far'))
      }

      const nwMonsterCorner = headPoint.offset(monsterRange[1], -6, monsterRange[2]) // North-West lower corner
      const seMonsterCorner = headPoint.offset(monsterRange[3], 4, monsterRange[0]) // South-East upper corner
      for (const key of Object.keys(bot.entities)) {
        const entity = bot.entities[key]
        if (entity.kind === 'Hostile mobs') {
          const entityPos = entity.position.floored()
          if (entityPos.x <= seMonsterCorner.x && entityPos.x >= nwMonsterCorner.x && entityPos.y <= seMonsterCorner.y && entityPos.y >= nwMonsterCorner.y && entityPos.z <= seMonsterCorner.z && entityPos.z >= nwMonsterCorner.z) {
            return cb(new Error('there are monsters nearby'))
          }
        }
      }

      bot.activateBlock(bedBlock, cb)
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

  bot.wake = wake
  bot.sleep = sleep
  bot.isABed = isABed
}
