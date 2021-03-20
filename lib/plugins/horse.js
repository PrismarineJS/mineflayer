const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  const metadataMap = {
    base: {
      health: [7],
      baby: [12],
      tame: [13, 0x02],
      saddled: [13, 0x04],
      hasBred: [13, 0x08],
      eating: [13, 0x10],
      rearing: [13, 0x20],
      mouthOpen: [13, 0x40],
      owner: [14]
    },
    horse: {
      variant: [15]
    },
    donkey: {
      chested: [15]
    },
    llama: {
      strength: [16],
      variant: [17]
    }
  }

  Object.assign(metadataMap.horse, metadataMap.base)
  Object.assign(metadataMap.donkey, metadataMap.base)
  Object.assign(metadataMap.llama, metadataMap.base)
  metadataMap.mule = metadataMap.donkey

  async function openHorse(horseEntity) {
    if (!metadataMap[horseEntity.name]) return
    const oldSneakState = bot.controlState['sneak']

    bot.setControlState('sneak', true)
    const horse = await bot.openEntity(horseEntity)
    bot.setControlState('sneak', oldSneakState)

    return horse
  }

  function getHorseProperties(horseEntity, property) {
    const type = horseEntity.name
    if (!metadataMap[type]) return null

    if (property !== undefined) {
      const propPos = metadataMap[type][property]
      if (!propPos) return null

      const data = horseEntity.metadata[propPos[0]]

      return propPos[1] ? !!(data & propPos[1]) : data
    } else {
      const result = {}
      Object.keys(metadataMap[type]).forEach(prop => {
        result[prop] = getHorseProperties(horseEntity, prop)
      })

      return result
    }
  }

  bot.on('entityUpdate', entity => {
    if (!metadataMap[entity.name]) return;

    const props = getHorseProperties(entity)
    if (!props) return;

    Object.entries(props).forEach(([key, prop]) => {
      entity[key] = prop
    })
    bot.emit('horseUpdate', entity)
  })

  bot.openHorse = callbackify(openHorse)
}
