## 3.6.0
* add bot.addChatPattern() & bot.addChatPatternSet() & deprecate bot.chatAddPattern() (@U9G)

## 3.5.0
* Add common errors to FAQ (@U9G)
* Move mosts of index.js to lib/loader.js (@U9G)
* Improve packet_info handling (@Karang)
* Add getControlState function (@Camezza)

## 3.4.0
* fix once leak in placeBlock (@Karang)
* allow sleeping during rain/thunderstorms (@qrvd)
* Change transaction apology packet to match vanilla client (@FeldrinH)

## 3.3.3
* fix world switch leak

## 3.3.2
* fix entity names

## 3.3.1
* fix stop digging (@Karang)

## 3.3.0
* trading fix (@validgem)
* fix enchantments (@goncharovchik)
* fix newListener and removeListener stacking on world change (@U5B)
* add a 'messagestr' event (@U9G)
* Add an option forceLook for place block similar to the digging one (@CyberPatrick)
* Can see block add intersect match (@sefirosweb)
* Add ability to use an anvil fully (@U9G)

## 3.2.0
* Fix position in getBlock()

## 3.1.0
* Fix typings of findBlock and findBlocks (@csorfab)
* place block improvements (@Karang)
* add face option to dig (@IceTank)
* trading fixes (@validgem)
* world events exposed by pworld (@u9g)
* fix wait for ticks and expose physicsEnabled (@Karang)

## 3.0.0
* added null or undefined check in inventory (@u9g)
* Removed broken use of "this" in physics.js (@TheDudeFromCI)
* Promisify testCommon (@ArcticZeroo)
* Fixed Bot not skipping end credits (@IceTank)
* BREAKING: Simplify windows API and promisify tests (@Karang) : several methods and events from window API were changed:
  * Removed Chest, EnchantmentTable, Furnace, Dispenser and Villager classes (they all are Windows now)
  * Dispensers are now handled by the same code as other containers, hopper too (they were missing)
  * There is now only 2 events signaling a slot update ("updateSlot" and "updateSlot:slotId" of the Window class) (before there was: "setSlot", "setSlot:windowId", "windowUpdate", "updateSlot", on 3 different eventEmitter (and not all of them were working properly))
  * All windows (present and future) now have a withdraw and deposit function

## 2.41.0
* Fix Time type definition (@hivivo)
* Add face for block in sight result (@Karang)
* Fix skin restorer bug (@TheDudeFromCI)
* Improve enchantment table info (@Karang)
* 1.16.5 support (@rom1504)

## 2.40.1
* Fix for not handling negative numbers in time plugin (@Naomi)
* Fix typescript Bot definition (@rom1504)

## 2.40.0
* fix for dig ignore (@TheDudeFromCI)
* better calculation of digging range (@goncharovchik)
* emit death once (@extremeheat)
* add waitForTicks function (@TheDudeFromCI)
* add null check for sign text (@u9g)

## 2.39.2
* explicit node 14 support

## 2.39.1
* add null check in bot.dig (@rom1504)
* Fix deprecation warning for block in sight (@Karang)

## 2.39.0
* Add number support to bot.chat (@BlueBurgersTDD)
* Fixed && Improved blockFind function with useExtraInfo = true (@magicaltoast)
* Added option to allow the bot to keep it's head in place when mining. (@TheDudeFromCI)

## 2.38.0
* Add bot.game.serverBrand property (@Karang)
* set extraInfos to false in blockIsNotEmpty (@mat-1)
* make the ChatMessage.toAnsi:lang argument optional (@Antonio32A)
* Fixed message types (@TheDudeFromCI)
* by default hideErrors is now true (@rom1504)

## 2.37.1
* Optimize lookAt promise behavior (@ph0t0shop)

## 2.37.0
* Promisify villager & Trader (thanks @ph0t0shop)
* protect against action id going over 32767 (@rom1504)
* fix incorrect handling of username definition (@rom1504)

## 2.36.0
* all async method now both return promises and take a callback (thanks @ph0t0shop for this great improvement)

## 2.35.0
* Extra position packet after TP
* Add blockAtCursor
* Deprecate blockInSight
* TS typing fixes

## 2.34.0
* 1.16.4 support

