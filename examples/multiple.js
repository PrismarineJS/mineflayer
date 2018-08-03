const mineflayer = require('mineflayer')

if (process.argv.length < 3 || process.argv.length > 5) {
	console.log('Usage : node multiple.js <host> <port>')
	process.exit(1)
}

let bots = []

newClient('Client', null, 5)

function newClient(username, password, quantity) {
	if (typeof quantity != 'number') throw 'Quantity must be a number!'
	for (let i = 0; i < quantity; i++) {
		if (password === null) {
			bots[bots.length] = mineflayer.createBot({
				host: process.argv[2],
				port: process.argv[3],
				username: username + i,
				checkTimeoutInterval: 60 * 10000
			})
		} else {
			bots[bots.length] = mineflayer.createBot({
				host: process.argv[2],
				port: process.argv[3],
				username: username + i,
				password: password,
				checkTimeoutInterval: 60 * 10000
			})
		}
	}
}
