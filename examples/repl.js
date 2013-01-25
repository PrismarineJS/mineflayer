// REPL example bot
//
// Connects to server but doesn't have any built in logic. The terminal where
// it was started is now a REPL (Read-Eval-Print-Loop). Anything typed will be
// interpreted as javascript printed using util.inspect. Don't forget to try
// tab completion. These variables are exposed as local:
//
// var mineflayer = require('mineflayer');
// var bot = mineflayer.createBot({ username: 'REPL' });
//
// Examples:
//
// Navigate to named player (requires optional mineflayer-navigate):
// bot.navigate.to(bot.players.vogonistic.entity.position)

var fs = require('fs');
var os = require('os');
var path = require('path');
var repl = require('repl');

// create and connect the bot
var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({ username: 'REPL' });
bot.on('chat', function(username, message) {
  console.log(username+' says: '+message)
});
bot.on('login', function() {
  console.log(bot.username+' logged in.');
});

// optional navigation support
try {
  var navigatePlugin = require('mineflayer-navigate')(mineflayer);
  navigatePlugin(bot);
  bot.navigate.on('pathFound', function (path) {
    console.log('navigate: found path. I can get there in ' + path.length + ' moves.');
  });
  bot.navigate.on('cannotFind', function () {
    console.log('navigate: unable to find path');
  });
  bot.navigate.on('arrived', function () {
    console.log('navigate: I have arrived');
  });
  bot.navigate.on('stop', function() {
    console.log('navigate: stopping');
  });
  
  console.log('Info: mineflayer-navigate enabled.')
} catch(err) {
  console.log('Info: Optional mineflayer-navigate module not installed, so no navigation support.')
}

// create repl interface
var historyFile = path.join(os.tmpDir(), 'bot_repl_history.json')
var r = repl.start('> ');
r.context.bot = bot;
r.context.mineflayer = mineflayer;
r.on('exit', function onExitSaveHistory() {
  // ensure the history are available during the next sessions again
  console.log('quitting.');
  bot.quit();
  fs.writeFile(historyFile, JSON.stringify(r.rli.history), function(err) {
    process.exit();
  })
});

// load repl history
fs.readFile(historyFile, function onLoadReadHistory(err, data) {
  if (!err && data) {
    r.rli.history = JSON.parse(data);
  }
});
