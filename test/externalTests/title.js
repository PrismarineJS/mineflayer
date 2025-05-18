const { once } = require('events')

module.exports = () => async (bot) => {
  // Wait for bot to be ready
  await once(bot, 'spawn')
  
  console.log('### Starting title test')
  await bot.chat('### Starting title test')

  // Test title
  const titlePromise = once(bot, 'title')
  await bot.chat('/title @s title {"text":"Test Title"}')
  const [title, type] = await titlePromise
  if (title !== 'Test Title' || type !== 'title') {
    throw new Error(`Title test failed: expected "Test Title" but got "${title}" with type "${type}"`)
  }

  // Test subtitle
  const subtitlePromise = once(bot, 'title')
  await bot.chat('/title @s subtitle {"text":"Test Subtitle"}')
  const [subtitle, subtitleType] = await subtitlePromise
  if (subtitle !== 'Test Subtitle' || subtitleType !== 'subtitle') {
    throw new Error(`Subtitle test failed: expected "Test Subtitle" but got "${subtitle}" with type "${subtitleType}"`)
  }

  // Test title with both title and subtitle
  const bothTitlePromise = once(bot, 'title')
  const bothSubtitlePromise = once(bot, 'title')
  await bot.chat('/title @s times 20 40 20')
  await bot.chat('/title @s title {"text":"Combined Title"}')
  await bot.chat('/title @s subtitle {"text":"Combined Subtitle"}')
  
  const [bothTitle, bothTitleType] = await bothTitlePromise
  const [bothSubtitle, bothSubtitleType] = await bothSubtitlePromise
  
  if (bothTitle !== 'Combined Title' || bothTitleType !== 'title') {
    throw new Error(`Combined title test failed: expected "Combined Title" but got "${bothTitle}" with type "${bothTitleType}"`)
  }
  if (bothSubtitle !== 'Combined Subtitle' || bothSubtitleType !== 'subtitle') {
    throw new Error(`Combined subtitle test failed: expected "Combined Subtitle" but got "${bothSubtitle}" with type "${bothSubtitleType}"`)
  }
} 