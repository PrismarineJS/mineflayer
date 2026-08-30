// Usage: node test/common/compareDurations.js <baselineDir> <currentDir>
// Fails if any test that passed in both runs got more than 1.5x slower than master's baseline.
const fs = require('fs')
const path = require('path')

const [baselineDir, currentDir] = process.argv.slice(2)
const FACTOR = 1.5
// Ignore tests too short for a 1.5x jump to mean anything (server/network jitter).
const MIN_REGRESSION_MS = 5000

let regressions = 0
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
    if (regressed) regressions++
    console.log(`  ${regressed ? 'SLOWER' : '      '} ${String(base).padStart(7)}ms -> ${String(ms).padStart(7)}ms  ${title}`)
  }
}
if (regressions > 0) {
  console.error(`\n${regressions} test(s) got more than ${FACTOR}x slower than master`)
  process.exit(1)
}
