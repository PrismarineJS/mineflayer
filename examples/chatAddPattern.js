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
var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node chatAddPattern.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "chatAddPattern",
  password: process.argv[5],
  verbose: true,
});

/*
 * NOTE: adding patterns does NOT overwrite previous patterns,
 * so if you want to use your bot in multiple servers it is safe to add
 * all the different patterns!
 */
bot.chatAddPattern(/^(?:\[[^\]]*\] )?([^ :]*) ?: (.*)$/, "chat", "Skyblock.net chat");
bot.chatAddPattern(/^\[ ?([^ ]*) -> me ?] (.*)$/, "whisper", "Skyblock.net whisper");

/*
 * The chat event now returns the username and message that match your
 * patterns, as well as the rawMessage that will be a json object on Vanilla
 * servers.
 *
 * Also note that the type argument is only used for server event messages
 * like player joining, player disconnected, etc.
 */
bot.on('chat', function(username, message, type, rawMessage, matches) {
  if(username === bot.username) return;
  console.log("Chat received!");
  console.log("Username: " + username);
  console.log("Message: " + message);
});
