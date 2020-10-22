const features = require('./features')

module.exports = (feature, minecraftVersion) => {
  const feature = features.find(f => f.name === name)

  const currentVer = require('minecraft-data')(minecraftVersion).version.version
  const minVer = require('minecraft-data')(feature.versions[0]).version.version
  const maxVer = require('minecraft-data')(feature.versions[1]).version.version

  return minVer <= currentVer && currentVer <= maxVer
}
