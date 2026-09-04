// Usage: node test/common/compareDurations.js <baselineDir> <currentDir> <slowerFile>
// Writes every test that got more than 1.5x slower than master's baseline to <slowerFile>,
// one line each, so CI can post them as a PR comment. Never fails: durations are noisy.
const fs = require('fs')
const path = require('path')

const [baselineDir, currentDir, slowerFile] = process.argv.slice(2)
const FACTOR = 1.5
// Ignore tests too short for a 1.5x jump to mean anything (server/network jitter).
const MIN_REGRESSION_MS = 5000

const slower = []
for (const file of fs.readdirSync(currentDir).filter(f => f.startsWith('durations-')).sort()) {
  const baselineFile = path.join(baselineDir, file)
  if (!fs.existsSync(baselineFile)) {
    console.log(`${file}: no baseline yet, skipping`)
    continue
  }
  const baseline = JSON.parse(fs.readFileSync(baselineFile))
  const current = JSON.parse(fs.readFileSync(path.join(currentDir, file)))
  console.log(`\n${file}`)
  for (const [title, ms] of Object.entries(current)) {
    const base = baseline[title]
    if (base === undefined) continue
    const regressed = ms > base * FACTOR && ms - base > MIN_REGRESSION_MS
    const line = `${String(base).padStart(7)}ms -> ${String(ms).padStart(7)}ms  ${title}`
    if (regressed) slower.push(line)
    console.log(`  ${regressed ? 'SLOWER' : '      '} ${line}`)
  }
}
if (slower.length > 0) {
  console.log(`\n${slower.length} test(s) got more than ${FACTOR}x slower than master:`)
  for (const line of slower) console.log(`  SLOWER ${line}`)
  fs.writeFileSync(slowerFile, slower.join('\n') + '\n')
}
