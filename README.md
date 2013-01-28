# Mineflayer

Create Minecraft bots with a powerful, stable, and high level JavaScript API.

## Features

 * Supports Minecraft 1.4.7.
 * Entity knowledge - it knows when and where players, mobs, and objects spawn
   and despawn.
 * Block knowledge. You can query the world around you.
 * Basic physics and movement - currently blocks are either "solid" or "empty".
 * Attacking entities and using vehicles.
 * Inventory management.
 * Digging and building.
 * Miscellaneous stuff such as knowing your health and whether it is raining.
 * Crafting.
 * Chat.

### Roadmap

These things are in the works:

 * Ability to activate blocks and use items.
 * Chests, dispensers, brewing stands, anvils, etc.
 * Better physics (support doors, ladders, water, etc).

## Usage

### Echo Example
```js
var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({
  host: "localhost", // optional
  port: 25565,       // optional
  username: "player",
  email: "email@example.com", // email and password are required only for
  password: "12345678",       // online-mode=true servers
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
```

#### More Examples

 * In the examples folder.
 * [vogonistic's REPL bot](https://gist.github.com/4631678)

## Third Party Plugins

Mineflayer is pluggable; anyone can create a plugin that adds an even
higher level API on top of Mineflayer.

 * [navigate](https://github.com/superjoe30/mineflayer-navigate/) - get around
   easily using A* pathfinding. [YouTube Demo](http://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/superjoe30/mineflayer-radar/) - web based radar
   interface using canvas and socket.io. [YouTube Demo](http://www.youtube.com/watch?v=FjDmAfcVulQ)

## Projects Using Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [Contra/minebot](https://github.com/Contra/minebot)

## Installation

### Linux / OSX

`npm install mineflayer`

### Windows

1. Follow the Windows instructions from
   [node-minecraft-protocol](https://github.com/superjoe30/node-minecraft-protocol#windows)
2. `npm install mineflayer`

## Documentation

 * See [doc/api.md](https://github.com/superjoe30/mineflayer/blob/master/doc/api.md).
 * See [doc/history.md](https://github.com/superjoe30/mineflayer/blob/master/doc/history.md).
 * See [examples/](https://github.com/superjoe30/mineflayer/tree/master/examples).

## Testing

`npm test`

## Updating to a newer protocol version

1. Wait for a new version of
   [mineflayer-protocol](https://github.com/superjoe30/node-minecraft-protocol)
   to be released which supports the new Minecraft version.
2. `npm install --save minecraft-protocol@latest`
3. Apply the [protocol changes](http://wiki.vg/Protocol_History) where necessary.
4. Run the test suite. See Testing above.
