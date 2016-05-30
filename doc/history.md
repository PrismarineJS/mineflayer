## 1.7.5

* bump dependencies

## 1.7.4

* update minecraft-data

## 1.7.3

* add callback to activateBlock

## 1.7.2

* update dependencies

## 1.7.1

 * update minecraft-protocol, minecraft-data and protodef

## 1.7.0

 * listen for disconnect in login phase (thanks @deathcap)
 * fix multi_block_change (thanks @Corgano)
 * remove chat filter : fix utf8 in chat
 * add extra tolerance for malformed sign packets (thanks @G07cha)
 * adapt to new minecraft data entities format
 * update minecraft-protocol to 0.17.2
 

## 1.6.0

 * add functionalities to use scoreboard (thanks @jakibaki)
 * update to minecraft-data 0.16.3
 * 50 -> 20 tps for physics
 * Remove requireindex, for browserify support
 * add bot.setCommandBlock

## 1.5.3

 * fix entity_status

## 1.5.2

 * use prismarine-recipe and prismarine-windows
 * use require-self to be able to do require('mineflayer') in the examples
 * fix viewDistance sending

## 1.5.1

 * add checkTimeoutInterval to createBot

## 1.5.0

 * fix achievements parsing in toString()
 * update to nmp 0.16
 * use prismarine-item
 * add example to run multiple bots
 * uuid is now a dashed string
 * remove digging interruption : this doesn't happen in 1.8 servers (and caused problem in some spigot servers)

## 1.4.0

 * improve placeBlock : now use lookAt before placing and has a callback
 * fix soulsand speed
 * use new multi-version version of (node-)minecraft-data

## 1.3.0

 * swing arm on placing a block, look at center of block when activating a block (thanks gipsy-king)
 * refactor examples (thanks Pietro210)
 * add clickWindow support to ContainerWindow (thanks Gnomesley)
 * fix skylight in the nether
 * update node-mojangson to display unparsed text in case of error

## 1.2.1

 * Prevent crash when an unknown entity is spawned
 * add createBot to api.md

## 1.2.0

 * update minecraft-protocol to 0.14.0 : several fixes (error are now catchable, packets are in-order, packets fixes, etc.)
 * add ContainerWindow to support non-Vanilla plugins and add /invsee example (thanks Pietro210)
 * add a callback to bot.look and bot.lookAt
 * when receiving a remove effect packet : if the corresponding effect doesn't exist yet, emit an event with just the id of the effect (thanks Pietro210)
 * swing arm immediately when digging (thanks gipsy-king)
 * now updates bot.entity.heldItem when bot.heldItem is updated 
 * fix cli args in examples
 * add forcedMove event
 * fix equipment api
 * new minecraft data version : better metadata handling

## 1.1.2

 * a small fix in chat.js
 * add a licence file

## 1.1.1

 * bot.transfer is faster
 * fix arm_animation
 * using mojangson parser for chat hoverevent
 * add chat patterns for unidentified chat messages
 * fix player leaving

## 1.1.0

Lot of fixes and improvements in this version in order to support mineflayer 1.8.3, including :

 * minecraft 1.8.3 support
 * update minecraft protocol to 0.13.4
 * move enums data to minecraft-data
 * add automatic testing with a vanilla minecraft server on circle ci
 * add argv arguments to examples
 * refactor inventory.js
 * use new recipe format handling metadata better
 * fix lot of things to support 1.8.3 including :
  * block format change
  * position change : y is now always at the feet of the bot

## 1.0.0

 * updated minecraft protocol to 0.11 (Minecraft 1.6.2 support).
 * small changes in the arguments of some events: `chat`, `whisper` and `message`. See [doc/api.md](https://github.com/andrewrk/mineflayer/blob/master/doc/api.md).

## 0.1.1

 * updated minecraft protocol to 0.10 (Minecraft 1.5.2 support).

## 0.1.0

Huge thanks to [zuazo](https://github.com/zuazo) for debugging and
eliminating the problems with 1.5.1 protocol update and node 0.10 update!

 * update minecraft-protocol to 0.9.0 - includes many fixes
 * blocks: fix buffer length assertion error (thanks zuazo)
 * physics: fix assertion error (thanks zuazo)

## 0.0.35

 * inventory: window clicking waits a bit if you have just dug
   fixes a rejected transaction race condition.

## 0.0.34

 * inventory: equipping makes the quick bar a basic LRU cache.
   This can alleviate some race conditions when trying to equip a
   different tool immediately after digging.

## 0.0.33

 * crafting: fix shapeless recipe support
 * inventory: fix several instances which could cause transaction rejected
 * add missing recipes (thanks rom1504)
 * `recipe.delta` data structure changed.

## 0.0.32

 * digging: fix crash when not holding a tool

## 0.0.31

 * only stationary water has a negative effect on digging
 * digging: if you dig while already digging, instead of crashing,
   mineflayer will cancel the in progress dig and start the new one.
 * digging: in creative mode dig time is 0
 * digging interruption error has a code so you can check for it

## 0.0.30

 * expose the materials enum as `mineflayer.materials`

## 0.0.29

 * digging is faster and has less bugs
 * you can stop digging with `bot.stopDigging()`.
 * `bot.dig(block, [timeout], [callback])` changed to `bot.dig(block, [callback])`.
 * add `bot.digTime(block)`
 * add `block.material`
 * add `block.harvestTools`
 * add `window.emptySlotCount()`
 * block and item enums are cleaned up. Every block and item has an
   unambiguous `name` and `displayName`.

## 0.0.28

 * add missing recipe for wooden planks
 * fix various crafting and inventory bugs
 * unequip works with hand as a destination

## 0.0.27

 * add `mineflayer.Location` which can help you locate chunk boundaries
 * `entity.metadata` is formatted as an object instead of an array for
   easier access
 * `canDigBlock` returns `false` if `block` is `null` instead of crashing.

## 0.0.26

 * fix `bot.heldItem` being wrong sometimes
 * water and lava are not solid

## 0.0.25

 * `bot.equip` - wait at least a tick before calling callback

## 0.0.24

 * fix digging leaves not calling callback.

## 0.0.23

 * add enchantment table support. See `examples/chest.js` for an example.
 * rename `bot.tell` to `bot.whisper` to be consistent with 'whisper' event.
   (thanks Darthfett)

## 0.0.22

 * update vec3 to 0.1.3
 * add "whisper" chat event

## 0.0.21

This release is feature-complete with the old
[C++/Qt based version of mineflayer](https://github.com/andrewrk/mineflayer/blob/cpp-qt-end).

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
