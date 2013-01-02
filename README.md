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
