# Tutorial

**Table of Contents**

- [Basics](#basics)
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

## Basics

For the following, we assume Mineflayer is installed and you have a text editor.

### Creating a Bot

To get a feeling for the Mineflayer and how to use it, please open a text editor and follow the next few steps.

First, create an instance of the Bot.

```js
const mineflayer = require("mineflayer");
const options = {
  host: "localhost", // optional / minecraft server address
  port: 25565, // optional
  username: "email@example.com", // email and password are required only for
  password: "12345678", // online-mode=true servers
  version: false, // false corresponds to auto version detection (that's the default), put for example "1.8.8" if you need a specific version
};
const bot = mineflayer.createBot(options);
```

Say hi to the chat after you spawn in, using [`spawn`](http://mineflayer.prismarine.js.org/#/api?id=quotspawnquot) event and [`bot.chat()`](http://mineflayer.prismarine.js.org/#/api?id=botchatmessage) method.

```js
// ...

bot.once("spawn", function () {
  bot.chat("hi!");
  // `bot.chat()` method for sending message or commad to the chat.
});
```

For full methods list see the [documentation](http://mineflayer.prismarine.js.org/#/api?id=methods)

### Listening for an event

Bot object has many useful built in [`events`](http://mineflayer.prismarine.js.org/#/api?id=events).
You can listen for an event by using either `bot.on()` method or `bot.once()` method of the Bot object, wich takes the name of event and a function.
To remove specific listener you can use `bot.removeListener()` method.

- `bot.on(eventName,listener)`
  Adds the `listener` function to the end of the listeners array for the event named `eventName`. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of `eventName` and `listener` will result in the `listener` being added, and called, multiple times.
- `bot.once(eventName,listener)`
  Adds a one-time listener function for the event named `eventName`. The next time `eventName` is triggered, this listener is removed and then invoked. Basically it'll run one time for the first event.
- `bot.removeListener(eventName,listener)`
  Removes the specified listener from the listener array for the event named eventName.

Not only bot object, [`Chest`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerchest), [`Furnace`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerfurnace), [`Dispenser`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerdispenser), [`EnchantmentTable`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerenchantmenttable), [`Villager`](http://mineflayer.prismarine.js.org/#/api?id=mineflayervillager) object also has its own events!

Examples :

#### Echo Bot

In here we're listening [`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event, and resend the message.
[`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event only emitted when a player chats publicly.

```js
const mineflayer = require("mineflayer");
const options = {...}
const bot = mineflayer.createBot(options);

function echo(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
}

bot.on("chat", echo); // Only emitted when a player chats publicly.
```

`bot.on("chat", echo);` will listend for [`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event, and execute `echo` function with argument of (username, message, translate, jsonMsg, matches) when [`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event triggered.

#### Welcome Bot

In here we're listening [`playerJoined`](http://mineflayer.prismarine.js.org/#/api?id=quotplayerjoinedquot-player) event.

```js
const mineflayer = require("mineflayer");
const options = {...}
const bot = mineflayer.createBot(options);

function joined(player) {
  bot.chat(`Welcome ${player}! :D`)
}

bot.on("playerJoined", joined)
```

### Callbacks

Callback is a function as argument to the main function, when the main function finish or got an error then the callback executed.
In [the API page](http://mineflayer.prismarine.js.org/#/api) callback abbreviated as `cb` or `callback`.
Callback usually takes parameter called `err` and the second (if specified in) is a value that is passed to the callback, if `err` populated then error must be happened in the main function.

Examples :

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
  // if error happened when crafting `plankRecipe` then send to chat the `err.message`

  const stickRecipe = bot.recipesFor(280); // 280 ID for Stick
  bot.craft(stickRecipe, 1, null, function (err) {
    if (err) return bot.chat(err.message);
    // if error happened when crafting `stickRecipe` then send to chat the `err.message`

    bot.chat("Crafting Stick finished");
  });
});
```

More on [`bot.craft()`](http://mineflayer.prismarine.js.org/#/api?id=botcraftrecipe-count-craftingtable-callback) method.

#### Consuming Bot

In this example we create bot that eat / consume held item if hungry.
Using
[`health`](http://mineflayer.prismarine.js.org/#/api?id=health) event of the bot to listen on any changes in health or food points.
[`bot.consume()`](http://mineflayer.prismarine.js.org/#/api?id=botconsumecallback) method to eat.
[`bot.food`](http://mineflayer.prismarine.js.org/#/api?id=botfood) property to check food points.
`bot.heldItem` property to get the name of the item held by the bot. `bot.heldItem` is an instance of [`Item`](https://github.com/PrismarineJS/prismarine-item/blob/master/README.md) or `null` if no item held.

```js
const mineflayer = require("mineflayer");
const options = {...}
const bot = mineflayer.createBot(options);

const minFoodPoints = 18;

bot.on("health", function () {
  // listen on any changes in health or food points.
  if (bot.food < minFoodPoints) {
    // if the food points lower than 18, then
    const heldItemName = bot.heldItem.name;

    function onFinishEating(err){
      if (err) return bot.chat(err.message);
      bot.chat(`I'm finish eating ${heldItemName}`);
    }

    bot.chat(`Eating ${heldItemName}`);
    bot.consume(onFinishEating);
    // `bot.consume()` method takes `onFinishEating` as callback, and execute `onFinishEating` when its finish or stumble an error.
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
