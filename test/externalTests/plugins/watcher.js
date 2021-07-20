const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').headless
module.exports = port => {
  global.THREE = require('three')
  global.Worker = require('worker_threads').Worker
  const { createCanvas, ImageData } = require('node-canvas-webgl/lib')

  // Patch global scope to imitate browser environment.
  global.window = global
  global.ImageData = ImageData
  global.document = {
    createElement: (nodeName) => {
      if (nodeName !== 'canvas') throw new Error(`Cannot create node ${nodeName}`)
      const canvas = createCanvas(256, 256)
      return canvas
    },
    type: 'synthetic'
  }

  const bot = mineflayer.createBot({
    username: 'watcher_bot',
    host: 'localhost',
    port
  })

  bot.once('spawn', () => {
    mineflayerViewer(bot, { output: 'output.mp4', frames: -1, width: 512, height: 512 })
  })
}
