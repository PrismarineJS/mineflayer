const Vec3 = require('vec3').Vec3

module.exports = inject

const CARDINAL_DIRECTIONS = ['south', 'west', 'north', 'east']

function inject (bot) {
  bot.isSleeping = false

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
        metadata.headOffset = new Vec3(-1, 0, 0)
        break
      case '10':
        metadata.facing = 2
        metadata.headOffset = new Vec3(0, 0, -1)
        break
      case '11':
        metadata.facing = 3
        metadata.headOffset = new Vec3(1, 0, 0)
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
    if (!(bot.time.day >= 12541 && bot.time.day <= 23458)) {
      cb(new Error("it's not night"))
    } else if (bot.isSleeping) {
      cb(new Error('already sleeping'))
    } else if (bedBlock.type !== 26) {
      cb(new Error('wrong block : not a bed block'))
    } else {
      const metadata = parseBedMetadata(bedBlock)
      let headPoint = bedBlock.position

      if (metadata.occupied === 1) return cb(new Error('the bed is occupied'))

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

      if (!bot.canDigBlock(bedBlock)) return cb(new Error('cant click the bed'))

      const clickRange = [2, -3, -3, 2] // [south, west, north, east]
      const oppositeCardinal = (metadata.facing + 2) % CARDINAL_DIRECTIONS.length
      if (clickRange[oppositeCardinal] < 0) {
        clickRange[oppositeCardinal]--
      } else {
        clickRange[oppositeCardinal]++
      }

      const botPos = bot.entity.position.floored()
      const nwCorner = headPoint.offset(clickRange[1], -2, clickRange[2]) // North-West lower corner
      const seCorner = headPoint.offset(clickRange[3], 2, clickRange[0]) // South-East upper corner
      if (botPos.x > seCorner.x || botPos.x < nwCorner.x || botPos.y > seCorner.y || botPos.y < nwCorner.y || botPos.z > seCorner.z || botPos.z < nwCorner.z) return cb(new Error('the bed is too far'))

      bot.activateBlock(bedBlock, () => {
        function sleepCb () {
          clearTimeout(sleepTimeout)
          cb()
        }

        const sleepTimeout = setTimeout(() => {
          bot.removeListener('sleep', sleepCb)
          cb(new Error('there are monsters nearby'))
        }, 1000)

        bot.once('sleep', sleepCb)
      })
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
}
