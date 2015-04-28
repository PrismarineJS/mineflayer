var assert = require('assert');
var quoteMeta = require('quotemeta');
var ChatMessage = require('../chat_message');
var LEGAL_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»§';
var CHAT_LENGTH_LIMIT = 100;

module.exports = inject;

var quotedLegalChars = quoteMeta(LEGAL_CHARS);
var incomingFilter = new RegExp("([^" + quotedLegalChars + "]|§.)", 'g');
var outgoingFilter = new RegExp("([^" + quotedLegalChars + "])", 'g');


//module.exports = function inject(bot) {
function inject(bot) {

	// add an array, containing objects such as {pattern:/regex pattern/, chatType:"string", discription:"string"}
	// chat.pattenr.type will emit an event for bot.on() of the same type, eg chatType = whisper will trigger bot.on('whisper')
	// Default patterns for matching vanilla chat.
	bot.chatPatterns = [
		{ pattern:/^<(?:.+? )?(.+?)> (.*)$/, type:"chat", discription:"Vanilla chat" },
		{ pattern:/^(?:.+? )?(.+?) (?:whispers to you:|whispers) (.*)$/, type:"whisper", discription:"Vanilla whisper" }
	],

	bot.chatAddPattern = function( patternValue, typeValue, discriptionValue ) {
		// discription is not required but recommended
		if (typeof discriptionValue === 'undefined') { discriptionValue = 'None'; };
		bot.chatPatterns.push( {pattern:patternValue, type:typeValue, discription:discriptionValue} );
	}

  bot._client.on('chat', function(packet) {

    // function now used to process "unidentified" messages, such as chat and from bikkit servers
    function parseOldMessage(message) {
      var legalContent = message.replace(incomingFilter, '');
      var match, username, content;

			// iterate through each object in chat.patterns array.
			// chat.pattern object format: { pattern, type, description}
			// chat.pattenr.type will emit an event for bot.on() of the same type
			for (i = 0; i < bot.chatPatterns.length; i++) {
				if (match = legalContent.match( bot.chatPatterns[i].pattern ) ) {
					//console.log("Bot found chat matching pattern '"+bot.chatPatterns[i].discription+"'")
					username = match[1];
					content = match[2];
					bot.emit(bot.chatPatterns[i].type, username, content, message, match);
				}
			}
		}


    /**
     * Parse 1.6.* version message
     * @param  {JSONObject} jsonMessage
     * @return {void}
     */
    function parseJsonMessage6(jsonMessage) {
      var username;
      var content;
      if (typeof jsonMsg.translate === 'string' && jsonMsg.translate.match(/^chat\./)) {
        username = jsonMsg.using[0];
        content = jsonMsg.using[1].replace(incomingFilter, '');
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
			//~ console.log("parseJsonMessage7")
      var chatMessage = new ChatMessage(jsonMessage);
      bot.emit('message', chatMessage);
      // Now parse the message type
      var username;
      var extendedMessage;
      switch(chatMessage.translate) {
        case undefined: {
          parseOldMessage(chatMessage.toString());
          break;
        }
        case 'chat.type.text': {
          username = chatMessage.getText(0);
          extendedMessage = chatMessage.toString().substring(username.length).trim();
          bot.emit('chat', username, extendedMessage, chatMessage.translate, chatMessage);
          break;
        }
        case 'commands.message.display.incoming': {
          username = chatMessage.getText(0);
          extendedMessage = chatMessage.toString().substring(username.length).trim();
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
  } );

  function chatWithHeader(header, message) {
    message = message.replace(outgoingFilter, '');
    var lengthLimit = CHAT_LENGTH_LIMIT - header.length;
    message.split("\n").forEach(function(subMessage) {
      if (! subMessage) return;
      var i, smallMsg;
      for (i = 0; i < subMessage.length; i += lengthLimit) {
        smallMsg = header + subMessage.substring(i, i + lengthLimit);
        bot._client.write('chat', {message: smallMsg});
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
