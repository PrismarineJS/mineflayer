
var ChatBase = require('./base')
  , util = require('util')

function ChatVanillaOld(bot) {
  ChatBase.call(this, bot, 'plain');
}
util.inherits(ChatVanillaOld, ChatBase);

ChatVanillaOld.prototype.onMessage = function(msg) {
  this.parseOldMessage(msg);
};

module.exports = ChatVanillaOld;

