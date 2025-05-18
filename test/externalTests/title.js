const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test title
  bot.chat('/title @a title {"text":"Test Title"}')
  const [title, type] = await once(bot, 'title', 2000)
  if (title !== 'Test Title' || type !== 'title') {
    throw new Error(`Title test failed: expected "Test Title" but got "${title}" with type "${type}"`)
  }

  // Test subtitle
  bot.chat('/title @a subtitle {"text":"Test Subtitle"}')
  const [subtitle, subtitleType] = await once(bot, 'title', 20000)
  if (subtitle !== 'Test Subtitle' || subtitleType !== 'subtitle') {
    throw new Error(`Subtitle test failed: expected "Test Subtitle" but got "${subtitle}" with type "${subtitleType}"`)
  }

  // Test title_times event
  bot.chat('/title @a times 10 20 30')
  const [fadeIn, stay, fadeOut] = await once(bot, 'title_times', 20000)
  if (fadeIn !== 10 || stay !== 20 || fadeOut !== 30) {
    throw new Error(`title_times event failed: expected (10,20,30) but got (${fadeIn},${stay},${fadeOut})`)
  }

  // Test combined title and subtitle
  bot.chat('/title @a title {"text":"Test Title"}')
  const [combinedTitle, combinedTitleType] = await once(bot, 'title', 20000)
  if (combinedTitle !== 'Test Title' || combinedTitleType !== 'title') {
    throw new Error(`Combined title test failed: expected "Test Title" but got "${combinedTitle}" with type "${combinedTitleType}"`)
  }

  bot.chat('/title @a subtitle {"text":"Test Subtitle"}')
  const [combinedSubtitle, combinedSubtitleType] = await once(bot, 'title', 20000)
  if (combinedSubtitle !== 'Test Subtitle' || combinedSubtitleType !== 'subtitle') {
    throw new Error(`Combined subtitle test failed: expected "Test Subtitle" but got "${combinedSubtitle}" with type "${combinedSubtitleType}"`)
  }

  // Test clearing title
  bot.chat('/title @a clear')
  await once(bot, 'title_clear', 2000)
}
