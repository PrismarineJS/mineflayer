const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  bot.on('soundEffectHeard', (soundName, position, volume, pitch) => {
    console.log(`soundEffectHeard: ${soundName}`)
  })

  bot.on('hardcodedSoundEffectHeard', (soundId, soundCategory, position, volume, pitch) => {
    console.log(`hardcodedSoundEffectHeard: ${soundId}`)
  })

  bot.test.sayEverywhere('/playsound minecraft:entity.zombie.ambient neutral @a')
  await bot.test.wait(1000)

  bot.test.sayEverywhere('/playsound 0 neutral @a')
  await bot.test.wait(1000)

  assert.ok(true)
}
