# Mineflayer

Create Minecraft bots with a powerful, stable, and high level JavaScript API.

## Features

 * Supports Minecraft 1.4.6.
 * Entity knowledge - it knows when and where players, mobs, and objects spawn
   and despawn.
 * Block knowledge. You can query the world around you.
 * Chat
 * Lots of miscellaneous stuff such as knowing your health and whether it
   is raining.

### Roadmap

These things are in the works:

 * Physics and movement
 * Inventory management
 * Ability to use items and vehicles and attack
 * Digging

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
  bot.chat(message);
});
```

## Installation

`npm install mineflayer`

## Documentation

 * See `doc/api.md`.
 * See `doc/history.md`.
 * See `examples/`.

## Testing

`npm test`

## Updating to a newer protocol version

1. Wait for a new version of [mineflayer-protocol](https://github.com/superjoe30/node-minecraft-protocol) to be released which supports the new Minecraft version.
2. `npm install --save minecraft-protocol`
3. Apply the [protocol changes](http://wiki.vg/Protocol_History) where necessary.
4. Run the test suite. See Testing above.
