const mineflayer = require('../../')

// Each version in this list costs a registry, a chunk implementation and a protocol at file load
// time, before mocha's --grep can discard anything, so a scoped run must not iterate the rest.
// MC_VERSIONS is a comma separated list; unset means every tested version.
const only = process.env.MC_VERSIONS ? process.env.MC_VERSIONS.split(',').map(v => v.trim()) : null
const versionsUnderTest = mineflayer.testedVersions.filter(v => only === null || only.includes(v))
if (versionsUnderTest.length === 0) {
  throw new Error(`MC_VERSIONS=${process.env.MC_VERSIONS} matches none of ${mineflayer.testedVersions.join(', ')}`)
}

module.exports = { versionsUnderTest }
