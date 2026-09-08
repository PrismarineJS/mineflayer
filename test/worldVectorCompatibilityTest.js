/* eslint-env mocha */
const assert = require('assert')

describe('world vector compatibility', () => {
  it('uses compatible position objects for entity, direct block and raycast results', () => {
    const version = '1.21.4'
    const Entity = require('prismarine-entity')(version)
    const registry = require('prismarine-registry')(version)
    const Chunk = require('prismarine-chunk')(version)
    const World = require('prismarine-world')(version)
    const entity = new Entity(1)
    entity.position = entity.position.offset(0.5, 65, 0.5)
    const world = new World().sync
    world.setColumn(0, 0, new Chunk())
    world.setBlockStateId(entity.position.offset(0, -1, 0), registry.blocksByName.stone.defaultState)
    const ray = world.raycast(entity.position, entity.position.scaled(0).offset(0, -1, 0), 3)
    const direct = world.getBlock(entity.position.offset(0, -1, 0))
    // Equal coordinates alone miss incompatible vector prototypes from mixed dependencies.
    assert.deepStrictEqual(ray.position, direct.position)
    assert.deepStrictEqual(entity.position, require('vec3')(0.5, 65, 0.5))
  })
})
