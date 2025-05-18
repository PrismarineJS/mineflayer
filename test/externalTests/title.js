const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Use JSON format for all Java versions, but accept both JSON and quoted string as valid results
  const format = {
    title: '{"text":"Test Title"}',
    subtitle: '{"text":"Test Subtitle"}',
    expect: (val, exp) => val === exp || val === `{"text":"${exp}"}` || val === `"${exp}"`
  }

  // Test title
  bot.chat(`/title @a title ${format.title}`)
  const [title, type] = await once(bot, 'title', 20000)
  if (!format.expect(title, 'Test Title') || type !== 'title') {
    throw new Error(`Title test failed: expected "Test Title" but got "${title}" with type "${type}"`)
  }

  // Test subtitle
  bot.chat(`/title @a subtitle ${format.subtitle}`)
  const [subtitle, subtitleType] = await once(bot, 'title', 20000)
  if (!format.expect(subtitle, 'Test Subtitle') || subtitleType !== 'subtitle') {
    throw new Error(`Subtitle test failed: expected "Test Subtitle" but got "${subtitle}" with type "${subtitleType}"`)
  }

  // Set times
  bot.chat('/title @a times 20 40 20')
  await new Promise(res => setTimeout(res, 1000))

  // Test combined title and subtitle
  bot.chat(`/title @a title ${format.title}`)
  const [combinedTitle, combinedTitleType] = await once(bot, 'title', 20000)
  if (!format.expect(combinedTitle, 'Test Title') || combinedTitleType !== 'title') {
    throw new Error(`Combined title test failed: expected "Test Title" but got "${combinedTitle}" with type "${combinedTitleType}"`)
  }

  bot.chat(`/title @a subtitle ${format.subtitle}`)
  const [combinedSubtitle, combinedSubtitleType] = await once(bot, 'title', 20000)
  if (!format.expect(combinedSubtitle, 'Test Subtitle') || combinedSubtitleType !== 'subtitle') {
    throw new Error(`Combined subtitle test failed: expected "Test Subtitle" but got "${combinedSubtitle}" with type "${combinedSubtitleType}"`)
  }
}
