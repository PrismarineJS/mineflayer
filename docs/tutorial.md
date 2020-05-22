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
- [Advanced](#advanced)
  - [Creating an event from chat](#creating-an-event-from-chat)
    - [Answer Hello Bot](#answer-hello-bot)
    - [Custom chat](#custom-chat)
- [FAQ](#faq)
  - [How to create discord bot with mineflayer](#how-to-create-discord-bot-with-mineflayer)
  - [How to run bot on android](#how-to-run-bot-on-android)

## Basics

For the following, we assume Mineflayer is installed and you have a text editor.

### Creating a Bot

To get a feeling for the Mineflayer and how to use it, please open a text editor and follow the next few steps.

First, create an instance of the Bot.

```js
const mineflayer = require('mineflayer')
const options = {
  host: 'localhost', // optional / minecraft server address
  port: 25565, // optional
  username: 'email@example.com', // email and password are required only for
  password: '12345678', // online-mode=true servers
  version: false // false corresponds to auto version detection (that's the default), put for example '1.8.8' if you need a specific version
}
const bot = mineflayer.createBot(options)
```

Say hi to the chat after you spawn in, using [`spawn`](http://mineflayer.prismarine.js.org/#/api?id=quotspawnquot) event and [`bot.chat()`](http://mineflayer.prismarine.js.org/#/api?id=botchatmessage) method.

```js
bot.once('spawn', function () {
  bot.chat('hi!')
  // `bot.chat()` method for sending message or commad to the chat.
})
```

For full methods list see the [documentation](http://mineflayer.prismarine.js.org/#/api?id=methods)

### Listening for an event

Bot object has many useful [events](http://mineflayer.prismarine.js.org/#/api?id=events).
You can listen for an event by using either `bot.on()` method or `bot.once()` method of the Bot object, wich takes the name of event and a function.
To remove specific listener you can use `bot.removeListener()` method.

- `bot.on(eventName, listener)`
  Execute the `listener` function for each time the event named `eventName` triggered.
- `bot.once(eventName, listener)`
  Execute the `listener` function, the first time the event named `eventName` triggered.
- `bot.removeListener(eventName, listener)`
  Removes the specified `listener` for the event named `eventName`.

Not only bot object, [`Chest`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerchest), [`Furnace`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerfurnace), [`Dispenser`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerdispenser), [`EnchantmentTable`](http://mineflayer.prismarine.js.org/#/api?id=mineflayerenchantmenttable), [`Villager`](http://mineflayer.prismarine.js.org/#/api?id=mineflayervillager) object also have their own events!

Examples :

#### Echo Bot

Here we're listening for [`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event, and resend the message.
[`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event is only emitted when a player chats publicly.

```js
function echo (username, message) {
  if (username !== bot.username) {
    bot.chat(message)
  }
}

bot.on('chat', echo) // Only emitted when a player chats publicly.
```

`bot.on('chat', echo)` - will listen for [`chat`](http://mineflayer.prismarine.js.org/#/api?id=quotchatquot-username-message-translate-jsonmsg-matches) event, and execute `echo` function with arguments `username`, `message`, `translate`, `jsonMsg`, and `matches` when the event emitted.

#### Welcome Bot

Here we're listening for [`playerJoined`](http://mineflayer.prismarine.js.org/#/api?id=quotplayerjoinedquot-player) event.
And sending welcome message to chat.

```js
function joined (player) {
  bot.chat(`Welcome ${player}! :D`)
}

bot.on('playerJoined', joined)
```

### Callbacks

Callback (known as a "call-after" function) is a function that is passed as an argument to the other code / function.
If that other code / function finish the execution, then the callback is called.

Callback takes parameter called `err` or `error` as first, and second parameter (if specified) is a value that is passed to the callback,
if `err === null` then there is no error happened in the other code / function.

In [the API page](http://mineflayer.prismarine.js.org/#/api) callback abbreviated as `cb` or `callback`.

Examples :

#### Craft Stick Bot

Here we're crafting oak logs into sticks.
Craft oak logs into oak wood planks, wait for crafting finish. Then craft the oak wood planks into sticks.

Incorect aproach ❌ :

```js
const plankRecipe = bot.recipesFor(5) // 5 Item ID for Oak Wood Planks
bot.craft(plankRecipe, 1) // ❌
// starting crafting planks and while running the code bellow
const stickRecipe = bot.recipesFor(280) // 280 Item ID for Stick
bot.craft(stickRecipe, 1) // ❌
// if the plank not in the inventory, because of bot.craft(plankRecipe, 1) hasn't finish yet,
// then 'missing ingredient' error will happened.
```

Correct approach with callbacks ✔️ :

```js
const plankRecipe = bot.recipesFor(5)[0]

bot.craft(plankRecipe, 1, null, function (err) {
  // after bot.craft(plankRecipe, ...) finish then the code bellow get executed ✔️
  if (err !== null) {
    bot.chat(err.message)
    // if error happened when crafting `plankRecipe` then send to chat the `err.message`
  } else {
    const stickRecipe = bot.recipesFor(280)

    bot.craft(stickRecipe, 1, null, function (err) {
      // after bot.craft(stickRecipe, ...) finish then the code bellow get executed ✔️
      if (err !== null) {
        bot.chat(err.message)
        return
      }
      bot.chat('Crafting Sticks finished')
    })
  }
})
```

More on [`bot.craft()`](http://mineflayer.prismarine.js.org/#/api?id=botcraftrecipe-count-craftingtable-callback) method.

#### Consuming Bot

In this example we create bot that eat / consume held item if hungry.
Using
[`health`](http://mineflayer.prismarine.js.org/#/api?id=health) - event that listens for changes in health or food points.
[`bot.consume()`](http://mineflayer.prismarine.js.org/#/api?id=botconsumecallback) - method that makes bot eat currently held item.
[`bot.food`](http://mineflayer.prismarine.js.org/#/api?id=botfood) - property to check food points.
`bot.heldItem` property that returns [`Item`](https://github.com/PrismarineJS/prismarine-item/blob/master/README.md) - held by the bot or `null`.

```js
const minFoodPoints = 18

bot.on('health', function () {
  // listen on any changes in health or food points.
  const heldItemName = bot.heldItem.name
  if (bot.food < minFoodPoints) {
    // if the food points lower than 18, then
    bot.chat(`Eating ${heldItemName}`)
    bot.consume(onFinishEating)
    // `bot.consume()` method takes `onFinishEating` as callback, and execute `onFinishEating` when its finish or stumble an error.
  }
  function onFinishEating (err) {
    if (err !== null) {
      bot.chat(err.message)
      return
    }
    bot.chat(`I'm finish eating ${heldItemName}`)
  }
})
```

## Advanced

For the following, we assume you have understood the [Basics](#basics) tutorial.

### Creating an event from chat

You can create your own event from chat using [`bot.chatAddPattern()`](http://mineflayer.prismarine.js.org/#/api?id=botchataddpatternpattern-chattype-description) method. Useful for bukkit servers where the chat format changes a lot.
[`bot.chatAddPattern()`](http://mineflayer.prismarine.js.org/#/api?id=botchataddpatternpattern-chattype-description) method takes three argumens :

- `pattern` - regular expression (regex) to match chat
- `chatType` - the event the bot emits when the pattern matches. Eg: "chat" or "whisper"
- `description` - Optional, describes what the pattern is for

You can add [Groups and Range](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) into the `pattern`, then the listener will spread the captured groups into arguments of your callback sequentially.

Read more about [regular expression](https://en.wikipedia.org/wiki/Regular_expression).

Examples :

#### Answer Hello Bot

Here we're creating a bot that answer 'hello' from the other player.

```js
bot.chatAddPattern(
  /(helo|hello|Hello)/,
  'hello',
  'Someone says hello'
)

function hi () {
  bot.chat('Hi!')
}

bot.on('hello', hi)
```

#### Custom chat

Creating an event based on custom chat format.
Custom chat example

```txt
[Player] Player1 > Hello
[Admin] Alex > Hi
[Player] Player2 > Help me, im stuck
[Mod] Jim > On my way
```

```js
bot.chatAddPattern(
  /^\[(.+)\] (\S+) > (.+)$/,
  'my_chat_event',
  'Custom chat event'
)

function logger (rank, username, message) {
  console.log(`${username} said ${message}`)
}

bot.on('my_chat_event', logger)
```

Explanation on the regex `^\[(.+)\] (\S+) > (.+)$` can be found [here](https://regex101.com/r/VDUrDC/2).

## FAQ

### How to run bot on android

Here quick setup for running bot on android device using [Termux](https://termux.com/).

#### Install Termux

Install [Termux](https://termux.com/) and start it.

#### Setup

Install `node.js`:

```bash
pkg update -y
pkg install nodejs -y
```

❗️ Allow Storage permission for Termux on app settings.
Create new folder on internal storage :

```bash
cd /sdcard
mkdir my_scripts
cd my_scripts
```

Install `mineflayer`:

```bash
npm install mineflayer
```

Now you can copy / store all of your scripts into `my_scripts` folder inside Internal Storage.

#### Start your bot

To start the bot, change `mybot.js` to your script name:

```bash
node mybot.js
```

❗️ For each time opening Termux you must change the cwd into `/sdcard/my_scripts`, before starting the bot:

```bash
cd /sdcard/my_scripts
```
