/*
 *
 * A simple a simple Screenshot demo for https://github.com/PrismarineJS/prismarine-viewer
 *
 */

const mineflayer = require('mineflayer')
const { Viewer, WorldView, getBufferFromStream } = require('prismarine-viewer').viewer
global.Worker = require('worker_threads').Worker

const THREE = require('three')
const { createCanvas } = require('node-canvas-webgl/lib')
const fs = require('fs').promises
const { Vec3 } = require('vec3')
const { EventEmitter } = require('events')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node screenshot.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'screenshot',
  password: process.argv[5]
})

bot.on('spawn', async () => {
  await bot.waitForChunksToLoad()
  const camera = new Camera(bot)
  camera.on('ready', async () => {
    await camera.takePicture(new Vec3(1, -0.2, 0), 'screenshot1')
  })
})

bot.on('error', (err) => {
  console.error(err)
})

class Camera extends EventEmitter {
  constructor (bot) {
    super()
    this.bot = bot
    this.viewDistance = 4
    this.width = 512
    this.height = 512
    this.canvas = createCanvas(this.width, this.height)
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
    this.viewer = new Viewer(this.renderer)
    this._init().then(() => {
      this.emit('ready')
    })
  }

  async _init () {
    const botPos = this.bot.entity.position
    const center = new Vec3(botPos.x, botPos.y + 10, botPos.z)
    this.viewer.setVersion(this.bot.version)

    // Load world
    const worldView = new WorldView(this.bot.world, this.viewDistance, center)
    this.viewer.listen(worldView)

    this.viewer.camera.position.set(center.x, center.y, center.z)

    await worldView.init(center)
  }

  async takePicture (direction, name) {
    const cameraPos = new Vec3(this.viewer.camera.position.x, this.viewer.camera.position.y, this.viewer.camera.position.z)
    const point = cameraPos.add(direction)
    this.viewer.camera.lookAt(point.x, point.y, point.z)
    console.info('Waiting for world to load')
    await new Promise(resolve => setTimeout(resolve, 5000))
    this.renderer.render(this.viewer.scene, this.viewer.camera)

    const imageStream = this.canvas.createJPEGStream({
      bufsize: 4096,
      quality: 100,
      progressive: false
    })
    const buf = await getBufferFromStream(imageStream)
    let stats
    try {
      stats = await fs.stat('./screenshots')
    } catch (e) {
      if (!stats?.isDirectory()) {
        await fs.mkdir('./screenshots')
      }
    }
    await fs.writeFile(`screenshots/${name}.jpg`, buf)
    console.log('saved', name)
  }
}
