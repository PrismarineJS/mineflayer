var assert = require('assert')
  , quoteMeta = require('quotemeta')
  , ChatMessage = require('../chat_message')
  , LEGAL_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»§'
  , CHAT_LENGTH_LIMIT = 100

module.exports = inject;

var quotedLegalChars = quoteMeta(LEGAL_CHARS);
var incomingFilter = new RegExp("([^" + quotedLegalChars + "]|§.)", 'g');
var outgoingFilter = new RegExp("([^" + quotedLegalChars + "])", 'g');

function inject(bot) {
  bot.client.on('chat', function(packet) {

    // used by minecraft <= 1.6.1 and craftbukkit >= 1.6.2
    function parseOldMessage(message) {
      var legalContent = message.replace(incomingFilter, '');
      var match, username, content;
      if (match = legalContent.match(/^<(?:.+? )?(.+?)> (.*)$/)) {
        // spoken chat
        username = match[1];
        content = match[2];
        bot.emit('chat', username, content, message);
      } else if (match = legalContent.match(/^(?:.+? )?(.+?) (?:whispers to you:|whispers) (.*)$/)) {
        // whispered chat
        username = match[1];
        content = match[2];
        bot.emit('whisper', username, content, message);
      }
    }

    /**
     * Parse 1.6.* version message
     * @param  {JSONObject} jsonMessage
     * @return {void}
     */
    function parseJsonMessage6(jsonMessage) {
      if (typeof jsonMsg.translate === 'string' && jsonMsg.translate.match(/^chat\./)) {
        var username = jsonMsg.using[0];
        var content = jsonMsg.using[1].replace(incomingFilter, '');
        bot.emit('chat', username, content, jsonMessage.translate, jsonMessage)
      } else if (jsonMsg.translate === "commands.message.display.incoming") {
        username = jsonMsg.using[0];
        content = jsonMsg.using[1].replace(incomingFilter, '');
        bot.emit('whisper', username, content, jsonMsg.translate, jsonMsg);
      } else if (typeof jsonMsg.text === 'string') {
        // craftbukkit message format
        parseOldMessage(jsonMsg.text);
      }
      bot.emit('message', jsonMsg);
    }

    /**
     * Parse 1.7+ version message
     * @param  {JSONObject} jsonMessage
     * @return {void}
     */
    function parseJsonMessage7(jsonMessage) {
      var chatMessage = new ChatMessage(jsonMessage);
      bot.emit('message', chatMessage);
      // Now parse the message type
      switch(chatMessage.translate) {
        case undefined: {
          parseOldMessage(chatMessage.toString());
          break;
        }
        case 'chat.type.text': {
          var username = chatMessage.getText(0);
          var extendedMessage = chatMessage.toString().substring(username.length).trim();
          bot.emit('chat', username, extendedMessage, chatMessage.translate, chatMessage);
          break;
        }
        case 'commands.message.display.incoming': {
          var username = chatMessage.getText(0);
          var extendedMessage = chatMessage.toString().substring(username.length).trim();
          bot.emit('whisper', username, extendedMessage, chatMessage.translate, chatMessage);
          break;
        }
      }
    }

    // used by minecraft >= 1.6.2
    function parseJsonMessage(jsonMessage) {
      if(jsonMessage.using) {
        parseJsonMessage6(jsonMessage);
      }else {
        parseJsonMessage7(jsonMessage);
      }      
    }

    var jsonMsg;
    // Honestly we should be checking against the server version
    try {
      jsonMsg = JSON.parse(packet.message);
    } catch (e) {
      // old message format
      bot.emit('message', packet.message);
      parseOldMessage(packet.message);
      return;
    }
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
        bot.client.write('chat', {message: smallMsg});
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
