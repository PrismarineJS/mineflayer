
var ChatBase = require('./base')
  , util = require('util')

function ChatBukkit(bot) {
  ChatBase.call(this, bot, 'json');
}
util.inherits(ChatBukkit, ChatBase);

ChatBukkit.prototype.onMessage = function(jsonMsg) {
  if (typeof jsonMsg.text === 'string') {
    this.parseOldMessage(jsonMsg.text);
  }
};

module.exports = ChatBukkit;

