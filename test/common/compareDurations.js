// Usage: node test/common/compareDurations.js <baselineDir> <currentDir> <slowerFile>
// Writes every test that got more than 2x slower than the slowest of master's last runs
// to <slowerFile>, one line each, so CI can post them as a PR comment. Never fails:
// durations are noisy.
// Then rewrites each <currentDir> file as the history of the last HISTORY runs, which
// master caches as the next baseline.
const fs = require('fs')
const path = require('path')

const [baselineDir, currentDir, slowerFile] = process.argv.slice(2)
const FACTOR = 2
// A single master run is not a baseline: master's own spread on the world-event tests
// (nether, fishing) is 3-5x, so compare against the slowest of the last few runs.
const HISTORY = 10
// Ignore jumps under 10s: anything smaller is server/network jitter.
const MIN_REGRESSION_MS = 10000

const slower = []
for (const file of fs.readdirSync(currentDir).filter(f => f.startsWith('durations-')).sort()) {
  const baselineFile = path.join(baselineDir, file)
  const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile)) : {}
  const current = JSON.parse(fs.readFileSync(path.join(currentDir, file)))
  const history = {}
  console.log(`\n${file}`)
  for (const [title, ms] of Object.entries(current)) {
    // Caches from before the history was kept hold a single number.
    const runs = [].concat(baseline[title] ?? [])
    history[title] = [...runs, ms].slice(-HISTORY)
    if (runs.length === 0) continue
    const base = Math.max(...runs)
    const regressed = ms > base * FACTOR && ms - base > MIN_REGRESSION_MS
    const line = `${String(base).padStart(7)}ms -> ${String(ms).padStart(7)}ms  ${title}`
    if (regressed) slower.push(line)
    console.log(`  ${regressed ? 'SLOWER' : '      '} ${line}`)
  }
  fs.writeFileSync(path.join(currentDir, file), JSON.stringify(history, null, 2))
}
if (slower.length > 0) {
  console.log(`\n${slower.length} test(s) got more than ${FACTOR}x slower than master`)
  fs.writeFileSync(slowerFile, slower.join('\n') + '\n')
}
