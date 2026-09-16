module.exports = function (bot, server, done) {
  if (!bot.supportFeature('sendsClientTickEndPacket')) return this.skip()
  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    client.write('position', {
      x: 1.5,
      y: 66,
      z: 1.5,
      dx: 0,
      dy: 0,
      dz: 0,
      pitch: 0,
      yaw: 0,
      teleportId: 0,
      flags: bot.registry.version['>=']('1.21.3') ? {} : 0
    })
    let ticks = 0
    client.on('tick_end', () => { if (++ticks === 5) done() })
  })
}
