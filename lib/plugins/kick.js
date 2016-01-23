module.exports = inject;

function inject(bot) {
  bot._client.on('kick_disconnect', function(packet) {
    bot.emit('kicked', packet.reason, true);
  });
  bot._client.on('disconnect', function(packet) {
    bot.emit('kicked', packet.reason, false);
  });
  bot.quit = function(reason) {
    reason = reason || 'disconnect.quitting';
    bot._client.end(reason);
  };
}
