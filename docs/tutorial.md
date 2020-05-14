# Tutorial

**Table of Contents**

- [Basic](#advance)
  - [Creating a bot](#creating-a-bot)
  - [Listening for an event](#listening-for-an-event)
    - [Echo bot](#echo-bot)
    - [Welcome Bot](#welcome-bot)
  - [Callbacks](#callbacks)
    - [Craft Stick Bot](#craft-stick-bot)
    - [Consuming Bot](#consuming-bot)
    - [Fisherman Bot](#fisherman-bot)
- [FAQ](#faq)
  - [How to create discord bot with mineflayer](#how-to-create-discord-bot-with-mineflayer)
  - [How to run bot on android](#how-to-run-bot-on-android)

## Basic

For the following, we assume Mineflayer is installed and you have a text editor.

### Creating a Bot

To get a feeling for the Mineflayer and how to use it, please open a text editor and follow the next few steps.

First, create an instance of the Bot.

```js
var mineflayer = require("mineflayer");
var bot = mineflayer.createBot({
  host: "localhost", // optional / minecraft server address
  port: 25565, // optional
  username: "email@example.com", // email and password are required only for
  password: "12345678", // online-mode=true servers
  version: false, // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
});
```

Say hi to the chat after you spawn in, using [`spawn event`](http://mineflayer.prismarine.js.org/#/api?id=quotspawnquot) and [`chat method`](http://mineflayer.prismarine.js.org/#/api?id=botchatmessage).

```js
// ...

bot.once("spawn", function () {
  bot.chat("hi!");
  // `chat` method for sending message or commad to the chat.
});
```

For full methods list see the documentation at [API-Bot-methods](http://mineflayer.prismarine.js.org/#/api?id=methods)

### Listening for an event

Bot object has many useful built in [`events`](http://mineflayer.prismarine.js.org/#/api?id=events).
You can listen for an event by using either `on` method or `once` method of the Bot object, wich takes the name of event and a function.

[`Chest`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerchest), [`Furnace`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerfurnace), [`Dispenser`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerdispenser), [`EnchantmentTable`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerenchantmenttable), [`Villager`](http://mineflayer.prismarine.js.org/#/api?id=mineflayervillager) object also has its own events.

Examples :

#### Echo Bot

In here we're listening [`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event, and resend the message.
`Chat` event only emitted when a player chats publicly.

```js
var mineflayer = require("mineflayer");
var bot = mineflayer.createBot({...})

bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
```

Or more readable aproach,

```js
var mineflayer = require("mineflayer");
var bot = mineflayer.createBot({...})

function echo(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
}

bot.on("chat", echo); // Only emitted when a player chats publicly.
```

`bot.on("chat", echo);` will listend for `chat` event, and execute `echo` function with argument of (username, message, translate, jsonMsg, matches) when `chat` event triggered. Read more about `chat` event [here](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches).

#### Welcome Bot

In here we're listening [`playerJoined`](http://mineflayer.prismarine.js.org/#/api?id=quotplayerjoinedquot-player) event.

```js
var mineflayer = require("mineflayer");
var bot = mineflayer.createBot({...})

function joined(player) {
  bot.chat(`Welcome ${player}! :D`)
}
bot.on("playerJoined", joined)
```

### Callbacks

Callback is a function as argument to the main function, when the main function finish or got an error then the callback executed.
In [the API page](http://mineflayer.prismarine.js.org/#/api) callback abbreviated as `cb`.
Callback usually takes single parameter called `err`, if `err` populated then error must be happened in the main function.

Examples

#### Craft Stick Bot

You don't wanna craft sticks, before the logs crafted into planks.
Incorect aproach :

```js
const plankRecipe = bot.recipesFor(5); // 5 ID for Oak Wood Planks
bot.craft(plankRecipe, 1);
const stickRecipe = bot.recipesFor(280); // 280 ID for Stick
bot.craft(plankRecipe, 1);
```

Correct approach with callback:

```js
const plankRecipe = bot.recipesFor(5)[0]; // 5 ID for Oak Wood Planks
bot.craft(plankRecipe, 1, null, function (err) {
  if (err) return bot.chat(err.message);
  const stickRecipe = bot.recipesFor(280); // 280 ID for Stick
  bot.craft(plankRecipe, 1, null, function (err) {
    bot.chat("Crafting Stick finished");
  });
});
```

More readable version

```js
const plankRecipe = bot.recipesFor(5)[0]; // 5 ID for Oak Wood Planks

function stickCrafted(err) {
  if (err) return bot.chat(err.message);
  bot.chat("Crafting Stick finished");
}

function plankCrafted(err) {
  if (err) return bot.chat(err.message);
  const stickRecipe = bot.recipesFor(280)[0]; // 280 ID for Stick
  bot.craft(plankRecipe, 1, null, stickCrafted);
}

bot.craft(plankRecipe, 1, null, plankCrafted);
```

#### Consuming Bot

In this example we create bot that eat / consume held item if hungry.
Using
[`health`](http://mineflayer.prismarine.js.org/#/api?id=health) event of the bot to listen on any changes in health or food points.
[`bot.consume`](http://mineflayer.prismarine.js.org/#/api?id=botconsumecallback) method to eat.
[`bot.food`](http://mineflayer.prismarine.js.org/#/api?id=botfood) property to check food points.
`bot.heldItem` property to get the name of the item held by the bot.

```js
var mineflayer = require("mineflayer");
var bot = mineflayer.createBot({...})

const minFoodPoints = 18;

bot.on("health", function () {
  // listen on any changes in health or food points.
  if (bot.food < minFoodPoints) {
    // if the food points lower than 18, then
    var heldItemName = bot.heldItem.name;

    function onFinishEating(err){
      if (err) return bot.chat(err.message);
      bot.chat(`I'm finish eating ${heldItemName}`);
    }

    bot.chat(`Eating ${heldItemName}`);
    bot.consume(onFinishEating);
    // `consume` method takes `onFinishEating` as callback, and execute `onFinishEating` when its finish or stumble an error.
  }
})
```

#### Fisherman Bot

Can be found in [fishing.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/fisherman.js#L52).

## FAQ

### How to create discord bot with mineflayer

Answer in [discord.js](https://github.com/PrismarineJS/mineflayer/blob/master/examples/discord.js)

### How to run bot on android

Here quick setup for running bot on android device using [Termux](https://termux.com/).

#### Install Termux

Install [Termux](https://termux.com/) and start it.

#### Setup

First, update the Termux packages

```bash
pkg update -y
```

Now install `nodejs`, `npm` should be automaticaly installed as well:

```bash
pkg install nodejs -y
```

Finally, install `mineflayer` library:

```bash
npm install mineflayer@latest
```

#### Editing script

- Skip this step if you already familiar with scripting on CLI.
  Install nano for editing script:

```bash
pkg install nano -y
```

Now you can use nano to creare / edit your script. Example:

```bash
nano myscript.js
```

Didn't know how to use it? Here [nano's official docs](https://nano-editor.org/dist/latest/nano.pdf), or search `How to use nano text editor`.

#### Start your bot

Start the bot (normal mode):

```bash
node myscript.js
```

You can enable some protocol debugging output using `DEBUG` environment variable:

```bash
DEBUG="minecraft-protocol" node myscript.js
```

- Beware of flashing text on DEBUG mode.

#### Updating library

First, update `nodejs` and `npm`:

```bash
pkg install nodejs -y
```

Then update `mineflayer`:

```bash
npm install mineflayer@latest
```
