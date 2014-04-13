module.exports = inject;

function inject(bot) {
  bot.client.on('kick_disconnect', function(packet) {
    bot.emit('kicked', packet.reason);
  });
  bot.quit = function(reason) {
    reason = reason || 'disconnect.quitting';
    bot.client.end(reason);
  };
}
