const nodeIndex = parseInt(process.env.CIRCLE_NODE_INDEX)
const nodeTotal = parseInt(process.env.CIRCLE_NODE_TOTAL)
const parallel = process.env.CIRCLE_NODE_INDEX !== undefined && process.env.CIRCLE_NODE_TOTAL !== undefined
const mc = require('../../')

// expected values :
// (0,4,10) -> (0,2)
// (1,4,10) -> (3,5)
// (2,4,10) -> (6,8)
// (3,4,10) -> (9,9)
function testedRange (nodeIndex, nodeTotal, numberOfVersions) {
  const nbFirsts = Math.ceil(numberOfVersions / nodeTotal)
  if (nodeIndex === (nodeTotal - 1)) {
    return {
      firstVersion: nbFirsts * nodeIndex,
      lastVersion: numberOfVersions - 1
    }
  }

  return {
    firstVersion: nodeIndex * nbFirsts,
    lastVersion: (nodeIndex + 1) * nbFirsts - 1
  }
}
console.log({ nodeIndex, nodeTotal, versions: mc.supportedVersions.length })
const { firstVersion, lastVersion } = parallel
  ? testedRange(nodeIndex, nodeTotal, mc.supportedVersions.length)
  : {
      firstVersion: 0,
      lastVersion: mc.supportedVersions.length - 1
    }

module.exports = { firstVersion, lastVersion }
