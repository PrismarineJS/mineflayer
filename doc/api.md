# API

## Classes

### mineflayer.Vec3

See [superjoe30/node-vec3](https://github.com/superjoe30/node-vec3)

All points in mineflayer are supplied as instances of this class.

 * x - south
 * y - up
 * z - west

## Bot

### Properties

#### bot.username

Use this to find out your own name.

#### bot.game.spawnPoint

Coordinates to the main spawn point, where all compasses point to.

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.worldHeight

#### bot.game.maxPlayers

### Events

#### "chat" (username, message, rawMessage)

 * `username` - who said the message
 * `message` - stripped of any control characters
 * `rawMessage` - unmodified message from the server

#### "nonSpokenChat" (message, rawMessage)

 * `message` - stripped of all control characters
 * `rawMessage` - unmodified message from the server

### Methods

#### chat(message)

Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary. If message begins with "/tell <username> ", then all split messages will be whispered as well.

#### spawn()

Spawn is called automatically upon login and death. If you wish to
disable this behavior and do it manually, pass `autoSpawn` `false`
to the `options` argument of `createBot`.
