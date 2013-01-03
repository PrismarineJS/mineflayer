# Mineflayer

Create Minecraft bots with a powerful, stable, and high level JavaScript API.

## Current Project Status

Supports Minecraft 1.4.6.

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
 * See `examples/`.

## Testing

(TODO) `npm test`

## Updating to a newer protocol version

1. Wait for a new version of [mineflayer-protocol](https://github.com/superjoe30/node-minecraft-protocol) to be released which supports the new Minecraft version.
2. `npm install --save minecraft-protocol`
3. Apply the [protocol changes](http://wiki.vg/Protocol_History) where necessary.
4. Run the test suite. See Testing above.