## 2.33.0
* block_actions fix (thanks @SpikeThatMike)
* typescript fixes (thanks @TheDudeFromCI and @NotSugden)
* add uuid by objectUUID handling (thanks @Rob9315)
* fix bed packet (thanks @imharvol)
* better plugin handling (thanks @TheDudeFromCI)

## 2.32.0
* 1.16.3 support (thanks @GroobleDierne and @TheDudeFromCI)
* fix bug with entity width (thanks @TheDudeFromCI)
* Add ability to call openChest on shulker boxes (thanks @efunneko)

## 2.31.0
* Fix furnace and add tests (thanks @ImHarvol)
* Add offhand param to d.ts (thanks @TheDudeFromCI)
* Add hasAttackCooldown feature (thanks @TheDudeFromCI)
* Add type validation for bot.chat (thanks @BlueBurgersTDD)
* Add chat position to message event (thanks @larspapen)

## 2.30.0
* Add support for Barrel (#1344) (thanks @ImHarvol)
* Fix attack cooldown bug (thanks @TheDudeFromCI)
* Exposed getDestSlot (thanks @TheDudeFromCI)
* Simplify setCommandBlock arguments (thanks @ImHarvol)
* hide unknown transaction warning if hideErrors option is enabled

## 2.29.1
* fix findblock typescript def (thanks @TheDudeFromCI)
* fix setCommandBlock for recent versions (thanks @ImHarvol)

## 2.29.0
* Add hand parameter to activateItem (thanks @Karang)
* remove _chunkColumn from the api (bot.world should now be used)
* Handle MC|AdvCmd misspelling (thanks @ImHarvol)

## 2.28.1
* fix findBlocks (thanks @Karang)

## 2.28.0
* add nearestEntity function (thanks @Karang)

## 2.27.0
* add heldItemChanged

## 2.26.0
* use and expose prismarine-world as bot.world
* add itemDrop event (thanks @ImHarvol)
* fix bot.fish callback (thanks @GroobleDierne)
* parse entity metadata for crouching (thanks @IdanHo)
* fix bot.time.day (thanks @Naomi-alt)
* improve find blocks options (thanks @Karang)

## 2.25.0
* emit chestLidMove (thanks @imharvol)
* add options for main hand selection (thanks @Colten-Covington)
* fix respawning columns issues (thanks @Karang)

## 2.24.0
* Fix getBlockAt when outside bounds
* Improve documentation and examples
* Add ability to change the skin parts of a bot (thanks @Naomi-alt)

## 2.23.0
* 1.16 support
* fix noteheard (thanks @Naomi-alt)

## 2.22.1
* better typedef (thanks @Konstantin)
* fix off by 1 error in findBlocks (thanks @Karang)
* physics.js look fix (thanks @thesourceoferror)
* fix chat message bracketing (thanks @Nurutomo)
* use prismarine-physics

## 2.22.0
* Improve digTime computation (thanks @Karang)
* expose blockEntity.raw (thanks @SiebeDW)
* improve typedef for find block options (thanks @TheDudeFromCI)

## 2.21.0
* don't log errors if hideErrors is true

## 2.20.0
* add extra infos option in find block

## 2.19.2
* fix ground up for 1.13->1.15

## 2.19.1
* fix find block (thanks @Karang)
* improve sign parsing (thanks @cookiedragon234)

## 2.19.0
* much faster findBlock (thanks @Karang)

## 2.18.0
* fix bugs in lookAt and setQuickBarSlot
* add auto_totem example (thanks @AlexProgrammerDE)
* improve blockAt speed

## 2.17.0
* physics engine refactor (thanks @Karang)
* mcdata update for better 1.14 and 1.15 support

## 2.16.0
* use protodef compiler (thanks @Karang)
* off-hand support (thanks @Karang)
* fix type definitions (thanks @dada513)

## 2.15.0
* fix transfer bugs (thanks @Karang)
* add typescript definitions (thanks @IdanHo)

## 2.14.1
* fix openVillager

## 2.14.0
* 1.15 support
* russian translation (thanks @shketov)

## 2.13.0
* 1.14 support : more tests, refactored pwindows, feature flags (thanks @Karang)
* Look at the center of the face when placing block
* improve bot.sleep : don't sleep if mob are present (thanks @ImHarvol)

## 2.12.0
* 1.13 support (thanks @Karang, @hornta, @SiebeDW)
* better fishing support (thanks @hutu13879513663)

## 2.11.0
* Expose columns & blockEntities (thanks @SiebeDW)
* Create discord.js (thanks @SiebeDW)
* change amount of slots based on version (thanks @IdanHo)
* Fix 'respawn' event (thanks @ImHarvol)
* Add callback to creative set block (thanks @wvffle)

## 2.10.0
Lot of fixes from @wvffle in this release :
* more checks when digging
* expose a bot.swingArgm() function
* better toString to chat message
* fix handling of empty signs
* correct handling of entity metadata change
And some others :
* new tps plugin by @SiebeDW
* correct handling of chunk unloading by @IdanHo

## 2.9.6
* fix logErrors option

## 2.9.5
* fix logErrors

## 2.9.4
* enable catching and logging of errors by default

## 2.9.3
* fix typo in variable name actionId

## 2.9.2
* improve pushback (thanks @Vap0r1ze)
* more robust handling of tablist (thanks @wvffle)
* ignore (with a warning) transaction without previous click

## 2.9.1
* improve boss bar
* add checks in scoreboard implementation

## 2.9.0

* add universal chat patterns to support more chat plugins

## 2.8.1

* fix error on scoreboard removal

## 2.8.0

lot of new features from @wvffle :

* support for block entities
* improved block bars support
* add block in sight
* fix scoreboard support
* add eating support
* add tab complete support
* add fishing support
* better sign text support
* repl example

## 2.7.5

* improve basic find block a bit

## 2.7.4

* start the bot alive in all cases
* correct run speed and use it to limit the speed properly (thanks @CheezBarger)
* emit error instead of throwing when loading a chunk (thanks @ArcticZeroo)

## 2.7.3

* use docsify for docs

## 2.7.2

* don't do anything if transaction.action < 0 (fix for some non-vanilla plugins)

## 2.7.1

* include fixes from pchunk, protodef and mcdata

## 2.7.0

* fix cannot jump repeatedly
* fix spaces in chatmessage (thanks @Gjum)
* add bot.getControlStates (thanks @ArcticZeroo)
* Support end dimension (thanks @iRath96)
* Added sneaking option to controll states (thanks @Meldiron)
* add title event (thanks @yario-o)
* Update sound.js to include hardcoded sound effects (thanks @jeresuikkila)
* Support for the new launcher_profiles.json format  (thanks @Amezylst)
* update api about checkTimeoutInterval

## 2.6.1

* fix chatmessage
* add plugins to bot options to be able to disable an internal plugin

## 2.6.0

* improve ChatMessage translation functionality (thanks @plexigras)
* added eslint
* es6
* fix autoversion in online mode

## 2.5.0

* don't swing arm when activating an entity
* new plugin loading api

## 2.4.1

* better 1.12 support

## 2.4.0

* auto version detection (thanks @plexigras)

## 2.3.0

* support version 1.12 (thanks @jonathanperret)
* add example to use minecraft session file for auth (thanks @plexigras)

## 2.2.0

* added book writing plugin (thanks @plexigras)
* Make sure bot.time.day is between 0 and 24000 (thanks @roblabla)
* Pass skyLightSent to Chunk.load (thanks @iRath96)

## 2.1.1

* use protodef aliases to properly define channels

## 2.1.0

* add bot.canSeeBlock (thanks @Nixes)
* handle unknown entities and entities sent with their internal id
* add bloodhound to plugin list
* fix chat hoverEvent for 1.9

## 2.0.0

* added support for minecraft chests (thanks @plexigras)
* cross version support : 1.8, 1.9, 1.10 and 1.11 now supported
* [BREAKING] prismarine classes (Block, Entity, Recipe, ...) are now available only by requiring them, not in mineflayer.X. It was required to make cross version possible. minecraft-data is also to be required directly and not available as mineflayer.blocks. The code depending on this should be updated, hence the major version.

## 1.8.0

* add actionBar event (thanks @ArcticZeroo)
* added support for villager trading (thanks @plexigras)

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
