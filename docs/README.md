# Mineflayer

[![NPM version](https://badge.fury.io/js/mineflayer.svg)](http://badge.fury.io/js/mineflayer)
[![Build Status](https://github.com/PrismarineJS/mineflayer/workflows/CI/badge.svg)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Issue Hunt](https://github.com/BoostIO/issuehunt-materials/blob/master/v1/issuehunt-shield-v1.svg)](https://issuehunt.io/r/PrismarineJS/mineflayer)

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)

| 🇺🇸 [English](README.md) | 🇷🇺 [Russian](README_RU.md) | 🇪🇸 [Spanish](README_ES.md) |
|-------------------------|----------------------------|----------------------------|

Create Minecraft bots with a powerful, stable, and high level JavaScript [API](api.md).

First time using node.js ? You may want to start with the [tutorial](tutorial.md)

## Features

 * Supports Minecraft 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15 and 1.16.
 * Entity knowledge and tracking.
 * Block knowledge. You can query the world around you. Milliseconds to find any block.
 * Physics and movement - handle all bounding boxes
 * Attacking entities and using vehicles.
 * Inventory management.
 * Crafting, chests, dispensers, enchantment tables.
 * Digging and building.
 * Miscellaneous stuff such as knowing your health and whether it is raining.
 * Activating blocks and using items.
 * Chat.

### Roadmap

 Checkout this page to see what are our current [projects](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects). 
 
## Installation

First install nodejs >= 14 from [nodejs.org](https://nodejs.org/) then:

`npm install mineflayer`

## Documentation

| link | description |
|---|---|
|[tutorial](tutorial.md) | Begin with node.js and mineflayer |
| [FAQ.md](FAQ.md) | Got a question ? go there first |
| [api.md](api.md) [unstable_api.md](unstable_api.md) | The full API reference |
| [history.md](history.md) | The changelog for mineflayer |
| [examples/](https://github.com/PrismarineJS/mineflayer/tree/master/examples) | Checkout all the mineflayer examples |


## Contribute

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [prismarine-contribute](https://github.com/PrismarineJS/prismarine-contribute)

## Usage

**Videos**

A tutorial video explaining the basic set up process for a bot can be found [here.](https://www.youtube.com/watch?v=ltWosy4Z0Kw)

If you want to learn more, more video tutorials are [there,](https://www.youtube.com/playlist?list=PLh_alXmxHmzGy3FKbo95AkPp5D8849PEV) and the corresponding source codes for those bots is [there.](https://github.com/TheDudeFromCI/Mineflayer-Youtube-Tutorials)

[<img src="https://img.youtube.com/vi/ltWosy4Z0Kw/0.jpg" alt="tutorial 1" width="200">](https://www.youtube.com/watch?v=ltWosy4Z0Kw)
[<img src="https://img.youtube.com/vi/UWGSf08wQSc/0.jpg" alt="tutorial 2" width="200">](https://www.youtube.com/watch?v=UWGSf08wQSc)
[<img src="https://img.youtube.com/vi/ssWE0kXDGJE/0.jpg" alt="tutorial 3" width="200">](https://www.youtube.com/watch?v=ssWE0kXDGJE)
[<img src="https://img.youtube.com/vi/walbRk20KYU/0.jpg" alt="tutorial 4" width="200">](https://www.youtube.com/watch?v=walbRk20KYU)

**Getting Started**

Without version specified, the version of the server will be guessed automatically, you can set a specific one using the version option.
For example `version:"1.8"`.

### Echo Example
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // optional
  port: 25565,       // optional
  username: 'email@example.com', // email and password are required only for
  password: '12345678',          // online-mode=true servers
  version: false,                 // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
  auth: 'mojang'      // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
})

bot.on('chat', function (username, message) {
  if (username === bot.username) return
  bot.chat(message)
})

// Log errors and kick reasons:
bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))
```

### See what your bot is doing

Thanks to [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) project, it's possible to display in a browser window what your bot is doing.
Just run `npm install prismarine-viewer` and add this to your bot:
```js
const mineflayerViewer = require('prismarine-viewer').mineflayer
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})
```
And you'll get a *live* view looking like this:

[<img src="https://prismarine.js.org/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarine.js.org/prismarine-viewer/)

#### More Examples

| example | description |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | display your bot world view in the browser |
|[pathfinder](https://github.com/Karang/mineflayer-pathfinder/blob/master/examples/test.js) | make your bot go to any location automatically |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Use chests, furnaces, dispensers, enchantment tables |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Learn how to create a simple bot that is capable of digging the block |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | connect a discord bot with a mineflayer bot |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Learn how to move, jump, ride vehicles, attack nearby entities |

And many mores in the [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) folder

### Modules

A lot of the active development is happening inside of small npm packages which are used by mineflayer.

#### The Node Way&trade;

> "When applications are done well, they are just the really application-specific, brackish residue that can't be so easily abstracted away. All the nice, reusable components sublimate away onto github and npm where everybody can collaborate to advance the commons." — substack from ["how I write modules"](https://gist.github.com/substack/5075355)

#### Modules

These are the main modules that make up mineflayer:

| module | description |
|---|---|
| [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Parse and serialize minecraft packets, plus authentication and encryption.
| [minecraft-data](https://github.com/PrismarineJS/minecraft-data) | Language independent module providing minecraft data for minecraft clients, servers and libraries.
| [prismarine-physics](https://github.com/PrismarineJS/prismarine-physics) | Provide the physics engine for minecraft entities
| [prismarine-chunk](https://github.com/PrismarineJS/prismarine-chunk) | A class to hold chunk data for Minecraft
| [node-vec3](https://github.com/PrismarineJS/node-vec3) | 3d vector math with robust unit tests
| [prismarine-block](https://github.com/PrismarineJS/prismarine-block) | Represent a minecraft block with its associated data
| [prismarine-chat](https://github.com/PrismarineJS/prismarine-chat) | A parser for a minecraft chat message (extracted from mineflayer)
| [node-yggdrasil](https://github.com/PrismarineJS/node-yggdrasil) | Node.js library to interact with Mojang's authentication system, known as Yggdrasil
| [prismarine-world](https://github.com/PrismarineJS/prismarine-world) | The core implementation of worlds for prismarine
| [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows) | Represent minecraft windows
| [prismarine-item](https://github.com/PrismarineJS/prismarine-item) | Represent a minecraft item with its associated data
| [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) | An NBT parser for node-minecraft-protocol
| [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe) | Represent minecraft recipes
| [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome) | Represent a minecraft biome with its associated data
| [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity) | Represent a minecraft entity


### Debug

You can enable some protocol debugging output using `DEBUG` environment variable:

```bash
DEBUG="minecraft-protocol" node [...]
```

On windows :
```
set DEBUG=minecraft-protocol
node your_script.js
```

## Third Party Plugins

Mineflayer is pluggable; anyone can create a plugin that adds an even
higher level API on top of Mineflayer.

The most updated and useful are :

 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - advanced A* pathfinding with a lot of configurable features
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - simple web chunk viewer
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - web based inventory viewer
 * [statemachine](https://github.com/TheDudeFromCI/mineflayer-statemachine) - A state machine API for more complex bot behavors
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - automatic armor managment
 * [Collect Block](https://github.com/TheDudeFromCI/mineflayer-collectblock) - Quick and simple block collection API.
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Frontend dashboard for mineflayer bot
 * [PVP](https://github.com/TheDudeFromCI/mineflayer-pvp) - Easy API for basic PVP and PVE.
 * [auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) - Automatic eating of food.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - A utility for automatic tool/weapon selection with a high level API.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - A utility for using auto-aim with bows.


 But also check out :

 * [navigate](https://github.com/andrewrk/mineflayer-navigate/) - get around
   easily using A* pathfinding. [YouTube Demo](https://www.youtube.com/watch?v=O6lQdmRz8eE)
 * [radar](https://github.com/andrewrk/mineflayer-radar/) - web based radar
   interface using canvas and socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [blockfinder](https://github.com/Darthfett/mineflayer-blockFinder) - find blocks in the 3D world
 * [scaffold](https://github.com/andrewrk/mineflayer-scaffold) - get to
   a target destination even if you have to build or break blocks to do so.
   [YouTube Demo](http://youtu.be/jkg6psMUSE0)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - chat-based bot authentication
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determine who and what is responsible for damage to another entity
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - get the current tps (processed tps)

## Projects Using Mineflayer

 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - building a spiral staircase](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicating a building](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualize what
   the bot is up to using voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  log player activity onto an online API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (last open source version, built by AlexKvazos) -  Minecraft web based chat client <https://minecraftchat.net/>
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Plugin based bot with a clean GUI. Made with Node-Webkit. http://bot.ezcha.net/
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Minecraft bot using genetic algorithms, see [its youtube videos](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Minecraft - Telegram bridge, build on top of mineflayer & telegraf.
 * [ProZedd/mineflayer-printer](https://github.com/ProZedd/mineflayer-printer) - Prints minecraft schematics
 * [and hundreds more](https://github.com/PrismarineJS/mineflayer/network/dependents) - All the projects that github detected are using mineflayer


## Testing

Some setup is required after first cloning the project but after that is done it's very easy to run them.

### Setup

In order to get all tests to run successfully you must first:

1. create a new folder in which to store minecraft server jars
2. set the MC_SERVER_JAR_DIR to this folder

Example:

1. `mkdir server_jars`
2. `export MC_SERVER_JAR_DIR=/full/path/to/server_jars`

Where the "/full/path/to/" is the fully qualified path name.

### Testing everything

Simply run: `npm test`

### Testing specific version
Run `npm test -g <version>`, where `<version>` is a minecraft version like `1.12`, `1.15.2`...

### Testing specific test
Run `npm test -g <test_name>`, where `<test_name>` is a name of the test like `bed`, `useChests`, `rayTrace`...

## Licence

[MIT](LICENCE)
