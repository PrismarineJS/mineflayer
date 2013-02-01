## 0.0.21

This release is feature-complete with the old
[C++/Qt based version of mineflayer](https://github.com/superjoe30/mineflayer/blob/cpp-qt-end).

 * add `bot.activateItem()`
 * add `bot.deactivateItem()`
 * add `bot.useOn(targetEntity)`

## 0.0.20

 * add dispenser support
   - add `mineflayer.Dispenser`
   - add `bot.openDispenser(dispenserBlock)`

## 0.0.19

 * add furnace support
   - add `mineflayer.Furnace`
   - add `bot.openFurnace(furnaceBlock)`
 * `mineflayer.Chest`: "update" event renamed to "updateSlot"
 * `bot.equip(itemType, destination, [callback])` changed to
   `bot.equip(item, destination, [callback])`. Use `bot.inventory.items()`
   to get a list of what items you can choose from to equip.
 * fix `bot.openChest` not working for ender chests
 * fix incorrectly scaled fuel percentage
 * upgrade to minecraft-protocol 0.7.0
   - `mineflayer.createBot` no longer takes a `email` argument.
   - The `username` and `password` arguments are used to authenticate with the
     official minecraft servers and determine the case-correct username. If
     you have migrated your user account to a mojang login, `username` looks
     like an email address.
   - If you leave out the `password` argument, `username` is used to connect
     directly to the server. In this case you will get kicked if the server is
     in online mode.

## 0.0.18

 * fix crash for some block updates

## 0.0.17

recalled

## 0.0.16

 * add chest support
   - add `mineflayer.Chest`
   - add `bot.openChest(chestBlock)`
 * `block.meta` renamed to `block.metadata`
 * `item.meta` renamed to `item.metadata`
 * fix crash when player causes entityGone message
 * update to minecraft-protocol 0.6.6

## 0.0.15

 * fix `bot.sleep` not working at all
 * add `bot.isSleeping`
 * add "sleep" event
 * add "wake" event
 * `bot.sleep(bedPoint)` changed to `bot.sleep(bedBlock)`
 * fix `mineflayer.Recipe` not exposed

## 0.0.14

 * add crafting support
   - add `mineflayer.windows`
   - add `mineflayer.Recipe`
   - `bot.inventory` is now an instance of `InventoryWindow`
   - `bot.inventory.count` is no longer a map of id to count.
     `Window` instances have a `count(itemType, [metadata])` method.
   - `bot.inventory.quickBarSlot` moved to `bot.quickBarSlot`.
   - add `'windowOpen' (window)` event
   - add `'windowClose' (window)` event
   - add `bot.craft(recipe, count, craftingTable, [callback])`
   - add `bot.recipesFor(itemType, metadata, minResultCount, craftingTable)`
 * `block.pos` renamed to `block.position`.
 * `'blockUpdate' (point)` event signature changed to
   `'blockUpdate' (oldBlock, newBlock)`
 * `'blockUpdate:(x, y, z)'` event signature changed to
   `'blockUpdate:(x, y, z)' (oldBlock, newBlock)`
 * add `'diggingAborted' (block)` event
 * add `bot.unequip(destination, [callback])`
 * add `bot.toss(itemType, metadata, count, [callback])`
 * `bot.startDigging(block)` changed to `bot.dig(block, [timeout], [callback])`.
 * add `bot.activateBlock(block)`

## 0.0.13

 * fix `bot.equip` when already equipping the item
 * fix some incorrect block physics
 * add `mineflayer.recipes` enum
 * fix crash when digging at a high elevation

## 0.0.12

 * add inventory support
   - add `Item` class which is exposed on `mineflayer`
   - add `bot.inventory` (see docs for more details)
   - add `bot.equip(itemType, destination, [callback])`
   - add `bot.tossStack(item, [callback])`
 * add digging support
   - add `bot.startDigging(block)`
   - add `bot.canDigBlock(block)`
 * blocks: add `blockUpdate:(x, y, z)` event.
 * add building support
   - add `bot.placeBlock(referenceBlock, faceVector)`
 * add `block.painting`
 * add `Painting` class which is exposed on `mineflayer`
 * add experience orb support
   - `entity.type` can be `orb` now
   - `entity.count` is how much experience you get for collecting it

## 0.0.11

 * physics: skip frames instead of glitching out
 * default bot name to Player - `createBot` can take no arguments now.

## 0.0.10

 * physics: fix bug: walking too slowly on Z axis

## 0.0.9

 * ability to sprint (thanks ruan942)
 * fix color code stripping (thanks rom1504)
 * event "onNonSpokenChat" deleted
 * new event "message" which fires for all messages
 * `bot.chat` no longer checks for "/tell" at the beginning
 * add `bot.tell(username, message)` method
 * fix crash when an entity effect occurs

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
