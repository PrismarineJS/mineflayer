var mineflayer = require('../');

//Example for matching chat on skyblock.net.

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

// Adding patterns really is this simple
// use vanilla launcher with visibility set to keep launcher open to get raw messages
// Copy into regexr.com or other wise write a regex statement matching the username an whatever else
// Add pattern, chat type, and a description (optional) with bot.ChatAddPattern( {} )
bot.chatAddPattern(/^(?:\[[^\]]*\] )?([^ :]*) ?: (.*)$/, "chat", "Skyblock.net chat")
bot.chatAddPattern(/^\[ ?([^ ]*) -> me ?] (.*)$/, "whisper", "Skyblock.net whisper")
// Also note, adding patterns does NOT overwrite previous patterns, so if you use a script with multiple
// servers it is safe to add all the patterns.

// The chat function now returns the raw Regex matches as well as the raw message
// rawMessage will be json object on vanilla servers
// Also note, type is only used for server event messages, like player joining, player disconnected, etc
bot.on('chat', function(username, message, type, rawMessage, matches) {
  console.log("Chat received! Username:" + username + "	Message:" + message)
  //console.log(rawMessage)
  //console.log(matches)
});
