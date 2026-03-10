const net = require('net')

const getPort = () => new Promise(resolve => {
  resolve(25565)
  // const server = net.createServer()
  // server.listen(0, '127.0.0.1')
  // server.on('listening', () => {
  //   const { port } = server.address()
  //   server.close(() => resolve(port))
  // })
})

module.exports = { getPort }
