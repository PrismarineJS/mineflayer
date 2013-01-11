var assert = require('assert')
  , quoteMeta = require('quotemeta')
  , LEGAL_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»'
  , CHAT_LENGTH_LIMIT = 100

module.exports = inject;

var legalRe = new RegExp("[^" + quoteMeta(LEGAL_CHARS) + "]", 'g');

function inject(bot) {
  bot.client.on(0x03, function(packet) {
    var message = packet.message;
    var match = message.match(/^<(?:.+? )?(.+?)> (.*)$/);
    if (match) {
      // spoken chat
      var username = match[1];
      var content = match[2];
      bot.emit('chat', username, content, message);
    } else {
      // non-spoken chat
      var legalMsg = message.replace(legalRe, '');
      bot.emit('nonSpokenChat', legalMsg, message);
    }
  });
  bot.chat = function(message) {
    message = message.replace(legalRe, '');
    var header = "";
    var match = message.match(/^\/tell\s+(.+?)\s+(.+)$/);
    if (match) {
      // repeat any "/tell <username> " header on all the chat messages.
      header = "/tell " + match[1] + " ";
      message = match[2];
    }
    var lengthLimit = CHAT_LENGTH_LIMIT - header.length;
    message.split("\n").forEach(function(subMessage) {
      if (! subMessage) return;
      var i, smallMsg;
      for (i = 0; i < subMessage.length; i += lengthLimit) {
        smallMsg = header + subMessage.substring(i, i + lengthLimit);
        bot.client.write(0x03, {message: smallMsg});
      }
    });
  };
}
