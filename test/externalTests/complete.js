const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.tabComplete('/weather ', (err, matches) => {
    assert.strictEqual(err, undefined)
    if (bot.majorVersion === '1.13') {
      assert.deepStrictEqual(matches, [
        { match: 'clear', tooltip: undefined },
        { match: 'rain', tooltip: undefined },
        { match: 'thunder', tooltip: undefined }
      ])
    } else {
      assert.deepStrictEqual(matches, [
        'clear',
        'rain',
        'thunder'
      ])
    }

    if (bot.majorVersion === '1.13') {
      done()
    } else {
      bot.tabComplete('/weather', (err, matches) => {
        assert.strictEqual(err, undefined)
        assert.deepStrictEqual(matches, ['/weather'])
        done()
      }, false, false)
    }
  }, false, false)
}
