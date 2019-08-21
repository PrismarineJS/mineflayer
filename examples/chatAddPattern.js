/*
 * How to add chat patterns to support your own server
 *
 * Adding more chat patterns is really simple.
 *
 * Use the Vanilla Launcher with visibility set to keep the Launcher open
 * so you can see the raw messages.
 *
 * Copy the raw message into regexr.com or otherwise write a regex statement
 * to match the username and the message.
 *
 * Add pattern, chat type, and an optional description with bot.chatAddPattern()
 *
 * Below you can see an example for the skyblock.net server
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node chatAddPattern.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'chatAddPattern',
  password: process.argv[5]
})

/*
 * Add chat patterns after creating the bot like so.
 * NOTE: adding patterns does NOT overwrite previous patterns,
 * so if you want to use your bot in multiple servers it is safe to add
 * multiple "whisper" and "chat" patterns in the same bot.
 */
bot.chatAddPattern(/^(?:\[[^\]]*\] )?([^ :]*) ?: (.*)$/, 'chat', 'Skyblock.net chat')
bot.chatAddPattern(/^\[ ?([^ ]*) -> me ?] (.*)$/, 'whisper', 'Skyblock.net whisper')

/*
 * The chat event returns username as the first regex match and message as the second match
 * type argument is only used for server event messages like player joining, player disconnected, etc.
 * rawMessage is the JSON object (vanillia) or the raw string (spigot/bukkit/other) the server sent.
 * matches is the regex.matches object containing all matches
 */
bot.on('chat', (username, message, type, rawMessage, matches) => {
  if (username === bot.username) return
  console.log('Chat received!')
  console.log(`Username: ${username}`)
  console.log(`Message: ${message}`)

  /*
   * Using the matches object, you could get the same output using
   * console.log("Username: " + matches[1]); and
   * console.log("Message: " + matches[2]);
   */
})

/*
 * ADVANCED USEAGE - creating your own events!
 * It is also possible to set up custom events using the chat handler. For instance:
 */
bot.chatAddPattern(/^\s?It is \[-\] ([^\s]+) first visit[^!]*!$/, 'welcome', 'Welcome message')

/*
 * This pattern will trigger a bot.on('welcome') event, with the same peramiters as described above.
 * This is very useful for making a bot respond to eg Auction plugin messages directly.
 * In this instance, chat messages matching this pattern would be handled like so
 */
bot.on('welcome', (username, message, type, rawMessage, matches) => {
  if (username === bot.username) return
  console.log(`Welcome ${username}to the server!`)
})
