const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Debug: log all incoming packets related to title
  bot._client.on('packet', (data, meta) => {
    if (meta.name.includes('title')) {
      console.log('DEBUG: Received packet', meta.name, JSON.stringify(data))
    }
  })
  // Log all chat messages for command feedback/errors
  bot.on('message', (jsonMsg) => {
    console.log('DEBUG: Chat message from server:', jsonMsg.toString())
  })
  // Wait for bot to be ready
  await new Promise(res => setTimeout(res, 2000)); // Increased delay to ensure bot is fully ready
  
  console.log('### Starting title test')
  bot.chat('### Starting title test')
  await new Promise(res => setTimeout(res, 1000)) // Wait for chat to be processed

  // Test if chat is working
  console.log('Testing chat...')
  bot.chat('test chat message')
  await new Promise(res => setTimeout(res, 1000)) // Wait for chat to be processed

  // Helper function to wait for title with timeout and log what is received
  const waitForTitle = (timeout = 20000) => {
    let resolve, reject
    const promise = new Promise((res, rej) => { resolve = res; reject = rej })
    let timer = setTimeout(() => {
      bot.removeListener('title', handler)
      reject(new Error('Timeout waiting for title event'))
    }, timeout)
    function handler(title, type) {
      clearTimeout(timer)
      bot.removeListener('title', handler)
      console.log('[DEBUG] Got title event:', title, type)
      resolve([title, type])
    }
    bot.on('title', handler)
    return promise
  }

  // Use JSON format for all Java versions, but accept both JSON and quoted string as valid results
  const format = { 
    title: '{"text":"Test Title"}', 
    subtitle: '{"text":"Test Subtitle"}', 
    combinedTitle: '{"text":"Combined Title"}', 
    combinedSubtitle: '{"text":"Combined Subtitle"}', 
    expect: (val, exp) => val === exp || val === `{"text":"${exp}"}` || val === `"${exp}"` 
  }

  try {
    console.log(`Using format for version: ${bot.version}`)
    
    // First title
    const persistentTitleListener = (title, type) => {
      console.log('[PERSISTENT] Received title event:', title, type);
    };
    bot.on('title', persistentTitleListener);
    console.log('[TEST DEBUG] Attaching title event listener for bot:', bot.username, 'entityId:', bot.entityId);
    const titlePromise = waitForTitle();
    bot.chat(`/title @a title ${format.title}`)
    console.log(`Sent command: /title @a title ${format.title}`)
    const [title, type] = await titlePromise;
    bot.removeListener('title', persistentTitleListener);
    if (!format.expect(title, 'Test Title') || type !== 'title') {
      throw new Error(`Title test failed: expected "Test Title" but got "${title}" with type "${type}"`);
    }
    console.log('Basic title test passed');

    // Subtitle
    const persistentSubtitleListener = (title, type) => {
      console.log('[PERSISTENT] Received title event:', title, type);
    };
    bot.on('title', persistentSubtitleListener);
    const subtitlePromise = waitForTitle();
    bot.chat(`/title @a subtitle ${format.subtitle}`)
    console.log(`Sent command: /title @a subtitle ${format.subtitle}`)
    const [subtitle, subtitleType] = await subtitlePromise;
    bot.removeListener('title', persistentSubtitleListener);
    if (!format.expect(subtitle, 'Test Subtitle') || subtitleType !== 'subtitle') {
      throw new Error(`Subtitle test failed: expected "Test Subtitle" but got "${subtitle}" with type "${subtitleType}"`);
    }
    console.log('Subtitle test passed');

    // Times
    bot.chat(`/title @a times 20 40 20`)
    console.log(`Sent command: /title @a times 20 40 20`)
    await new Promise(res => setTimeout(res, 1000))

    // Combined title
    const persistentCombinedTitleListener = (title, type) => {
      console.log('[PERSISTENT] Received title event:', title, type);
    };
    bot.on('title', persistentCombinedTitleListener);
    const combinedTitlePromise = waitForTitle();
    bot.chat(`/title @a title ${format.combinedTitle}`)
    console.log(`Sent command: /title @a title ${format.combinedTitle}`)
    const [bothTitle, bothTitleType] = await combinedTitlePromise;
    bot.removeListener('title', persistentCombinedTitleListener);
    if (!format.expect(bothTitle, 'Combined Title') || bothTitleType !== 'title') {
      throw new Error(`Combined title test failed: expected "Combined Title" but got "${bothTitle}" with type "${bothTitleType}"`);
    }

    // Combined subtitle
    const persistentCombinedSubtitleListener = (title, type) => {
      console.log('[PERSISTENT] Received title event:', title, type);
    };
    bot.on('title', persistentCombinedSubtitleListener);
    const combinedSubtitlePromise = waitForTitle();
    bot.chat(`/title @a subtitle ${format.combinedSubtitle}`)
    console.log(`Sent command: /title @a subtitle ${format.combinedSubtitle}`)
    const [bothSubtitle, bothSubtitleType] = await combinedSubtitlePromise;
    bot.removeListener('title', persistentCombinedSubtitleListener);
    if (!format.expect(bothSubtitle, 'Combined Subtitle') || bothSubtitleType !== 'subtitle') {
      throw new Error(`Combined subtitle test failed: expected "Combined Subtitle" but got "${bothSubtitle}" with type "${bothSubtitleType}"`);
    }
    console.log('Combined title test passed');
    return // Success, exit the test
  } catch (err) {
    console.error(`Failed for version: ${bot.version}`)
    console.error(err)
  }
  throw new Error('Title command attempts failed')
}