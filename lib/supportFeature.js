const features = require('./features')

function versionIndex (versionString) {
  const versionList = require('minecraft-data').versions.pc
  for (let i = 0; i < versionList.length; i++) {
    if (versionList[i].minecraftVersion === versionString) {
      return versionList.length - i
    }
  }

  return -1
}

module.exports = (feature, minecraftVersion) => {
  const f = features.find(f => f.name === feature)

  const currentVer = versionIndex(minecraftVersion)
  const minVer = versionIndex(f.versions[0])
  const maxVer = versionIndex(f.versions[1])

  return minVer <= currentVer && currentVer <= maxVer
}
