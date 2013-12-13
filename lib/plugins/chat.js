var assert = require('assert')
  , chatChars = require('./chat/chars')

module.exports = inject;

function inject(bot) {
  bot.client.on(0x03, function(packet) {
    if (bot.listeners('message').length > 0) {
      bot.emit('message', packet.message);
    }
    if (bot.listeners('message.json').length > 0) {
      var jsonMsg;
      try {
        jsonMsg = JSON.parse(packet.message);
      } catch (e) {
        bot.emit('error', e);
      }
      if (typeof jsonMsg !== 'undefined') {
        bot.emit('message.json', jsonMsg);
      }
    } else if (bot.listeners('message.plain').length > 0) {
      bot.emit('message.plain', packet.message);
    }
  });

  var Chat = bot.chat_plugin;
  if (typeof Chat === 'string') {
    try {
      Chat = require('./chat/' + Chat)
    } catch(e) {
      bot.emit('error', 'Error loading chat plugin: ' + e);
    }
  }
  if (typeof Chat === 'function') {
    new Chat(bot);
  } else {
    bot.emit('error', 'No chat plugin loaded.');
  }

  function chatWithHeader(header, message) {
    message = message.replace(chatChars.outgoingFilter, '');
    var lengthLimit = chatChars.lengthLimit - header.length;
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
