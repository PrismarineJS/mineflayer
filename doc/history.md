## 0.0.6

 * add a physics engine which understands gravity
 * add jumper example, jumps whenever you chat
 * add `respawn` event which fires when you die or change dimensions
 * Block instances have a `boundingBox` property, which is currently either
   `solid` or `empty`.
 * fix `game` event to fire correctly
 * `bot.game.spawnPoint` moved to `bot.spawnPoint`.
 * `bot.game.players` moved to `bot.players`.

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
