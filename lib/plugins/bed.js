const Vec3 = require('vec3').Vec3

module.exports = inject

function inject (bot) {
  bot.isSleeping = false

  function parseBedMetadata (bedBlock) {
    const metadata = {}
    const bMetadata = bedBlock.metadata.toString(2).padStart(4, '0')

    metadata.part = Number(bMetadata[0])
    metadata.occupied = Number(bMetadata[1])
    switch (bMetadata.slice(2, 4)) {
      case '00':
        metadata.facing = 'south'
        metadata.headOffset = new Vec3(0, 0, 1)
        break
      case '01':
        metadata.facing = 'west'
        metadata.headOffset = new Vec3(-1, 0, 0)
        break
      case '10':
        metadata.facing = 'north'
        metadata.headOffset = new Vec3(0, 0, -1)
        break
      case '11':
        metadata.facing = 'east'
        metadata.headOffset = new Vec3(1, 0, 0)
        break
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
      let headBlock = bedBlock

      if (metadata.part === 0) {
        headBlock = bot.blockAt(bedBlock.position.add(metadata.headOffset))
        if (headBlock.type !== 26 || parseBedMetadata(headBlock).part === 0) {
          return cb(new Error("there's only half bed"))
        }
      }

      const topBlock = bot.blockAt(headBlock.position.offset(0, 1, 0))
      if (topBlock.boundingBox === 'block') {
        return cb(new Error("there's a block on top of the bed's head"))
      }

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
