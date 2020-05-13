# Tutorial

Example can be found in the [examples](https://github.com/PrismarineJS/mineflayer/tree/master/examples) folder.

## Creating Simple plugin

Here basic example on how to create plugin.

```js
// myNamePlugin might be imported from another file
function myNamePlugin(bot, options) {
  function myNameIs(name = bot.username) {
    // Using bot.username as default name
    bot.chat(`My name is ${name}!`);
  }
  bot.myNameIs = myNameIs;
  // adding method into bot object
}

var bot = mineflayer.createBot({
  username: "Steve",
});
bot.loadPlugin(myNamePlugin);

bot.once("spawn", function () {
  bot.myNameIs(); // My name is Steve!
  bot.myNameIs("Alex"); // My name is Alex!
});
```

## Running bot on android

Here quick setup for running bot on android device using [Termux](https://termux.com/).

### Install Termux

Install [Termux](https://termux.com/) and start it.

### Setup

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

### Editing script

* Skip this step if you already familiar with scripting on CLI.
Install nano for editing script:

```bash
pkg install nano -y
```

Now you can use nano to creare / edit your script. Example:

```bash
nano myscript.js
```

Didn't know how to use it? Here [nano's official docs](https://nano-editor.org/dist/latest/nano.pdf), or search `How to use nano text editor`.

### Start your bot

Start the bot (normal mode):

```bash
node myscript.js
```

You can enable some protocol debugging output using `DEBUG` environment variable:

```bash
DEBUG="minecraft-protocol" node myscript.js
```

* Beware of flashing text on DEBUG mode.

### Updating library

First, update `nodejs` and `npm`:

```bash
pkg install nodejs -y
```

Then update `mineflayer`:

```bash
npm install mineflayer@latest
```
