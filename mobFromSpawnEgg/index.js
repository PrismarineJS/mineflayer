const nbt = require('prismarine-nbt')
const spawnEggIds = require('./spawn_egg_ids.json')
module.exports = (version) => {
  const mcData = require('minecraft-data')(version)
  function identify (item) {
    if (mcData.isOlderThan('1.9')) {
      return Object.entries(spawnEggIds)
        .find(o => o[1] === item.metadata)[0]
    } else if (mcData.isOlderThan('1.13')) {
      const data = nbt.simplify(item.nbt)
      const entityName = data.EntityTag.id
      return entityName.replace('minecraft:', '')
    } else {
      return item.name.replace('_spawn_egg', '')
    }
  }
  return identify
}
