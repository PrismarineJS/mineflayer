/*
 * This examples show the usage of the task queue class in order to help
 * make your code look cleaner when running lots of nested async tasks.
 *
 * This is helpful to preventing "pyramid of doom"-style callback nesting.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node taskqueuer.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'TaskQueueBot',
  password: process.argv[5]
})

bot.on('spawn', () => {
  const queue = new mineflayer.TaskQueue()
  const entity = bot.player.entity

  // Through the use of a task queuer, we can add a lot of nested actions to the queue
  // Each task is called inside the callback of the previous task.

  queue.add(cb => setTimeout(cb, 5000)) // Works on any async function
  queue.addSync(() => bot.chat('Going to mine down 10 blocks')) // Support for sync functions, too.

  for (let i = 1; i <= 10; i++) {
    queue.add(cb => setTimeout(cb, 1000)) // Works on any async function
    queue.add(cb => bot.dig(bot.blockAt(entity.position.offset(0, -1, 0)), cb)) // Make sure to pass the cb into the callback!
    queue.add(cb => setTimeout(cb, 50))
    queue.addSync(() => bot.chat(`Mined block ${i}`))
  }

  // After making the queue, call 'runAll' to execute it. You can add an optional callback when it's done.
  queue.runAll(() => bot.chat('All done!'))
})
