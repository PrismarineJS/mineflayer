// The spec reporter, plus a JSON file of { "<test full title>": <ms> } for every
// passing test, written to $DURATIONS. CI compares it against master's run.
const fs = require('fs')
const { reporters, Runner } = require('mocha')

class DurationsReporter extends reporters.Spec {
  constructor (runner, options) {
    super(runner, options)
    const durations = {}
    runner.on(Runner.constants.EVENT_TEST_PASS, test => {
      durations[test.fullTitle()] = test.duration
    })
    runner.once(Runner.constants.EVENT_RUN_END, () => {
      if (process.env.DURATIONS) fs.writeFileSync(process.env.DURATIONS, JSON.stringify(durations, null, 2))
    })
  }
}

module.exports = DurationsReporter
