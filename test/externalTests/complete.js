const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.tabComplete('/weather ', (err, matches) => {
    assert.strictEqual(err, undefined)
    assert.deepStrictEqual(matches, [
      'clear',
      'rain',
      'thunder'
    ])

    bot.tabComplete('/weather', (err, matches) => {
      assert.strictEqual(err, undefined)
      assert.deepStrictEqual(matches, [ '/weather' ])
      done()
    }, false, false)
  }, false, false)
}
