# Mineflayer

[![NPM version](https://img.shields.io/npm/v/mineflayer.svg?color=success&label=npm%20package&logo=npm)](https://www.npmjs.com/package/mineflayer)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PrismarineJS/mineflayer/ci.yml.svg?label=CI&logo=github&logoColor=lightgrey)](https://github.com/PrismarineJS/mineflayer/actions?query=workflow%3A%22CI%22)
[![Try it on gitpod](https://img.shields.io/static/v1.svg?label=try&message=on%20gitpod&color=brightgreen&logo=gitpod)](https://gitpod.io/#https://github.com/PrismarineJS/mineflayer)
[![Open In Colab](https://img.shields.io/static/v1.svg?label=open&message=on%20colab&color=blue&logo=google-colab)](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PrismarineJS)](https://github.com/sponsors/PrismarineJS)

[![Official Discord](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/GsEFRM8)

| <sub>EN</sub> [English](README.md) | <sub>RU</sub> [русский](ru/README_RU.md) | <sub>ES</sub> [Español](es/README_ES.md) | <sub>FR</sub> [Français](fr/README_FR.md) | <sub>TR</sub> [Türkçe](tr/README_TR.md) | <sub>ZH</sub> [中文](zh/README_ZH_CN.md) | <sub>BR</sub> [Português](br/README_BR.md) |
|-------------------------|----------------------------|----------------------------|----------------------------|----------------------------|-------------------------|--------------------|

Create Minecraft bots with a powerful, stable, and high level JavaScript [API](api.md), also usable from Python.

First time using Node.js? You may want to start with the [tutorial](tutorial.md). Know Python? Checkout some [Python examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples/python) and try out [Mineflayer on Google Colab](https://colab.research.google.com/github/PrismarineJS/mineflayer/blob/master/docs/mineflayer.ipynb).

## Features

 * Supports Minecraft 1.8 to 1.21 (1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21) <!--version-->
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

 Checkout [this page](https://github.com/PrismarineJS/mineflayer/wiki/Big-Prismarine-projects) to see what our current projects are.

## Installation

First install Node.js >= 18 from [nodejs.org](https://nodejs.org/) then:

```bash
npm install mineflayer
```

To update mineflayer (or any Node.js) package and its dependencies, use 
```bash
npm update
```

## Documentation

| link | description |
|---|---|
|[tutorial](tutorial.md) | Begin with Node.js and mineflayer |
| [FAQ.md](FAQ.md) | Got a question ? go there first |
| **[api.md](api.md)** <br/>[unstable_api.md](unstable_api.md) | The full API reference |
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

Without a version specified, the version of the server will be guessed automatically.
Without auth specified, the mojang auth style will be guessed.

### Echo Example
```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft server ip
  username: 'Bot', // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
  auth: 'microsoft' // for offline mode servers, you can set this to 'offline'
  // port: 25565,              // set if you need a port that isn't 25565
  // version: false,           // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)
```

If `auth` is set to `microsoft`, you will be prompted to login to microsoft.com with a code in your browser. After signing in on your browser, 
the bot will automatically obtain and cache authentication tokens (under your specified username) so you don't have to sign-in again. 

To switch the account, update the supplied `username`. By default, cached tokens will be stored in your user's .minecraft folder, or if `profilesFolder` is specified, they'll instead be stored there.
For more information on bot options see node-minecraft-protocol's [API doc](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/docs/API.md#mccreateclientoptions).

#### Connecting to a Realm

To join a Realm that your Minecraft account has been invited to, you can pass a `realms` object with a selector function like below.

```js
const client = mineflayer.createBot({
  username: 'email@example.com', // minecraft username
  realms: {
    // This function is called with an array of Realms the account can join. It should return the one it wants to join.
    pickRealm: (realms) => realms[0]
  },
  auth: 'microsoft'
})
```

### See what your bot is doing

Thanks to the [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) project, it's possible to display in a browser window what your bot is doing.
Just run `npm install prismarine-viewer` and add this to your bot:
```js
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
})
```
And you'll get a *live* view looking like this:

[<img src="https://prismarinejs.github.io/prismarine-viewer/test_1.16.1.png" alt="viewer" width="500">](https://prismarinejs.github.io/prismarine-viewer/)

#### More Examples

| example | description |
|---|---|
|[viewer](https://github.com/PrismarineJS/mineflayer/tree/master/examples/viewer) | Display your bot world view in the browser |
|[pathfinder](https://github.com/PrismarineJS/mineflayer/tree/master/examples/pathfinder) | Make your bot go to any location automatically |
|[chest](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chest.js) | Use chests, furnaces, dispensers, enchantment tables |
|[digger](https://github.com/PrismarineJS/mineflayer/blob/master/examples/digger.js) | Learn how to create a simple bot that is capable of digging blocks |
|[discord](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js) | Connect a discord bot with a mineflayer bot |
|[jumper](https://github.com/PrismarineJS/mineflayer/blob/master/examples/jumper.js) | Learn how to move, jump, ride vehicles, attack nearby entities |
|[ansi](https://github.com/PrismarineJS/mineflayer/blob/master/examples/ansi.js) | Display your bot's chat with all of the chat colors shown in your terminal |
|[guard](https://github.com/PrismarineJS/mineflayer/blob/master/examples/guard.js) | Make a bot guard a defined area from nearby mobs |
|[multiple-from-file](https://github.com/PrismarineJS/mineflayer/blob/master/examples/multiple_from_file.js) | Add a text file with accounts and have them all login |

And many more in the [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) folder.

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

 * [minecraft-mcp-server](https://github.com/yuniko-software/minecraft-mcp-server) A MCP server for mineflayer, allowing using mineflayer from an LLM
 * [pathfinder](https://github.com/Karang/mineflayer-pathfinder) - advanced A* pathfinding with a lot of configurable features
 * [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) - simple web chunk viewer
 * [web-inventory](https://github.com/ImHarvol/mineflayer-web-inventory) - web based inventory viewer
 * [statemachine](https://github.com/PrismarineJS/mineflayer-statemachine) - A state machine API for more complex bot behaviors
 * [Armor Manager](https://github.com/G07cha/MineflayerArmorManager) - automatic armor management
 * [Dashboard](https://github.com/wvffle/mineflayer-dashboard) - Frontend dashboard for mineflayer bot
 * [PVP](https://github.com/PrismarineJS/mineflayer-pvp) - Easy API for basic PVP and PVE.
 * [Auto Eat](https://github.com/link-discord/mineflayer-auto-eat) - Automatic eating of food.
 * [Auto Crystal](https://github.com/link-discord/mineflayer-autocrystal) - Automatic placing & breaking of end crystals.
 * [Tool](https://github.com/TheDudeFromCI/mineflayer-tool) - A utility for automatic tool/weapon selection with a high level API.
 * [Hawkeye](https://github.com/sefirosweb/minecraftHawkEye) - A utility for using auto-aim with bows.
 * [GUI](https://github.com/firejoust/mineflayer-GUI) - Interact with nested GUI windows using async/await
 * [Projectile](https://github.com/firejoust/mineflayer-projectile) - Get the required launch angle for projectiles
 * [Movement](https://github.com/firejoust/mineflayer-movement) - Smooth and realistic player movement, best suited for PvP
 * [Collect Block](https://github.com/PrismarineJS/mineflayer-collectblock) - Quick and simple block collection API.

 But also check out :

 * [radar](https://github.com/andrewrk/mineflayer-radar/) - web based radar
   interface using canvas and socket.io. [YouTube Demo](https://www.youtube.com/watch?v=FjDmAfcVulQ)
 * [auto-auth](https://github.com/G07cha/MineflayerAutoAuth) - chat-based bot authentication
 * [Bloodhound](https://github.com/Nixes/mineflayer-bloodhound) - determine who and what is responsible for damage to another entity
 * [tps](https://github.com/SiebeDW/mineflayer-tps) - get the current tps (processed tps)
 * [panorama](https://github.com/IceTank/mineflayer-panorama) - take Panorama Images of your world
 * [player-death-event](https://github.com/tuanzisama/mineflayer-death-event) - emit player death event in Mineflayer.

## Projects Using Mineflayer

 * [Voyager](https://github.com/MineDojo/Voyager) An Open-Ended Embodied Agent with Large Language Models
 * [mindcraft](https://github.com/kolbytn/mindcraft) Lib for using mineflayer with LLMs
 * [rom1504/rbot](https://github.com/rom1504/rbot)
   - [YouTube - building a spiral staircase](https://www.youtube.com/watch?v=UM1ZV5200S0)
   - [YouTube - replicating a building](https://www.youtube.com/watch?v=0cQxg9uDnzA)
 * [Darthfett/Helperbot](https://github.com/Darthfett/Helperbot)
 * [vogonistic/voxel](https://github.com/vogonistic/mineflayer-voxel) - visualize what
   the bot is up to using voxel.js
 * [JonnyD/Skynet](https://github.com/JonnyD/Skynet) -  log player activity onto an online API
 * [MinecraftChat](https://github.com/rom1504/MinecraftChat) (last open source version, built by AlexKvazos) -  Minecraft web based chat client
 * [Cheese Bot](https://github.com/Minecheesecraft/Cheese-Bot) - Plugin based bot with a clean GUI. Made with Node-Webkit.
 * [Chaoscraft](https://github.com/schematical/chaoscraft) - Minecraft bot using genetic algorithms, see [its youtube videos](https://www.youtube.com/playlist?list=PLLkpLgU9B5xJ7Qy4kOyBJl5J6zsDIMceH)
 * [hexatester/minetelegram](https://github.com/hexatester/minetelegram) -  Minecraft - Telegram bridge, build on top of mineflayer & telegraf.
 * [PrismarineJS/mineflayer-builder](https://github.com/PrismarineJS/mineflayer-builder) - Prints minecraft schematics in survival, keeping orientation
 * [SilkePilon/OpenDeliveryBot](https://github.com/SilkePilon/OpenDeliveryBot) - Minecraft bot in python to deliver items from place to place.
 * [and hundreds more](https://github.com/PrismarineJS/mineflayer/network/dependents) - All the projects that github detected are using mineflayer


## Testing

### Testing everything

Simply run: 

```bash
npm test
```

### Testing specific version
Run 

```bash
npm run mocha_test -- -g <version>
```

where `<version>` is a minecraft version like `1.12`, `1.15.2`...

### Testing specific test
Run 

```bash
npm run mocha_test -- -g <test_name>
```

where `<test_name>` is a name of the test like `bed`, `useChests`, `rayTrace`...

### Example

```bash
npm run mocha_test -- -g "1.18.1.*BlockFinder"
```
to run the block finder test for 1.18.1

## License

[MIT](/LICENSE)
