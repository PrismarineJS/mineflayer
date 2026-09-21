/* global describe, it */
const assert = require('assert')
const { Vec3 } = require('vec3')
const injectExplosion = require('../lib/plugins/explosion')

function createEntity (width, height) {
  return {
    position: new Vec3(0, 0, 0),
    width,
    height
  }
}

describe('explosion damage', function () {
  it('uses the target entity dimensions when calculating exposure', function () {
    const bot = {
      world: {
        raycast: (origin, direction) => direction.y > 0.3 ? {} : null
      }
    }
    injectExplosion(bot)

    const source = new Vec3(0, 0, -2)
    const smallEntityDamage = bot.getExplosionDamages(createEntity(0.4, 0.7), source, 6, true)
    const playerSizedEntityDamage = bot.getExplosionDamages(createEntity(0.6, 1.8), source, 6, true)

    assert(smallEntityDamage > playerSizedEntityDamage)
  })
})
