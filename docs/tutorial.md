# Tutorial

**Table of Contents**

- [Introduction](#introduction)
- [Learn JavaScript](#learn-javascript)
- [Getting Started](#getting-started)
  - [Creating a New Project](#creating-a-new-project)
  - [Create Your First Bot](#create-your-first-bot)
- [Using Events](#using-events)
  - [Custom Chat Events](#custom-chat-events)
- [Plugins](#plugins)
- [Adding Typescript](#adding-typescript)
- [Examples](#examples)
  - [Find Me Bot](#find-me-bot)
  - [Dad Joke Chat Bot on Server](#dad-joke-chat-bot-on-server)
- [FAQ](#faq)

## Introduction

This tutorial will help you get started with Mineflayer, provided you have basic knowledge about JavaScript and Node.js.

If you don't know JavaScript, go to [Learn JavaScript](#learn-javascript).

## Learn JavaScript

There are many online resources to help you learn JavaScript. These include (but are not limited to):

- [Codecademy's JavaScript Tutorial](https://www.codecademy.com/learn/introduction-to-javascript)
- [The Modern JavaScript Tutorial](https://javascript.info/)
- [Eloquent JavaScript](https://eloquentjavascript.net/)
- [Programiz.com](https://www.programiz.com/javascript)
- [W3Schools](https://www.w3schools.com/js/default.asp)
- [Mineflayer's JavaScript tutorial](jstutorial.md)

We recommend learning from one of these soruces, as they will guide you through all the basics of JavaScript, such as installing Node.js and more.

## Getting Started

### Creating a New Project

First, create a new folder to store your Node.js Project. Initialize the project by going in the command line (Command Prompt or Powershell for Windows, Terminal for Mac) for that folder and running this command:

```bash
npm init -y
```

This will create a `project.json` file that will store all our project's packages, so that if you want to send your code to someone else, they can easily download Mineflayer and any other dependencies you need.

Secondly, we need to install the `mineflayer` package from the Node Package Manager (NPM). :

```bash
npm i mineflayer
```

This will put Mineflayer in the modules we have installed, and we can start using Mineflayer!

### Create Your First Bot

I would recommend starting a Minecraft server to test your bot on. A good place to start is to host the server [on your own computer](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server). If you need to test your bot with plugins, you can use a software such as [PaperMC](https://papermc.io/). If you are too lazy to go through the hassle of hosting locally, you could use a free host such as [Aternos](https://aternos.org/).

Create a new file called `index.js` to store our code.

We need to import Mineflayer to start using it. To do this, we will use Node.js's `require()` function to import the module.

```js
const mineflayer = require('mineflayer')
```

From there, we can use `mineflayer.createBot()` to create our Minecraft bot!

```js
const bot = mineflayer.createBot({
  username: 'MineflayerBot',
  password: 'abc123',
  // password is your Microsoft password.
  // If you are using the bot on a cracked/offline server, you don't need the password field.
  host: 'FirstMineflayerBot.aternos.me',
  port: 25565 // Replace with the port for your aternos server.
})
```

Now, we can run our code. Go back in the command line and type in:

```bash
node index.js
```

Congratulations! If you did everything correctly, you should have your bot join your Minecraft server.

![MineflayerBot is on your Minecraft Server!](https://i.ibb.co/F7Xdgf1/2023-07-11-22-30-42.png)

## Using Events

Now that our bot is on our server, we need to make it interact with the world around us.

A way we can do this is by using events. Events happen when something changes with our bot or the world our bot is in. For example, when we spawn in the world, the `spawn` event is triggered. When someone says something in the chat, the `chat` event is triggered. And so on for many different things that can happen in Minecraft.

We can listen to these events happening by using event "listeners", and "listen" to when these events happen so we can run code accordingly.

Let's make our bot say "Hello there!" when he spawns in the world. We can make an event listener by using `bot.on()`

`bot.on()` takes 2 parameters. The type of event that we are listening to and the function we will run. You can find types of events in the API Reference section of the docs. We will need to make our bot listen to the `spawn` event. Then, we can make an arrow function to put our code in. Finally, we can use the `bot.chat()` function to make our bot say something in the chat.

```js
bot.on('spawn', () => {
  // Runs when the bot spawns into our world
  bot.chat('Hello there!')
})
```

Go to the command line and use Ctrl+C to stop your bot from running, and run the code again using `node index.js` like earlier. Now, using the power of events, we can make our bot do actions when certain things happen in the world.

![Our bot saying "Hello there!"](https://i.imgur.com/Wz0ia8w.png)

Alternatively, if we want to listen to an event once, we can use `bot.once()`.

```js
bot.once('chat', () => {
  bot.chat('I will only listen to this event once!')
})
```

![Our bot only replies once to .once() event listeners.](https://i.imgur.com/qow3N0f.png)

### Custom Chat Events

You can make your own custom events that will when something appears in chat. For this you will need to know regular expressions, however you could alternatively use a website such as [RegExr](https://regexr.com/) or [Regex101](https://regex101.com/) to creat your regular expressions easier.

To add your own custom event, we will use `bot.addChatPattern()`, which has 3 arguments.

1. A regular expression of the message you want (RegExp).
2. The name of your event (string).
3. Some settings/configuratrion (object).

If your regular expression has groups `()` and your settings has `parse: true`, then they will be passed as strings into your arguments.

For example, if we want a bot that replies to us saying hello, we can write:

```js
bot.once('spawn', () => {
  // bot.addChatPattern() only works once the bot spawns in.

  bot.addChatPattern('hello', /^<(.+)> hello$/, { parse: true })
  // The (.+) in the RegExp is a group,
  // which is passed into our function arguments,
  // since we have { parse: true }.

  bot.on('chat:hello', (username) => {
    bot.chat('Hi there ' + username + '!')
  })
})
```
## Plugins

Mineflayer lets you use plugins with your bot. This means you can add features to the bot that you (or other people) made. Let's try use PrismarineJS's official `mineflayer-pathfinder` plugin now to make our bot able to easily move to certain locations.

First, we need to install the `mineflayer-pathfinder` package from NPM, which includes our plugin. Go back to your command line and type:

```bash
npm i mineflayer-pathfinder
```

Now we can import this module in our code like we did before.

```js
const mineflayerPathfinder = require('mineflayer-pathfinder')
/* Note: Make sure to place all your require() imports at the top of
   the file where possible. This prevents your code from being blocked
   loading modules at runtime by loading all the dependencies before
   your program code is ran.
*/
```

Lets extract the pathfinder part of this module, as well as some others we'll use later.

```js
const { pathfinder, Movements } = mineflayerPathfinder
const { GoalNear } = mineflayerPathfinder.goals
```

To import the module in our bot, lets use `bot.loadPlugin()`

```js
// After we defined our bot ^

bot.loadPlugin(pathfinder)
```

Now, lets make our bot pathfind to where we are anywhere in our world.

First, lets make an event that listens to when a chat message is sent.

```js
bot.on('chat', (username, message) => {
  if (username === bot.username) return null // Return to prevent infinite loop.
  // ...
})
```

That line in the middle will make sure that our bot won't be 
interfering in the event if we make the bot send messages. If the bot sends any message, it will return the function right away from the start.

Lets first check if our message asks the bot to find us.

```js

if (message === 'find me') {
  // ...
}
```

The if-statement checks if we are asking the bot to find us. Or more specifically, you said "find me" in chat.

```js
const defaultMove = new Movements(bot)

const playerTarget = bot.players[username].entity // Gets the player entity
const pos = playerTarget.position

bot.pathfinder.setMovements(defaultMove) // Sets movements
bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 4))
// Bot will pathfind within 4 blocks of you
```

The first line of code creates a new `Movements` for the bot. Then, we get the player entity so that we can get it's position. Finally, we set the movements and the goal. To set the goal, we use the `GoalNear` class to make sure we pathfind within 4 blocks of the location.

```js
bot.once('goal_reached', () => {
  bot.chat('Found you!')
})
```

Once the goal is reached, the event listener will fire, and make the bot say "Found you!" in the chat.

[Full code](#find-me-bot)

![The bot found me!!](https://i.imgur.com/CAWQ7Wk.png)

## Adding TypeScript

[TypeScript](https://typescriptlang.org/) is a superset of JavaScript that adds static typing to the language. This makes it easier to write, maintain, and debug JavaScript code, especially for large applications. TypeScript is a typed language, which means that the types of variables and expressions are known at compile time. This helps to prevent errors and makes code more readable and maintainable.

Since there is TypeScript support in Mineflayer, we can make sure that we use the correct types for everything we do in Mineflayer, and also get very handy autocomplete for event names and functions.

![TypeScript in action](https://i.imgur.com/jvGmkH1.png)

To use TypeScript, go back into our command line and type: 

```bash
npm i -D typescript
```

We will use the `-D` flag to save this as a developer dependency.

Then, we will use the TypeScript compiler to create a `tsconfig.json` file.

```bash
npx tsc --init
```

Replace everything in your `tsconfig.json` file with this JSON. It is tailored towards Mineflayer development in Node.js.

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  }
}
```

Now, rename your `index.js` file to `index.ts` to change it to TypeScript. Do this with all of your code. Then, go in your command line and type:

```bash
npx tsc
```

This will compile all your code back into normal JavaScript so that we can run it with Node.js. If there are any errors when compiling, just go back and fix them, as the error messages should be pretty straightforward. Now if we run our code in dist/index.js, everything should work as expected.

```bash
node ./dist/index.js

... Code runs!
```

To speed up the process, we can make a script in our `package.json` file that compiles our code and runs it at the same time! Open your `package.json` file and locate the "scripts" attribute. Then paste in this code:

```json
"scripts": {
  "start": "npx tsc && node ./dist/index.js"
}
```

To run and compile at the same time, you can now type this in your command line:

```bash
npm start
```

Now you can start coding away in TypeScript with it's enourmous productivity boost and type-safe checks.

## Examples

### Find Me Bot

The bot from the [Plugins](#plugins) section.

```js
const mineflayer = require('mineflayer')
const mineflayerPathfinder = require('mineflayer-pathfinder')
const { pathfinder, Movements } = mineflayerPathfinder
const { GoalNear } = mineflayerPathfinder.goals

const bot = mineflayer.createBot({
  username: 'MineflayerBot',
  password: 'abc123',
  host: 'localhost',
  port: 25565
})

bot.loadPlugin(pathfinder)

bot.on('chat', (username, message) => {
  if (username === bot.username) return // To prevent infinite loop

  if (message === 'find me') {
    const defaultMove = new Movements(bot)

    const playerTarget = bot.players[username].entity // Gets the player entity
    const pos = playerTarget.position

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 4))

    bot.once('goal_reached', () => {
      bot.chat('Found you!')
    })
  }
})
```

### Dad Joke Chat Bot on Server

```
<Player> I'm happy
<MineflayerBot> Hey happy, I'm MineflayerBot!
```

```js
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  username: 'MineflayerBot',
  password: 'abc123',
  host: 'localhost',
  port: 25565
})

bot.once('spawn', () => {
  bot.addChatPattern('dad_joke', /^<(.+)> im (.+)$/, { parse: true })

  bot.on('chat:dad_joke', ([[username, word]]) => {
    if (username === bot.username) return null

    bot.chat('Hey ' + word + ', I\'m ' + bot.username + '!')
  })
})
```

Explanation on the RegExp can be found [here](https://regex101.com/r/zH4pTp/1).

## FAQ

### How do I find mineflayer modules?

If you want to find mineflayer modules, there are 3 ways.

1. Finding one made by PrismarineJS (on their GitHub profile), which includes many useful ones such as mineflayer-pathfinder, mineflayer-pvp, and mineflayer-tool.
2. Searching online, or asking around in the PrismarineJS Discord.
3. Contribute and make your own module!

### How to run a bot on android

Here is a quick setup for running a bot on an android device using [Termux](https://termux.com/).

#### Install Termux

Install [Termux](https://termux.com/) and start it.

#### Setup

Install `Node.js`:

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

To start the bot, run Node with the name of your script.

```bash
node script_name.js
```

❗️ For each time opening Termux you must change the cwd into `/sdcard/my_scripts`, before starting the bot:

```bash
cd /sdcard/my_scripts
```
