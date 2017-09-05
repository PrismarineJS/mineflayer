module.exports = inject

function inject (bot) {
  bot.isSleeping = false

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
}
