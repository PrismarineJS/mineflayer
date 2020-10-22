const features = require('./features')

module.exports = (feature, minecraftVersion) => {
  const f = features.find(f => f.name === feature)

  const currentVer = require('minecraft-data')(minecraftVersion).version.version
  const minVer = require('minecraft-data')(f.versions[0]).version.version
  const maxVer = require('minecraft-data')(f.versions[1]).version.version

  return minVer <= currentVer && currentVer <= maxVer
}
