## 0.0.8

 * chat: no longer suppress "chat" events for your own chat (thanks Darthfett).
 * ability to mount / dismount vehicles and attack
 * physics: fix tall grass and dead bushes treated as solid
 * fix "respawn" event firing twice sometimes
 * remove `bot.spawn()` and `autoSpawn` option. auto spawn is now mandatory.
 * fix sending spawn packet twice on init
 * fix bots spawning with their heads on backwards
 * fix bots jumping when they get hit
 * update player heights when they crouch
 * add support for signs: `block.signText` and `bot.updateSign(block, text)`

## 0.0.7

 * add `bot.time.day` and `bot.time.age` and "time" event
 * add `bot.entities` which is a map of the entities around you
 * add `bot.look(yaw, pitch, force)` and `bot.lookAt(point, force)`

## 0.0.6

 * add a physics engine which understands gravity
 * add jumper example, jumps whenever you chat
 * add `respawn` event which fires when you die or change dimensions
 * Block instances have a `boundingBox` property, which is currently either
   `solid` or `empty`.
 * fix `game` event to fire correctly
 * `bot.game.spawnPoint` moved to `bot.spawnPoint`.
 * `bot.game.players` moved to `bot.players`.
 * `bot.quit` has a default reason of "disconnect.quitting" (thanks Darthfett)

## 0.0.5

 * unload chunks when changing dimensions
 * blocks: handle all forms of block changing so that `blockAt` is always
   accurate.

## 0.0.4

 * expose Block, Biome, and Entity

## 0.0.3

 * add `bot.blockAt(point)` which returns a `Block`
 * add `mineflayer.blocks`, `mineflayer.biomes`, and `mineflayer.items` 
 * add bot `chunk` event
 * fix `spawn` event and `settings.showCape`
 * added chatterbox example
 * changed `entityDetach` event to have a vehicle argument
 * changed `entityEffectEnd` event to have an effect argument
   instead of `effectId`
 * fix prefixes in pseudos in chat. (thanks rom1504)
 * update vec3 to 0.1.0 which uses euclidean modulus

## 0.0.2

 * add bot.game.spawnPoint
 * add spawn support
 * add rain support
 * add support for getting kicked
 * add settings support
 * add experience support
 * add bed support
 * health status knowledge
 * add entity tracking API
