# Mineflayer
[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer) 
[![Build Status](https://circleci.com/gh/PrismarineJS/mineflayer.svg?style=shield)](https://circleci.com/gh/PrismarineJS/mineflayer)
[![Join the chat at https://gitter.im/PrismarineJS/mineflayer](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/PrismarineJS/mineflayer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Create Minecraft bots with a powerful, stable, and high level JavaScript API.

## Features

 * Supports Minecraft 1.8.9.
 * Entity knowledge and tracking.
 * Block knowledge. You can query the world around you.
 * Basic physics and movement - currently blocks are either "solid" or "empty".
 * Attacking entities and using vehicles.
 * Inventory management.
 * Crafting, chests, dispensers, enchantment tables.
 * Digging and building.
 * Miscellaneous stuff such as knowing your health and whether it is raining.
 * Activating blocks and using items.
 * Chat.

### Roadmap

 * Brewing stands, and anvils.
 * Better physics (support doors, ladders, water, etc).

## Usage

### Echo Example
```js
var mineflayer = require('mineflayer');
var bot = mineflayer.createBot({
  host: "localhost", // optional
  port: 25565,       // optional
  username: "email@example.com", // email and password are required only for
  password: "12345678",          // online-mode=true servers
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
```

#### More Examples

 * In the [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) folder.
 * [vogonistic's REPL bot](https://gist.github.com/vogonistic/4631678)

## Third Party Plugins

Mineflayer is pluggable; anyone can create a plugin that adds an even
higher level API on top of Mineflayer.

 * [navigate](https://github.com/andrewrk/mineflayer-navigate/) - get around
   easily using A* pathfinding. [YouTube Demo](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - web based radar
   interface using canvas and socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - find blocks in the 3D world
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - get to
   a target destination even if you have to build or break blocks to do so.
   [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - chat-based bot authentication
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - automatic armor managment

## Projects Using Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - building a spiral staircase](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicating a building](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualize what
   the bot is up to using voxel.js
 * [JonnyD/Skynet] (https://github.com/JonnyD/Skynet) -  log player activity onto an online API
 * [MinecraftChat] (https://github.com/rom1504/MinecraftChat) (last open source version, built by AlexKvazos) -  Minecraft web based chat client <https://minecraftchat.net/>
 * [Cheese Bot] (https://github.com/Minecheesecraft/Cheese-Bot) - Plugin based bot with a clean GUI. Made with Node-Webkit. http://bot.ezcha.net/

## Installation

### Linux / OSX

`npm install mineflayer`

### Windows

1. Follow the Windows instructions from
   [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol#windows)
2. `npm install mineflayer`

## Documentation

 * See [doc/api.md](https://github.com/PrismarineJS/mineflayer/blob/master/doc/api.md).
 * See [doc/history.md](https://github.com/PrismarineJS/mineflayer/blob/master/doc/history.md).
 * See [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples).
 * See [doc/unstable_api.md](https://github.com/PrismarineJS/mineflayer/blob/master/doc/unstable_api.md).
 * See [doc/contribute.md](https://github.com/PrismarineJS/mineflayer/blob/master/doc/contribute.md).

## Testing

`npm test`

## Updating to a newer protocol version

1. Wait for a new version of
   [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol)
   to be released which supports the new Minecraft version.
2. `npm install --save minecraft-protocol@latest`
3. Apply the [protocol changes](http://wiki.vg/Protocol_History) where necessary.
4. Run the test suite. See Testing above.

## Licence

[MIT](LICENCE)
