var mineflayer = require('../');
var vec3 = mineflayer.vec3;

process.argv = ["","","127.0.0.1","52683","one.hot.mocha@gmail.com","aqha4686706"]
process.argv = ["","","skyblock.net","25565","one.hot.mocha@gmail.com","aqha4686706"]

if(process.argv.length<3)
{
    console.log("Usage : node digger.js <host> <port> [<name>] [<password>]");
    process.exit(1);
}
var bot = mineflayer.createBot({
    username: process.argv[4] ? process.argv[4] : "digger",
    verbose: true,
    port:parseInt(process.argv[3]),
    host:process.argv[2],
    password:process.argv[5]
});
console.log(process.argv[4])

// Adding patterns really is this simple
// use vannilla launcher with visibility set to keep launcher open to get raw messages
// Copy into regexr.com or other wise write a regex statement matching the username an whatever else
// Add pattern, chat type, and a discription (optional) with bot.ChatAddPattern( {} )
bot.chatAddPattern( /^(?:\[[^\]]*\] )?([^ :]*) ?: (.*)$/, "chat", "Skyblock.net chat")
bot.chatAddPattern( /^\[([^ ]*) -> me ] (.*)$/, "whisper", "Skyblock.net whisper")

// Also note, adding patterns does NOT overwrite previous patterns, so if you use a script with multiple
// servers it is safe to add all the patterns.

// The chat function now returns the raw Regex matches as well as the raw message
// rawMessage will be json object on vanilla servers
bot.on('chat', function(username, message, rawMessage, matches) {
  console.log("Chat recieved! Username:"+username+"	Message:"+message)
	//console.log(rawMessage)
	//console.log(matches)
});

bot.on('game', function() {
  console.log("game mode is " + bot.game.gameMode);
});
