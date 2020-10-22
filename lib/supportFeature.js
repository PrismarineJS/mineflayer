const features = require('./features')

module.exports = (feature, version, minecraftVersion) =>
  features.some(({ name, versions }) => name === feature && (versions.includes(version) || versions.includes(minecraftVersion)))
