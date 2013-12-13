var mineflayer = require('../')
  , ChatBase = require('../lib/plugins/chat/base')
  , chatChars = require('../lib/plugins/chat/chars')
  , util = require('util')

function ChatHeroChat(bot) {
  ChatBase.call(this, bot, 'json');
}
util.inherits(ChatHeroChat, ChatBase);

ChatHeroChat.prototype.onMessage = function(jsonMsg) {
  if (typeof jsonMsg.text === 'string') {
    var message = jsonMsg.text;
    var legalContent = message.replace(chatChars.incomingFilter, '');
    var match, channel, username, content;
    if (match = legalContent.match(/^\[(.+?)\] (.+?): (.*)$/)) {
      // spoken chat
      channel = match[1];
      username = match[2];
      content = match[3];
      this.chat(username, content, message);
    } else if (match = legalContent.match(/^\[(.+?)\] (.*)$/)) {
      // server chat
      username = match[1];
      content = match[2];
      this.server(username, content, message);
    } else if (match = legalContent.match(/^From (.+?): (.*)$/)) {
      // whispered chat
      username = match[1];
      content = match[2];
      this.whisper(username, content, message);
    }
  }
};

var bot = mineflayer.createBot({
  username: 'herochat',
  chat_plugin: ChatHeroChat,
});

bot.on('chat', function(username, message) {
  console.log(username + ": " + message);
});

bot.on('whisper', function(username, message) {
  console.log(username + " whispers: " + message);
});

bot.on('server', function(username, message) {
  console.log("[" + username + "]: " + message);
});
