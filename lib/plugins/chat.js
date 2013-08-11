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
    var jsonMsg, username, content;
    jsonMsg = JSON.parse(packet.message);
    bot.emit('message', jsonMsg);
    if (typeof jsonMsg.translate === 'string' && jsonMsg.translate.match(/^chat\./)) {
      username = jsonMsg.using[0];
      content = jsonMsg.using[1].replace(incomingFilter, '');
      bot.emit('chat', username, content, jsonMsg.translate, jsonMsg);
    }
    if (jsonMsg.translate === "commands.message.display.incoming") {
      username = jsonMsg.using[0];
      content = jsonMsg.using[1].replace(incomingFilter, '');
      bot.emit('whisper', username, content, jsonMsg.translate, jsonMsg);
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
