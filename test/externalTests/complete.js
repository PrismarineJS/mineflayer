const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.tabComplete('/weather ', (err, matches) => {
    assert.strictEqual(err, undefined)
    if (bot.supportFeature('tabCompleteHasAToolTip')) {
      assert.deepStrictEqual(matches, [
        { match: 'clear', tooltip: undefined },
        { match: 'rain', tooltip: undefined },
        { match: 'thunder', tooltip: undefined }
      ])
    } else if (bot.supportFeature('tabCompleteHasNoToolTip')) {
      assert.deepStrictEqual(matches, [
        'clear',
        'rain',
        'thunder'
      ])
    }

    if (bot.supportFeature('tabCompleteHasAToolTip')) {
      done()
    } else if (bot.supportFeature('tabCompleteHasNoToolTip')) {
      bot.tabComplete('/weather', (err, matches) => {
        assert.strictEqual(err, undefined)
        assert.deepStrictEqual(matches, ['/weather'])
        done()
      }, false, false)
    }
  }, false, false)
}
