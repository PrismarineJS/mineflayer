const { Vec3 } = require('vec3')

module.exports = inject

// https://minecraft.fandom.com/wiki/Explosion
function calcExposure (playerPos, explosionPos, world) {
  const dx = 1 / (0.6 * 2 + 1)
  const dy = 1 / (1.8 * 2 + 1)
  const dz = 1 / (0.6 * 2 + 1)

  const d3 = (1 - Math.floor(1 / dx) * dx) / 2
  const d4 = (1 - Math.floor(1 / dz) * dz) / 2

  let sampled = 0
  let exposed = 0
  const pos = new Vec3(0, 0, 0)
  for (pos.y = playerPos.y; pos.y <= playerPos.y + 1.8; pos.y += 1.8 * dy) {
    for (pos.x = playerPos.x - 0.3 + d3; pos.x <= playerPos.x + 0.3; pos.x += 0.6 * dx) {
      for (pos.z = playerPos.z - 0.3 + d4; pos.z <= playerPos.z + 0.3; pos.z += 0.6 * dz) {
        const dir = pos.minus(explosionPos)
        const range = dir.norm()
        if (world.raycast(explosionPos, dir.normalize(), range) === null) {
          exposed++
        }
        sampled++
      }
    }
  }
  return exposed / sampled
}

// https://minecraft.fandom.com/wiki/Armor#Damage_protection
function getDamageAfterAbsorb (damages, armorValue, thoughness) {
  const var3 = 2 + thoughness / 4
  const var4 = Math.min(Math.max(armorValue - damages / var3, armorValue * 0.2), 20)
  return damages * (1 - var4 / 25)
}

function inject (bot) {
  const damageMultiplier = 7 // for 1.12+ 8 for 1.8 TODO check when the change occur (likely 1.9)

  const difficultyValues = {
    peaceful: 0,
    easy: 1,
    normal: 2,
    hard: 3
  }

  bot.getExplosionDamages = (targetEntity, sourcePos, power) => {
    const distance = targetEntity.position.distanceTo(sourcePos)
    const radius = 2 * power
    if (distance >= radius) return 0
    const exposure = calcExposure(targetEntity.position, sourcePos, bot.world)
    const impact = (1 - distance / radius) * exposure
    let damages = Math.floor((impact * impact + impact) * damageMultiplier * power + 1)

    // TODO: get armor and thoughness from attributes
    damages = getDamageAfterAbsorb(damages, 0, 0)

    // TODO: protection enchantment and resistance effects

    if (targetEntity.type === 'player') damages *= difficultyValues[bot.game.difficulty] * 0.5

    // console.log(exposure, impact, damages, difficultyValues[bot.game.difficulty])
    return Math.floor(damages)
  }
}
