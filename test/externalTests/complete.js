const assert = require('assert')

module.exports = () => async (bot) => {
  const matches = await bot.tabComplete('/weather ')
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

  if (bot.supportFeature('tabCompleteHasNoToolTip')) {
    const matches = await bot.tabComplete('/weather')
    assert.deepStrictEqual(matches, ['/weather'])
  }
}
