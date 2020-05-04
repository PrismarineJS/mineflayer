const features = require('./features')

module.exports = (feature, version) =>
  features.some(({ name, versions }) => name === feature && versions.includes(version))
