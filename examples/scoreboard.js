/*
 * A simple example to show the display board functionality
 */
var mineflayer = require('mineflayer');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node scoreboard.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "scoreboard",
  password: process.argv[5],
  verbose: true
});

// /scoreboard objectives add Kills totalKillCount
// /scoreboard objectives setDisplay sidebar Kills
bot.on('scoreboardObjective',function(name,text){
  bot.chat("Scoreboard objective : "+name+", "+text);
  console.log(bot.scoreboards);
});

bot.on('scoreboardDisplayObjective',function(name, position){
  bot.chat("Display scoreboard : "+name+", "+position);
  console.log(bot.scoreboards);
});

// kill a mob for this to be displayed
bot.on('scoreboardScore',function(scoreName,itemName,value){
  bot.chat("Scoreboard score : "+scoreName+", "+itemName+", "+value);
  console.log(bot.scoreboards);
});
