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

    // used by minecraft <= 1.6.1 and craftbukkit >= 1.6.2
    function parseOldMessage(message) {
      var legalContent = message.replace(incomingFilter, '');
      var match, username, content;
      if (match = legalContent.match(/^<(?:.+? )?(.+?)> (.*)$/)) {
        // spoken chat
        username = match[1];
        content = match[2];
        bot.emit('chat', username, content, message);
      } else if (match = legalContent.match(/^(?:.+? )?(.+?) (whispers to you:|whispers) (.*)$/)) {
        // whispered chat
        username = match[1];
        content = match[2];
        bot.emit('whisper', username, content, message);
      }
    }

    // used by minecraft >= 1.6.2
    function parseJsonMessage(jsonMessage) {
      var username, content;
      if (typeof jsonMsg.translate === 'string' && jsonMsg.translate.match(/^chat\./)) {
        // spoken chat
        username = jsonMsg.using[0];
        content = jsonMsg.using[1].replace(incomingFilter, '');
        bot.emit('chat', username, content, jsonMsg.translate, jsonMsg);
      } else if (jsonMsg.translate === "commands.message.display.incoming") {
        // whispered chat
        username = jsonMsg.using[0];
        content = jsonMsg.using[1].replace(incomingFilter, '');
        bot.emit('whisper', username, content, jsonMsg.translate, jsonMsg);
      } else if (typeof jsonMsg.text === 'string') {
        // craftbukkit message format
        parseOldMessage(jsonMsg.text);
      }
    }

    var jsonMsg;
    try {
      jsonMsg = JSON.parse(packet.message);
    } catch (e) {
      // old message format
      bot.emit('message', message);
      parseOldMessage(message);
      return;
    }
    bot.emit('message', jsonMsg);
    parseJsonMessage(jsonMsg)
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
