
var ChatBase = require('./base')
  , util = require('util')

function ChatVanilla(bot) {
  ChatBase.call(this, bot, 'json');
}
util.inherits(ChatVanilla, ChatBase);

ChatVanilla.prototype.onMessage = function(jsonMsg) {
  var username, content;
  if (typeof jsonMsg.translate === 'string' && jsonMsg.translate.match(/^chat\./)) {
    // spoken chat
    username = jsonMsg.using[0];
    content = jsonMsg.using[1].replace(this.incomingFilter, '');
    this.chat(username, content, jsonMsg.translate, jsonMsg);
  } else if (jsonMsg.translate === 'commands.message.display.incoming') {
    // whispered chat
    username = jsonMsg.using[0];
    content = jsonMsg.using[1].replace(this.incomingFilter, '');
    this.whisper(username, content, jsonMsg.translate, jsonMsg);
  } else if (jsonMsg.translate === 'chat.type.announcement') {
    username = jsonMsg.using[0];
    content = jsonMsg.using[1].replace(this.incomingFilter, '');
    this.server(username, content, jsonMsg.translate, jsonMsg);
  }
};

module.exports = ChatVanilla;

