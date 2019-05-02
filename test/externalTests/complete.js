const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.tabComplete('/weather ', (matches) => {
    assert.deepStrictEqual(matches, [
      'clear',
      'rain',
      'thunder'
    ])

    bot.tabComplete('/weather', (matches) => {
      assert.deepStrictEqual(matches, [ '/weather' ])
      done()
    })
  })
}
