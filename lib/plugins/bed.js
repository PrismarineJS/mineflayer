module.exports = inject

function inject (bot) {
  bot.isSleeping = false
  const beds = new Set(['white_bed', 'orange_bed', 'magenta_bed', 'light_blue_bed', 'yellow_bed', 'lime_bed', 'pink_bed', 'gray_bed', 
  'light_gray_bed', 'cyan_bed', 'purple_bed', 'blue_bed', 'brown_bed', 'green_bed', 'red_bed', 'black_bed', 'bed'])

  function isABed(block) {
    return beds.has(block.name)
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
    } else if (!isABed(bedBlock)) {
      cb(new Error('wrong block : not a bed block'))
    } else {
      bot.activateBlock(bedBlock)
      cb()
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
