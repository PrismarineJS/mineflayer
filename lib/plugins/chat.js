var assert = require('assert')
  , quoteMeta = require('quotemeta')
  , LEGAL_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»§'
  , CHAT_LENGTH_LIMIT = 100

module.exports = inject;

var quotedLegalChars = quoteMeta(LEGAL_CHARS);
var incomingFilter = new RegExp("([^" + quotedLegalChars + "]|§.)", 'g');
var outgoingFilter = new RegExp("([^" + quotedLegalChars + "])", 'g');

function inject(bot) {
  bot.client.on(0x03, function(packet) {
    var message = packet.message;
    var legalContent = message.replace(incomingFilter, '');
    bot.emit('message', legalContent, message);
    var match, username, content;
    if (match = legalContent.match(/^<(?:.+? )?(.+?)> (.*)$/)) {
      // spoken chat
      username = match[1];
      content = match[2];
      bot.emit('chat', username, content, message);
    } else if (match = legalContent.match(/^(?:.+? )?(.+?) whispers to you: (.*)$/)) {
      // whispered chat
      username = match[1];
      content = match[2];
      bot.emit('whisper', username, content, message);
    }
  });
  function chatWithHeader(header, message) {
    message = message.replace(outgoingFilter, '');
    var lengthLimit = CHAT_LENGTH_LIMIT - header.length;
    message.split("\n").forEach(function(subMessage) {
      if (! subMessage) return;
      var i, smallMsg;
      for (i = 0; i < subMessage.length; i += lengthLimit) {
        smallMsg = header + subMessage.substring(i, i + lengthLimit);
        bot.client.write(0x03, {message: smallMsg});
      }
    });
  }
  bot.whisper = function(username, message) {
    chatWithHeader("/tell " + username + " ", message);
  };
  bot.chat = function(message) {
    chatWithHeader("", message);
  };
}
