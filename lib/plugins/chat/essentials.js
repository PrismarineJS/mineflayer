
var ChatBukkit = require('./bukkit')
  , chatChars = require('./chars')
  , util = require('util')

function ChatEssentials(bot) {
  ChatBukkit.call(this, bot);
}
util.inherits(ChatEssentials, ChatBukkit);

ChatEssentials.prototype.onMessage = function(jsonMsg) {
  if (typeof jsonMsg.text === 'string') {
    var message = jsonMsg.text;
    var legalContent = message.replace(chatChars.incomingFilter, '');
    if (match = legalContent.match(/^\[(?:.+? )?(.+?) -> (?:.+?)\] (.*)$/)) {
      // whispered chat
      username = match[1];
      content = match[2];
      this.whisper(username, content, message);
    } else {
      ChatBukkit.prototype.onMessage.call(this, jsonMsg);
    }
  }
};

module.exports = ChatEssentials;

