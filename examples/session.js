var mineflayer = require('mineflayer');
var path = require('path');

if(process.argv.length !== 5) {
  console.log("Usage : node session.js <host> <port> <pathToLauncherProfiles>");
  process.exit(1);
}

var profile = require(path.resolve(process.argv[4], 'launcher_profiles.json'));
var auth = profile.authenticationDatabase[profile.selectedUser];

var session = {
  accessToken: auth.accessToken,
  clientToken: profile.clientToken,
  selectedProfile: {
    id: profile.selectedUser,
    name: auth.displayName
  }
};

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  session: session
});

bot.once('login', function() {
  console.log('loged in');
  bot.quit();
});
