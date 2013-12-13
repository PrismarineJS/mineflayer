
var assert = require('assert')
  , chatChars = require('./chars')

function ChatBase(bot, format) {
  format = typeof format === 'undefined' ? 'plain' : format;
  this.bot = bot;
  this.incomingFilter = chatChars.incomingFilter;
  assert.ok(typeof format === 'string', 'incorrect chat format.');
  bot.on('message.' + format, this.onMessage.bind(this));
}

// used by minecraft <= 1.6.1 and craftbukkit >= 1.6.2
ChatBase.prototype.parseOldMessage = function(message) {
  var legalContent = message.replace(chatChars.incomingFilter, '');
  var match, username, content;
  if (match = legalContent.match(/^<(?:.+? )?(.+?)> (.*)$/)) {
    // spoken chat
    username = match[1];
    content = match[2];
    this.chat(username, content, message);
  } else if (match = legalContent.match(/^(?:.+? )?(.+?) (whispers to you:|whispers) (.*)$/)) {
    // whispered chat
    username = match[1];
    content = match[2];
    this.whisper(username, content, message);
  } else if (match = legalContent.match(/^\[(?:.+? )?(.+?)\] (.*)$/)) {
    // server chat
    username = match[1];
    content = match[2];
    this.server(username, content, message);
  }
}

ChatBase.prototype.onMessage = function(message) {
  console.log(message);
};

ChatBase.prototype.chat = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('chat');
  this.bot.emit.apply(this.bot, args);
};

ChatBase.prototype.whisper = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('whisper');
  this.bot.emit.apply(this.bot, args);
};

ChatBase.prototype.server = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('server');
  this.bot.emit.apply(this.bot, args);
};

module.exports = ChatBase;
