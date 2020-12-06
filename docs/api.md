<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [API](#api)
  - [Enums](#enums)
    - [minecraft-data](#minecraft-data)
    - [mcdata.blocks](#mcdatablocks)
    - [mcdata.items](#mcdataitems)
    - [mcdata.materials](#mcdatamaterials)
    - [mcdata.recipes](#mcdatarecipes)
    - [mcdata.instruments](#mcdatainstruments)
    - [mcdata.biomes](#mcdatabiomes)
    - [mcdata.entities](#mcdataentities)
  - [Classes](#classes)
    - [vec3](#vec3)
    - [mineflayer.Location](#mineflayerlocation)
    - [Entity](#entity)
    - [Block](#block)
    - [Biome](#biome)
    - [Item](#item)
    - [windows.Window (base class)](#windowswindow-base-class)
    - [Recipe](#recipe)
    - [mineflayer.Chest](#mineflayerchest)
      - [chest.window](#chestwindow)
      - [chest "open"](#chest-open)
      - [chest "close"](#chest-close)
      - [chest "updateSlot" (oldItem, newItem)](#chest-updateslot-olditem-newitem)
      - [chest.close()](#chestclose)
      - [chest.deposit(itemType, metadata, count, [callback])](#chestdeposititemtype-metadata-count-callback)
      - [chest.withdraw(itemType, metadata, count, [callback])](#chestwithdrawitemtype-metadata-count-callback)
      - [chest.count(itemType, [metadata])](#chestcountitemtype-metadata)
      - [chest.items()](#chestitems)
    - [mineflayer.Furnace](#mineflayerfurnace)
      - [furnace "open"](#furnace-open)
      - [furnace "close"](#furnace-close)
      - [furnace "update"](#furnace-update)
      - [furnace "updateSlot" (oldItem, newItem)](#furnace-updateslot-olditem-newitem)
      - [furnace.close()](#furnaceclose)
      - [furnace.takeInput([callback])](#furnacetakeinputcallback)
      - [furnace.takeFuel([callback])](#furnacetakefuelcallback)
      - [furnace.takeOutput([callback])](#furnacetakeoutputcallback)
      - [furnace.putInput(itemType, metadata, count, [cb])](#furnaceputinputitemtype-metadata-count-cb)
      - [furnace.putFuel(itemType, metadata, count, [cb])](#furnaceputfuelitemtype-metadata-count-cb)
      - [furnace.inputItem()](#furnaceinputitem)
      - [furnace.fuelItem()](#furnacefuelitem)
      - [furnace.outputItem()](#furnaceoutputitem)
      - [furnace.fuel](#furnacefuel)
      - [furnace.progress](#furnaceprogress)
    - [mineflayer.Dispenser](#mineflayerdispenser)
      - [dispenser "open"](#dispenser-open)
      - [dispenser "close"](#dispenser-close)
      - [dispenser "updateSlot" (oldItem, newItem)](#dispenser-updateslot-olditem-newitem)
      - [dispenser.close()](#dispenserclose)
      - [dispenser.items()](#dispenseritems)
      - [dispenser.deposit(itemType, metadata, count, [callback])](#dispenserdeposititemtype-metadata-count-callback)
      - [dispenser.withdraw(itemType, metadata, count, [callback])](#dispenserwithdrawitemtype-metadata-count-callback)
      - [dispenser.count(itemType, [metadata])](#dispensercountitemtype-metadata)
    - [mineflayer.EnchantmentTable](#mineflayerenchantmenttable)
      - [enchantmentTable "open"](#enchantmenttable-open)
      - [enchantmentTable "close"](#enchantmenttable-close)
      - [enchantmentTable "updateSlot" (oldItem, newItem)](#enchantmenttable-updateslot-olditem-newitem)
      - [enchantmentTable "ready"](#enchantmenttable-ready)
      - [enchantmentTable.close()](#enchantmenttableclose)
      - [enchantmentTable.targetItem()](#enchantmenttabletargetitem)
      - [enchantmentTable.enchantments](#enchantmenttableenchantments)
      - [enchantmentTable.enchant(choice, [callback])](#enchantmenttableenchantchoice-callback)
      - [enchantmentTable.takeTargetItem([callback])](#enchantmenttabletaketargetitemcallback)
      - [enchantmentTable.putTargetItem(item, [callback])](#enchantmenttableputtargetitemitem-callback)
    - [mineflayer.Villager](#mineflayervillager)
      - [villager "open"](#villager-open)
      - [villager "close"](#villager-close)
      - [villager "updateSlot" (oldItem, newItem)](#villager-updateslot-olditem-newitem)
      - [villager "ready"](#villager-ready)
      - [villager.close()](#villagerclose)
      - [villager.trades](#villagertrades)
      - [villager.trade(tradeIndex, [times], [cb])](#villagertradetradeindex-times-cb)
    - [mineflayer.ScoreBoard](#mineflayerscoreboard)
      - [ScoreBoard.name](#scoreboardname)
      - [ScoreBoard.title](#scoreboardtitle)
      - [ScoreBoard.itemsMap](#scoreboarditemsmap)
      - [ScoreBoard.items](#scoreboarditems)
    - [mineflayer.BossBar](#mineflayerbossbar)
      - [BossBar.title](#bossbartitle)
      - [BossBar.health](#bossbarhealth)
      - [BossBar.dividers](#bossbardividers)
      - [BossBar.entityUUID](#bossbarentityuuid)
      - [BossBar.shouldDarkenSky](#bossbarshoulddarkensky)
      - [BossBar.isDragonBar](#bossbarisdragonbar)
      - [BossBar.createFog](#bossbarcreatefog)
      - [BossBar.color](#bossbarcolor)
  - [Bot](#bot)
    - [mineflayer.createBot(options)](#mineflayercreatebotoptions)
    - [Properties](#properties)
      - [bot.world](#botworld)
      - [bot.entity](#botentity)
      - [bot.entities](#botentities)
      - [bot.username](#botusername)
      - [bot.spawnPoint](#botspawnpoint)
      - [bot.game.levelType](#botgameleveltype)
      - [bot.game.dimension](#botgamedimension)
      - [bot.game.difficulty](#botgamedifficulty)
      - [bot.game.gameMode](#botgamegamemode)
      - [bot.game.hardcore](#botgamehardcore)
      - [bot.game.maxPlayers](#botgamemaxplayers)
    - [bot.player](#botplayer)
      - [bot.players](#botplayers)
      - [bot.isRaining](#botisraining)
      - [bot.chatPatterns](#botchatpatterns)
      - [bot.settings.chat](#botsettingschat)
      - [bot.settings.colorsEnabled](#botsettingscolorsenabled)
      - [bot.settings.viewDistance](#botsettingsviewdistance)
      - [bot.settings.difficulty](#botsettingsdifficulty)
      - [bot.settings.skinParts.showCape](#botsettingsskinpartsshowcape)
      - [bot.settings.skinParts.showJacket](#botsettingsskinpartsshowjacket)
      - [bot.settings.skinParts.showLeftSleeve](#botsettingsskinpartsshowleftsleeve)
      - [bot.settings.skinParts.showRightSleeve](#botsettingsskinpartsshowrightsleeve)
      - [bot.settings.skinParts.showLeftPants](#botsettingsskinpartsshowleftpants)
      - [bot.settings.skinParts.showRightPants](#botsettingsskinpartsshowrightpants)
      - [bot.settings.skinParts.showHat](#botsettingsskinpartsshowhat)
      - [bot.experience.level](#botexperiencelevel)
      - [bot.experience.points](#botexperiencepoints)
      - [bot.experience.progress](#botexperienceprogress)
      - [bot.health](#bothealth)
      - [bot.food](#botfood)
      - [bot.foodSaturation](#botfoodsaturation)
      - [bot.physics](#botphysics)
      - [bot.time.time](#bottimetime)
      - [bot.time.timeOfDay](#bottimetimeofday)
      - [bot.time.day](#bottimeday)
      - [bot.time.isDay](#bottimeisday)
      - [bot.time.moonPhase](#bottimemoonphase)
      - [bot.time.age](#bottimeage)
      - [bot.quickBarSlot](#botquickbarslot)
      - [bot.inventory](#botinventory)
      - [bot.targetDigBlock](#bottargetdigblock)
      - [bot.isSleeping](#botissleeping)
      - [bot.scoreboards](#botscoreboards)
      - [bot.scoreboard](#botscoreboard)
      - [bot.controlState](#botcontrolstate)
    - [Events](#events)
      - ["chat" (username, message, translate, jsonMsg, matches)](#chat-username-message-translate-jsonmsg-matches)
      - ["whisper" (username, message, translate, jsonMsg, matches)](#whisper-username-message-translate-jsonmsg-matches)
      - ["actionBar" (jsonMsg)](#actionbar-jsonmsg)
      - ["message" (jsonMsg, position)](#message-jsonmsg-position)
      - ["login"](#login)
      - ["spawn"](#spawn)
      - ["respawn"](#respawn)
      - ["game"](#game)
      - ["title"](#title)
      - ["rain"](#rain)
      - ["time"](#time)
      - ["kicked" (reason, loggedIn)](#kicked-reason-loggedin)
      - ["end"](#end)
      - ["spawnReset"](#spawnreset)
      - ["death"](#death)
      - ["health"](#health)
      - ["entitySwingArm" (entity)](#entityswingarm-entity)
      - ["entityHurt" (entity)](#entityhurt-entity)
      - ["entityWake" (entity)](#entitywake-entity)
      - ["entityEat" (entity)](#entityeat-entity)
      - ["entityCrouch" (entity)](#entitycrouch-entity)
      - ["entityUncrouch" (entity)](#entityuncrouch-entity)
      - ["entityEquip" (entity)](#entityequip-entity)
      - ["entitySleep" (entity)](#entitysleep-entity)
      - ["entitySpawn" (entity)](#entityspawn-entity)
      - ["itemDrop" (entity)](#itemdrop-entity)
      - ["playerCollect" (collector, collected)](#playercollect-collector-collected)
      - ["entityGone" (entity)](#entitygone-entity)
      - ["entityMoved" (entity)](#entitymoved-entity)
      - ["entityDetach" (entity, vehicle)](#entitydetach-entity-vehicle)
      - ["entityAttach" (entity, vehicle)](#entityattach-entity-vehicle)
      - ["entityUpdate" (entity)](#entityupdate-entity)
      - ["entityEffect" (entity, effect)](#entityeffect-entity-effect)
      - ["entityEffectEnd" (entity, effect)](#entityeffectend-entity-effect)
      - ["playerJoined" (player)](#playerjoined-player)
      - ["playerLeft" (player)](#playerleft-player)
      - ["blockUpdate" (oldBlock, newBlock)](#blockupdate-oldblock-newblock)
      - ["blockUpdate:(x, y, z)" (oldBlock, newBlock)](#blockupdatex-y-z-oldblock-newblock)
      - ["chunkColumnLoad" (point)](#chunkcolumnload-point)
      - ["chunkColumnUnload" (point)](#chunkcolumnunload-point)
      - ["soundEffectHeard" (soundName, position, volume, pitch)](#soundeffectheard-soundname-position-volume-pitch)
      - ["hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)](#hardcodedsoundeffectheard-soundid-soundcategory-position-volume-pitch)
      - ["noteHeard" (block, instrument, pitch)](#noteheard-block-instrument-pitch)
      - ["pistonMove" (block, isPulling, direction)](#pistonmove-block-ispulling-direction)
      - ["chestLidMove" (block, isOpen, block2)](#chestlidmove-block-isopen-block2)
      - ["blockBreakProgressObserved" (block, destroyStage)](#blockbreakprogressobserved-block-destroystage)
      - ["blockBreakProgressEnd" (block)](#blockbreakprogressend-block)
      - ["diggingCompleted" (block)](#diggingcompleted-block)
      - ["diggingAborted" (block)](#diggingaborted-block)
      - ["move"](#move)
      - ["forcedMove"](#forcedmove)
      - ["mount"](#mount)
      - ["dismount" (vehicle)](#dismount-vehicle)
      - ["windowOpen" (window)](#windowopen-window)
      - ["windowClose" (window)](#windowclose-window)
      - ["sleep"](#sleep)
      - ["wake"](#wake)
      - ["experience"](#experience)
      - ["scoreboardCreated" (scoreboard)](#scoreboardcreated-scoreboard)
      - ["scoreboardDeleted" (scoreboard)](#scoreboarddeleted-scoreboard)
      - ["scoreboardTitleChanged" (scoreboard)](#scoreboardtitlechanged-scoreboard)
      - ["scoreUpdated" (scoreboard, item)](#scoreupdated-scoreboard-item)
      - ["scoreRemoved" (scoreboard, item)](#scoreremoved-scoreboard-item)
      - ["scoreboardPosition" (position, scoreboard)](#scoreboardposition-position-scoreboard)
      - ["bossBarCreated" (bossBar)](#bossbarcreated-bossbar)
      - ["bossBarDeleted" (bossBar)](#bossbardeleted-bossbar)
      - ["bossBarUpdated" (bossBar)](#bossbarupdated-bossbar)
      - ["heldItemChanged" (heldItem)](#helditemchanged-helditem)
    - [Functions](#functions)
      - [bot.blockAt(point, extraInfos=true)](#botblockatpoint-extrainfostrue)
      - [bot.waitForChunksToLoad(cb)](#botwaitforchunkstoloadcb)
      - [bot.blockInSight(maxSteps, vectorLength)](#botblockinsightmaxsteps-vectorlength)
      - [bot.blockAtCursor(maxDistance=256)](#botblockatcursormaxdistance256)
      - [bot.canSeeBlock(block)](#botcanseeblockblock)
      - [bot.findBlocks(options)](#botfindblocksoptions)
      - [bot.findBlock(options)](#botfindblockoptions)
      - [bot.canDigBlock(block)](#botcandigblockblock)
      - [bot.recipesFor(itemType, metadata, minResultCount, craftingTable)](#botrecipesforitemtype-metadata-minresultcount-craftingtable)
      - [bot.recipesAll(itemType, metadata, craftingTable)](#botrecipesallitemtype-metadata-craftingtable)
      - [bot.nearestEntity(match = (entity) => { return true })](#botnearestentitymatch--entity---return-true-)
    - [Methods](#methods)
      - [bot.end()](#botend)
      - [bot.quit(reason)](#botquitreason)
      - [bot.tabComplete(str, cb, [assumeCommand], [sendBlockInSight])](#bottabcompletestr-cb-assumecommand-sendblockinsight)
      - [bot.chat(message)](#botchatmessage)
      - [bot.whisper(username, message)](#botwhisperusername-message)
      - [bot.chatAddPattern(pattern, chatType, description)](#botchataddpatternpattern-chattype-description)
      - [bot.setSettings(options)](#botsetsettingsoptions)
      - [bot.loadPlugin(plugin)](#botloadpluginplugin)
      - [bot.loadPlugins(plugins)](#botloadpluginsplugins)
      - [bot.sleep(bedBlock, [cb])](#botsleepbedblock-cb)
      - [bot.isABed(bedBlock)](#botisabedbedblock)
      - [bot.wake([cb])](#botwakecb)
      - [bot.setControlState(control, state)](#botsetcontrolstatecontrol-state)
      - [bot.clearControlStates()](#botclearcontrolstates)
      - [bot.lookAt(point, [force], [callback])](#botlookatpoint-force-callback)
      - [bot.look(yaw, pitch, [force], [callback])](#botlookyaw-pitch-force-callback)
      - [bot.updateSign(block, text)](#botupdatesignblock-text)
      - [bot.equip(item, destination, [callback])](#botequipitem-destination-callback)
      - [bot.unequip(destination, [callback])](#botunequipdestination-callback)
      - [bot.tossStack(item, [callback])](#bottossstackitem-callback)
      - [bot.toss(itemType, metadata, count, [callback])](#bottossitemtype-metadata-count-callback)
      - [bot.dig(block, [forceLook = true], [callback])](#botdigblock-forcelook--true-callback)
      - [bot.stopDigging()](#botstopdigging)
      - [bot.digTime(block)](#botdigtimeblock)
      - [bot.placeBlock(referenceBlock, faceVector, cb)](#botplaceblockreferenceblock-facevector-cb)
      - [bot.activateBlock(block, [callback])](#botactivateblockblock-callback)
      - [bot.activateEntity(entity, [callback])](#botactivateentityentity-callback)
      - [bot.activateEntityAt(entity, position, [callback])](#botactivateentityatentity-callback)
      - [bot.consume(callback)](#botconsumecallback)
      - [bot.fish(callback)](#botfishcallback)
      - [bot.activateItem(offHand=false)](#botactivateitemoffhandfalse)
      - [bot.deactivateItem()](#botdeactivateitem)
      - [bot.useOn(targetEntity)](#botuseontargetentity)
      - [bot.attack(entity)](#botattackentity)
      - [bot.swingArm([hand])](#botswingarmhand)
      - [bot.mount(entity)](#botmountentity)
      - [bot.dismount()](#botdismount)
      - [bot.moveVehicle(left,forward)](#botmovevehicleleftforward)
      - [bot.setQuickBarSlot(slot)](#botsetquickbarslotslot)
      - [bot.craft(recipe, count, craftingTable, [callback])](#botcraftrecipe-count-craftingtable-callback)
      - [bot.writeBook(slot, pages, [callback])](#botwritebookslot-pages-callback)
      - [bot.openChest(chestBlock or minecartchestEntity)](#botopenchestchestblock-or-minecartchestentity)
      - [bot.openFurnace(furnaceBlock)](#botopenfurnacefurnaceblock)
      - [bot.openDispenser(dispenserBlock)](#botopendispenserdispenserblock)
      - [bot.openEnchantmentTable(enchantmentTableBlock)](#botopenenchantmenttableenchantmenttableblock)
      - [bot.openVillager(villagerEntity)](#botopenvillagervillagerentity)
      - [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)
      - [bot.setCommandBlock(pos, command, track_output, [mode])](#botsetcommandblockpos-command-track_output-mode)
      - [bot.supportFeature(name)](#botsupportfeaturename)
    - [Lower level inventory methods](#lower-level-inventory-methods)
      - [bot.clickWindow(slot, mouseButton, mode, cb)](#botclickwindowslot-mousebutton-mode-cb)
      - [bot.putSelectedItemRange(start, end, window, slot, cb)](#botputselecteditemrangestart-end-window-slot-cb)
      - [bot.putAway(slot, cb)](#botputawayslot-cb)
      - [bot.closeWindow(window)](#botclosewindowwindow)
      - [bot.transfer(options, cb)](#bottransferoptions-cb)
      - [bot.openBlock(block, Class)](#botopenblockblock-class)
      - [bot.openEntity(entity, Class)](#botopenentityentity-class)
      - [bot.moveSlotItem(sourceSlot, destSlot, cb)](#botmoveslotitemsourceslot-destslot-cb)
      - [bot.updateHeldItem()](#botupdatehelditem)
      - [bot.getEquipmentDestSlot(destination)](#botgetequipmentdestslotdestination)
    - [bot.creative](#botcreative)
      - [bot.creative.setInventorySlot(slot, item, [callback])](#botcreativesetinventoryslotslot-item-callback)
      - [bot.creative.flyTo(destination, [cb])](#botcreativeflytodestination-cb)
      - [bot.creative.startFlying()](#botcreativestartflying)
      - [bot.creative.stopFlying()](#botcreativestopflying)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API

## Enums

These enums are stored in the language independent [minecraft-data](https://github.com/PrismarineJS/minecraft-data) project,
 and accessed through [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

### minecraft-data
The data is available in [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data) module

`require('minecraft-data')(bot.version)` gives you access to it.

### mcdata.blocks
blocks indexed by id

### mcdata.items
items indexed by id

### mcdata.materials

The key is the material. The value is an object with the key as the item id
of the tool and the value as the efficiency multiplier.

### mcdata.recipes
recipes indexed by id

### mcdata.instruments
instruments indexed by id

### mcdata.biomes
biomes indexed by id

### mcdata.entities
entities indexed by id

## Classes

### vec3

See [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

All points in mineflayer are supplied as instances of this class.

 * x - south
 * y - up
 * z - west

Functions and methods which require a point argument accept `Vec3` instances
as well as an array with 3 values, and an object with `x`, `y`, and `z`
properties.

### mineflayer.Location

### Entity

Entities represent players, mobs, and objects. They are emitted
in many events, and you can access your own entity with `bot.entity`.
See [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

### Block

See [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

Also `block.blockEntity` is additional field with block entity data as `Object`
```js
// sign.blockEntity
{
  x: -53,
  y: 88,
  z: 66,
  id: 'minecraft:sign', // 'Sign' in 1.10
  Text1: { toString: Function }, // ChatMessage object
  Text2: { toString: Function }, // ChatMessage object
  Text3: { toString: Function }, // ChatMessage object
  Text4: { toString: Function }, // ChatMessage object
}
```

### Biome

See [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

See [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

See [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

### Recipe

See [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Chest

Represents a single session of opening and closing a chest.
See `bot.openChest(chestBlock or minecartchestEntity)`.

#### chest.window

If the chest is open, this property is a `ChestWindow` instance.
If the chest is closed, this property is `null`.

#### chest "open"

Fires when the chest has successfully been opened.

#### chest "close"

Fires when the chest closes.

#### chest "updateSlot" (oldItem, newItem)

Fires when the chest you are looking at is updated.

#### chest.close()

#### chest.deposit(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to deposit. `null` is an alias to 1.
 * `callback(err)` - (optional) - called when done depositing

#### chest.withdraw(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to withdraw. `null` is an alias to 1.
 * `callback(err)` - (optional) - called when done withdrawing

#### chest.count(itemType, [metadata])

Return how many of a certain type of item are in the chest.

 * `itemType` - numerical item id
 * `metadata` - (optional) numerical value. `null` means match anything.

#### chest.items()

Returns a list of `Item` instances from the chest.

### mineflayer.Furnace

See `bot.openFurnace(furnaceBlock)`.

#### furnace "open"

Fires when the furnace has successfully been opened.

#### furnace "close"

Fires when the furnace closes.

#### furnace "update"

Fires when `furnace.fuel` and/or `furnace.progress` update.

#### furnace "updateSlot" (oldItem, newItem)

Fires when a slot in the furnace you have open has updated.

#### furnace.close()

#### furnace.takeInput([callback])

This function also returns a `Promise`, with `item` as its argument upon completion.

 * `callback(err, item)`

#### furnace.takeFuel([callback])

This function also returns a `Promise`, with `item` as its argument upon completion.

 * `callback(err, item)`

#### furnace.takeOutput([callback])

This function also returns a `Promise`, with `item` as its argument upon completion.

 * `callback(err, item)`

#### furnace.putInput(itemType, metadata, count, [cb])

This function also returns a `Promise`, with `void` as its argument upon completion.

#### furnace.putFuel(itemType, metadata, count, [cb])

This function also returns a `Promise`, with `void` as its argument upon completion.

#### furnace.inputItem()

Returns `Item` instance which is the input.

#### furnace.fuelItem()

Returns `Item` instance which is the fuel.

#### furnace.outputItem()

Returns `Item` instance which is the output.

#### furnace.fuel

How much fuel is left between 0 and 1.

#### furnace.progress

How much cooked the input is between 0 and 1.

### mineflayer.Dispenser

See `bot.openDispenser(dispenserBlock)`.

#### dispenser "open"

Fires when the dispenser has successfully been opened.

#### dispenser "close"

Fires when the dispenser closes.

#### dispenser "updateSlot" (oldItem, newItem)

Fires when a slot in the dispenser you have open has updated.

#### dispenser.close()

#### dispenser.items()

Returns a list of `Item` instances from the dispenser.

#### dispenser.deposit(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to deposit. `null` is an alias to 1.
 * `callback(err)` - (optional) - called when done depositing

#### dispenser.withdraw(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to withdraw. `null` is an alias to 1.
 * `callback(err)` - (optional) - called when done withdrawing

#### dispenser.count(itemType, [metadata])

Return how many of a certain type of item are in the dispenser.

 * `itemType` - numerical item id
 * `metadata` - (optional) numerical value. `null` means match anything.

### mineflayer.EnchantmentTable

See `bot.openEnchantmentTable(enchantmentTableBlock)`.

#### enchantmentTable "open"

Fires when the enchantment table has successfully been opened.

#### enchantmentTable "close"

Fires when the enchantment table closes.

#### enchantmentTable "updateSlot" (oldItem, newItem)

Fires when a slot in the enchantment table you have open has updated.

#### enchantmentTable "ready"

Fires when `enchantmentTable.enchantments` is fully populated and you
may make a selection by calling `enchantmentTable.enchant(choice)`.

#### enchantmentTable.close()

#### enchantmentTable.targetItem()

Gets the target item. This is both the input and the output of the
enchantment table.

#### enchantmentTable.enchantments

Array of length 3 which are the 3 enchantments to choose from.
`level` can be `null` if the server has not sent the data yet.

Looks like:

```js
[
  {
    "level": 3
  },
  {
    "level": 4
  },
  {
    "level": 9
  }
]
```

#### enchantmentTable.enchant(choice, [callback])

This function also returns a `Promise`, with `item` as its argument upon completion.

 * `choice` - [0-2], the index of the enchantment you want to pick.
 * `callback(err, item)` - (optional) called when the item has been enchanted

#### enchantmentTable.takeTargetItem([callback])

This function also returns a `Promise`, with `item` as its argument upon completion.

 * `callback(err, item)`

#### enchantmentTable.putTargetItem(item, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `callback(err)`

 #### enchantmentTable.putLapis(item, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `callback(err)`

### mineflayer.Villager

See `bot.openVillager(villagerEntity)`.

#### villager "open"

Fires when the trading window has successfully been opened.

#### villager "close"

Fires when the trading window closes.

#### villager "updateSlot" (oldItem, newItem)

Fires when a slot in the trading window has updated.

#### villager "ready"

Fires when `villager.trades` is loaded.

#### villager.close()

#### villager.trades

Array of trades.

Looks like:

```js
[
  {
    firstInput: Item,
    output: Item,
    hasSecondItem: false,
    secondaryInput: null,
    disabled: false,
    tooluses: 0,
    maxTradeuses: 7
  },
  {
    firstInput: Item,
    output: Item,
    hasSecondItem: false,
    secondaryInput: null,
    disabled: false,
    tooluses: 0,
    maxTradeuses: 7
  },
  {
    firstInput: Item,
    output: Item,
    hasSecondItem: true,
    secondaryInput: Item,
    disabled: false,
    tooluses: 0,
    maxTradeuses: 7
  }
]
```

#### villager.trade(tradeIndex, [times], [cb])
Is the same as [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)

### mineflayer.ScoreBoard

#### ScoreBoard.name

Name of the scoreboard.

#### ScoreBoard.title

The title of the scoreboard (does not always equal the name)

#### ScoreBoard.itemsMap

An object with all items in the scoreboard in it
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

An array with all sorted items in the scoreboard in it
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.BossBar

#### BossBar.title

Title of boss bar, instance of ChatMessage

#### BossBar.health

Percent of boss health, from `0` to `1`

#### BossBar.dividers

Number of boss bar dividers, one of `0`, `6`, `10`, `12`, `20`

#### BossBar.entityUUID

Boss bar entity uuid

#### BossBar.shouldDarkenSky

Determines whether or not to darken the sky

#### BossBar.isDragonBar

Determines whether or not boss bar is dragon bar

#### BossBar.createFog

Determines whether or not boss bar creates fog

#### BossBar.color

Determines what color the boss bar color is, one of `pink`, `blue`, `red`, `green`, `yellow`, `purple`, `white`

## Bot

### mineflayer.createBot(options)

Create and return an instance of the class bot.
`options` is an object containing the optional properties :
 * username : default to 'Player'
 * port : default to 25565
 * password : can be omitted (if the tokens are also omitted then it tries to connect in offline mode)
 * host : default to localhost
 * version : default to automatically guessing the version of the server. Example of value : "1.12.2"
 * clientToken : generated if a password is given
 * accessToken : generated if a password is given
 * logErrors : true by default, catch errors and log them
 * hideErrors : false by default, do not log errors (even if logErrors is true)
 * keepAlive : send keep alive packets : default to true
 * checkTimeoutInterval : default to `30*1000` (30s), check if keepalive received at that period, disconnect otherwise.
 * loadInternalPlugins : defaults to true
 * storageBuilder : an optional function, takes as argument version and worldName and return an instance of something with the same API as prismarine-provider-anvil. Will be used to save the world.
 * plugins : object : defaults to {}
   - pluginName : false : don't load internal plugin with given name ie. `pluginName`
   - pluginName : true : load internal plugin with given name ie. `pluginName` even though loadInternalplugins is set to false
   - pluginName : external plugin inject function : loads external plugin, overrides internal plugin with given name ie. `pluginName`
 * [chat](bot.settings.chat)
 * [colorsEnabled](bot.settings.colorsEnabled)
 * [viewDistance](bot.settings.viewDistance)
 * [difficulty](bot.settings.difficulty)
 * [showCape](bot.settings.skinParts.showCape)
 * [showJacket](bot.settings.skinParts.showJacket)
 * [showLeftSleeve](bot.settings.skinParts.showLeftSleeve)
 * [showRightSleeve](bot.settings.skinParts.showRightSleeve)
 * [showLeftPants](bot.settings.skinParts.showLeftPants)
 * [showRigthtPants](bot.settings.skinParts.showRightPants)
 * [showHat](bot.settings.skinParts.showHat)
 * chatLengthLimit : the maximum amount of characters that can be sent in a single message. If this is not set, it will be 100 in < 1.11 and 256 in >= 1.11.

### Properties

#### bot.world

A sync representation of the world. Check the doc at http://github.com/PrismarineJS/prismarine-world

#### bot.entity

Your own entity. See `Entity`.

#### bot.entities

All nearby entities. This object is a map of entityId to entity.

#### bot.username

Use this to find out your own name.

#### bot.spawnPoint

Coordinates to the main spawn point, where all compasses point to.

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

### bot.player

Bot's player object
```js
{
  username: 'player',
  displayName: { toString: Function }, // ChatMessage object.
  gamemode: 0,
  ping: 28,
  entity: entity, // null if you are too far away
}
```

#### bot.players

Map of username to people playing the game.

#### bot.isRaining

#### bot.chatPatterns

This is an array of pattern objects, of the following format:
{ /regex/, "chattype", "description")
 * /regex/ - a regular expression pattern, that should have at least two capture groups
 * 'chattype' - the type of chat the pattern matches, ex "chat" or "whisper", but can be anything.
 * 'description' - description of what the pattern is for, optional.

#### bot.settings.chat

Choices:

 * `enabled` (default)
 * `commandsOnly`
 * `disabled`

#### bot.settings.colorsEnabled

Default true, whether or not you receive color codes in chats from the server.

#### bot.settings.viewDistance

Choices:
 * `far` (default)
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

Same as from server.properties.

#### bot.settings.skinParts.showCape

If you have a cape you can turn it off by setting this to false.

#### bot.settings.skinParts.showJacket

Set the jacket layer of the skin.

#### bot.settings.skinParts.showLeftSleeve

Set the left sleeve layer of the skin.

#### bot.settings.skinParts.showRightSleeve

Set the right sleeve layer of the skin.

#### bot.settings.skinParts.showLeftPants

Set the left pants layer of the skin.

#### bot.settings.skinParts.showRightPants

Set the right pants layer of the skin.

#### bot.settings.skinParts.showHat

Set the hat layer of the skin.

#### bot.experience.level

#### bot.experience.points

Total experience points.

#### bot.experience.progress

Between 0 and 1 - amount to get to the next level.

#### bot.health

Number in the range [0, 20] representing the number of half-hearts.

#### bot.food

Number, in the range [0, 20] representing the number of half-turkey-legs.

#### bot.foodSaturation

Food saturation acts as a food "overcharge". Food values will not decrease
while the saturation is over zero. Players logging in automatically get a
saturation of 5.0. Eating food increases the saturation as well as the food bar.


#### bot.physics

Edit these numbers to tweak gravity, jump speed, terminal velocity, etc.
Do this at your own risk.

#### bot.time.time

Total time of the world since day 0.

#### bot.time.timeOfDay

Time of the day, in ticks.

Time is based on ticks, where 20 ticks happen every second. There are 24000
ticks in a day, making Minecraft days exactly 20 minutes long.

The time of day is based on the timestamp modulo 24000. 0 is sunrise, 6000
is noon, 12000 is sunset, and 18000 is midnight.

#### bot.time.day

Day of the world.

#### bot.time.isDay

Whether it is day or not.

Based on whether the current time of day isn't between 13000 and 23000 ticks.

#### bot.time.moonPhase

Phase of the moon.

0-7 where 0 is full moon.

#### bot.time.age

Age of the world, in ticks.

#### bot.quickBarSlot

Which quick bar slot is selected (0 - 8).

#### bot.inventory

A [`Window`](https://github.com/PrismarineJS/prismarine-windows#windowswindow-base-class) instance representing your inventory.

#### bot.targetDigBlock

The `block` that you are currently digging, or `null`.

#### bot.isSleeping

Boolean, whether or not you are in bed.

#### bot.scoreboards

All scoreboards known to the bot in an object scoreboard name -> scoreboard.

#### bot.scoreboard

All scoreboards known to the bot in an object scoreboard displaySlot -> scoreboard.

 * `belowName` - scoreboard placed in belowName
 * `sidebar` - scoreboard placed in sidebar
 * `list` - scoreboard placed in list
 * `0-18` - slots defined in [protocol](https://wiki.vg/Protocol#Display_Scoreboard)

#### bot.controlState

An object whose keys are the main control states: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].

Setting values for this object internally calls [bot.setControlState](#botsetcontrolstatecontrol-state).

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

Only emitted when a player chats publicly.

 * `username` - who said the message (compare with `bot.username` to ignore your own chat)
 * `message` - stripped of all color and control characters
 * `translate` - chat message type. Null for most bukkit chat messages
 * `jsonMsg` - unmodified JSON message from the server
 * `matches` - array of returned matches from regular expressions. May be null

#### "whisper" (username, message, translate, jsonMsg, matches)

Only emitted when a player chats to you privately.

 * `username` - who said the message
 * `message` - stripped of all color and control characters
 * `translate` - chat message type. Null for most bukkit chat messages
 * `jsonMsg` - unmodified JSON message from the server
 * `matches` - array of returned matches from regular expressions. May be null

#### "actionBar" (jsonMsg)

Emitted for every server message which appears on the Action Bar.

 * `jsonMsg` - unmodified JSON message from the server

#### "message" (jsonMsg, position)

Emitted for every server message, including chats.

 * `jsonMsg` - unmodified JSON message from the server

 * `position` - (>= 1.8.1): position of Chat message can be
   * chat
   * system
   * game_info

#### "login"

Fires after you successfully login to the server.
You probably want to wait for the `spawn` event
before doing anything though.

#### "spawn"

Emitted once after you log in and spawn for the first time
and then emitted when you respawn after death.

This is usually the event that you want to listen to
before doing anything on the server.

#### "respawn"

Emitted when you change dimensions and just before you spawn.
Usually you want to ignore this event and wait until the "spawn"
event instead.

#### "game"

Emitted when the server changes any of the game properties.

#### "title"

Emitted when the server sends a title

 * `text` - title's text

#### "rain"

Emitted when it starts or stops raining. If you join a
server where it is already raining, this event will fire.

#### "time"

Emitted when the server sends a time update. See `bot.time`.

#### "kicked" (reason, loggedIn)

Emitted when the bot is kicked from the server. `reason`
is a chat message explaining why you were kicked. `loggedIn`
is `true` if the client was kicked after successfully logging in,
or `false` if the kick occurred in the login phase.

#### "end"

Emitted when you are no longer connected to the server.

#### "spawnReset"

Fires when you cannot spawn in your bed and your spawn point gets reset.

#### "death"

Fires when you die.

#### "health"

Fires when your hp or food change.

#### "entitySwingArm" (entity)
#### "entityHurt" (entity)
#### "entityWake" (entity)
#### "entityEat" (entity)
#### "entityCrouch" (entity)
#### "entityUncrouch" (entity)
#### "entityEquip" (entity)
#### "entitySleep" (entity)
#### "entitySpawn" (entity)
#### "itemDrop" (entity)
#### "playerCollect" (collector, collected)

An entity picked up an item.

 * `collector` - entity that picked up the item.
 * `collected` - the entity that was the item on the ground.

#### "entityGone" (entity)
#### "entityMoved" (entity)
#### "entityDetach" (entity, vehicle)
#### "entityAttach" (entity, vehicle)

An entity is attached to a vehicle, such as a mine cart
or boat.

 * `entity` - the entity hitching a ride
 * `vehicle` - the entity that is the vehicle

#### "entityUpdate" (entity)
#### "entityEffect" (entity, effect)
#### "entityEffectEnd" (entity, effect)
#### "playerJoined" (player)
#### "playerLeft" (player)

#### "blockUpdate" (oldBlock, newBlock)

Fires when a block updates. Both `oldBlock` and `newBlock` provided for
comparison.

Note that `oldBlock` may be `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Fires for a specific point. Both `oldBlock` and `newBlock` provided for
comparison.

Note that `oldBlock` may be `null`.

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

Fires when a chunk has updated. `point` is the coordinates to the corner
of the chunk with the smallest x, y, and z values.

#### "soundEffectHeard" (soundName, position, volume, pitch)

Fires when the client hears a named sound effect.

 * `soundName`: name of the sound effect
 * `position`: a Vec3 instance where the sound originates
 * `volume`: floating point volume, 1.0 is 100%
 * `pitch`: integer pitch, 63 is 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

  Fires when the client hears a hardcoded sound effect.

   * `soundId`: id of the sound effect
   * `soundCategory`: category of the sound effect
   * `position`: a Vec3 instance where the sound originates
   * `volume`: floating point volume, 1.0 is 100%
   * `pitch`: integer pitch, 63 is 100%

#### "noteHeard" (block, instrument, pitch)

Fires when a note block goes off somewhere.

 * `block`: a Block instance, the block that emitted the noise
 * `instrument`:
   - `id`: integer id
   - `name`: one of [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`].
 * `pitch`: The pitch of the note (between 0-24 inclusive where 0 is the
   lowest and 24 is the highest). More information about how the pitch values
   correspond to notes in real life are available on the
   [official Minecraft wiki](http://www.minecraftwiki.net/wiki/Note_Block).

#### "pistonMove" (block, isPulling, direction)

#### "chestLidMove" (block, isOpen, block2)
* `block`: a Block instance, the block whose lid opened. The right block if it's a double chest
* `isOpen`: number of players that have the chest open. 0 if it's closed
* `block2`: a Block instance, the other half of the block whose lid opened. null if it's not a double chest

#### "blockBreakProgressObserved" (block, destroyStage)

Fires when the client observes a block in the process of being broken.

 * `block`: a Block instance, the block being broken
 * `destroyStage`: integer corresponding to the destroy progress (0-9)

#### "blockBreakProgressEnd" (block)

Fires when the client observes a block stops being broken.
This occurs whether the process was completed or aborted.

 * `block`: a Block instance, the block no longer being broken

#### "diggingCompleted" (block)

 * `block` - the block that no longer exists

#### "diggingAborted" (block)

 * `block` - the block that still exists

#### "move"

Fires when the bot moves. If you want the current position, use
`bot.entity.position` and for normal moves if you want the previous position, use
`bot.entity.position.minus(bot.entity.velocity)`.

#### "forcedMove"

Fires when the bot is force moved by the server (teleport, spawning, ...). If you want the current position, use
`bot.entity.position`.

#### "mount"

Fires when you mount an entity such as a minecart. To get access
to the entity, use `bot.vehicle`.

To mount an entity, use `mount`.

#### "dismount" (vehicle)

Fires when you dismount from an entity.

#### "windowOpen" (window)

Fires when you begin using a workbench, chest, brewing stand, etc.

#### "windowClose" (window)

Fires when you may no longer work with a workbench, chest, etc.

#### "sleep"

Fires when you sleep.

#### "wake"

Fires when you wake up.

#### "experience"

Fires when `bot.experience.*` has updated.

#### "scoreboardCreated" (scoreboard)

Fires when a scoreboard is added.

#### "scoreboardDeleted" (scoreboard)

Fires when a scoreboard is deleted.

#### "scoreboardTitleChanged" (scoreboard)

Fires when a scoreboard's title is updated.

#### "scoreUpdated" (scoreboard, item)

Fires when the score of a item in a scoreboard is updated.

#### "scoreRemoved" (scoreboard, item)

Fires when the score of a item in a scoreboard is removed.

#### "scoreboardPosition" (position, scoreboard)

Fires when the position of a scoreboard is updated.

#### "bossBarCreated" (bossBar)

Fires when new boss bar is created.

#### "bossBarDeleted" (bossBar)

Fires when new boss bar is deleted.

#### "bossBarUpdated" (bossBar)

Fires when new boss bar is updated.

#### "heldItemChanged" (heldItem)

Fires when the held item is changed.

### Functions

#### bot.blockAt(point, extraInfos=true)

Returns the block at `point` or `null` if that point is not loaded. If `extraInfos` set to true, also returns informations about signs, paintings and block entities (slower).
See `Block`.

#### bot.waitForChunksToLoad(cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

The cb gets called when many chunks have loaded.

#### bot.blockInSight(maxSteps, vectorLength)

Deprecated, use `blockAtCursor` instead.

Returns the block at which bot is looking at or `null`
 * `maxSteps` - Number of steps to raytrace, defaults to 256.
 * `vectorLength` - Length of raytracing vector, defaults to `5/16`.

#### bot.blockAtCursor(maxDistance=256)

Returns the block at which bot is looking at or `null`
 * `maxDistance` - The maximum distance the block can be from the eye, defaults to 256.

#### bot.canSeeBlock(block)

Returns true or false depending on whether the bot can see the specified `block`.

#### bot.findBlocks(options)

Finds the closest blocks from the given point.
 * `options` - Options for the search:
   - `point` - The start position of the search (center). Default is the bot position.
   - `matching` - A function that returns true if the given block is a match. Also supports this value being a block id or array of block ids.
   - `useExtraInfo` - Use extra info when matching (block entities, signs, painting), 2x slower
   - `maxDistance` - The furthest distance for the search, defaults to 16.
   - `count` - Number of blocks to find before returning the search. Default to 1. Can return less if not enough blocks are found exploring the whole area.

Returns an array (possibly empty) with the found block coordinates (not the blocks). The array is sorted (closest first)

#### bot.findBlock(options)

Alias for `bot.findBlock(options)[0]`. Return a single block or `null`.

#### bot.canDigBlock(block)

Returns whether `block` is diggable and within range.

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

Returns a list of `Recipe` instances that you could use to craft `itemType`
with `metadata`.

 * `itemType` - numerical item id of the thing you want to craft
 * `metadata` - the numerical metadata value of the item you want to craft
   `null` matches any metadata.
 * `minResultCount` - based on your current inventory, any recipe from the
   returned list will be able to produce this many items. `null` is an
   alias for `1`.
 * `craftingTable` - a `Block` instance. If `null`, only recipes that can
   be performed in your inventory window will be included in the list.

#### bot.recipesAll(itemType, metadata, craftingTable)

The same as bot.recipesFor except that it does not check wether the bot has enough materials for the recipe.

#### bot.nearestEntity(match = (entity) => { return true })

Return the nearest entity to the bot, matching the function (default to all entities). Return null if no entity is found.

### Methods

#### bot.end()

End the connection with the server.

#### bot.quit(reason)

Gracefully disconnect from the server with the given reason (defaults to 'disconnect.quitting').

#### bot.tabComplete(str, cb, [assumeCommand], [sendBlockInSight])

This function also returns a `Promise`, with `matches` as its argument upon completion.

Requests chat completion from the server.
 * `str` - String to complete.
 * `callback(matches)`
   - `matches` - Array of matching strings.
 * `assumeCommand` - Field sent to server, defaults to false.
 * `sendBlockInSight` - Field sent to server, defaults to true. Set this option to false if you want more performance.

#### bot.chat(message)

Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary.

#### bot.whisper(username, message)

Shortcut for "/tell <username>". All split messages will be whispered to username.

#### bot.chatAddPattern(pattern, chatType, description)

Adds a regex pattern to the bot's chat matching. Useful for bukkit servers where the chat format changes a lot.
 * `pattern` - regular expression to match chat
 * `chatType` - the event the bot emits when the pattern matches. Eg: "chat" or "whisper"
 * 'description ' - Optional, describes what the pattern is for

#### bot.setSettings(options)

See the `bot.settings` property.

#### bot.loadPlugin(plugin)

Injects a Plugin. Does nothing if the plugin is already loaded.

 * `plugin` - function

```js
function somePlugin(bot, options) {
  function someFunction() {
    bot.chat('Yay!');
  }

  bot.myPlugin = {} // Good practice to namespace plugin API
  bot.myPlugin.someFunction = someFunction;
}

var bot = mineflayer.createBot(...);
bot.loadPlugin(somePlugin);
bot.once('login', function() {
  bot.myPlugin.someFunction(); // Yay!
});
```

#### bot.loadPlugins(plugins)

Injects plugins see `bot.loadPlugin`.
 * `plugins` - array of functions

#### bot.hasPlugin(plugin)

Checks if the given plugin is loaded (or scheduled to be loaded) on this bot.

#### bot.sleep(bedBlock, [cb])

This function also returns a `Promise`, with `void` as its argument upon completion.

Sleep in a bed. `bedBlock` should be a `Block` instance which is a bed. `cb` can have an err parameter if the bot cannot sleep.

#### bot.isABed(bedBlock)

Return true if `bedBlock` is a bed

#### bot.wake([cb])

This function also returns a `Promise`, with `void` as its argument upon completion.

Get out of bed. `cb` can have an err parameter if the bot cannot wake up.

#### bot.setControlState(control, state)

This is the main method controlling the bot movements. It works similarly to pressing keys in minecraft.
For example forward with state true will make the bot move forward. Forward with state false will make the bot stop moving forward.
You may use bot.lookAt in conjunction with this to control movement. The jumper.js example shows how to use this.

 * `control` - one of ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
 * `state` - `true` or `false`

#### bot.clearControlStates()

Sets all controls to off.

#### bot.lookAt(point, [force], [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `point` [Vec3](https://github.com/andrewrk/node-vec3) instance - tilts your head so that it is directly facing this point.
 * `force` - See `force` in `bot.look`
 * `callback()` optional, called when you are looking at `point`

#### bot.look(yaw, pitch, [force], [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Set the direction your head is facing.

 * `yaw` - The number of radians to rotate around the vertical axis, starting
   from due east. Counter clockwise.
 * `pitch` - Number of radians to point up or down. 0 means straight forward.
   pi / 2 means straight up. -pi / 2 means straight down.
 * `force` - If present and true, skips the smooth server-side transition.
   Specify this to true if you need the server to know exactly where you
   are looking, such as for dropping items or shooting arrows. This is not
   needed for client-side calculation such as walking direction.
 * `callback()` optional, called when you are looking at `yaw` and `pitch`

#### bot.updateSign(block, text)

Changes the text on the sign.

#### bot.equip(item, destination, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Equips an item from your inventory.

 * `item` - `Item` instance. See `window.items()`.
 * `destination`
   - `"hand"` - `null` aliases to this
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
   - `"off-hand"` - when available
 * `callback(error)` - optional. called when you have successfully equipped
   the item or when you learn that you have failed to equip the item.

#### bot.unequip(destination, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Remove an article of equipment.

#### bot.tossStack(item, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `item` - the stack of items you wish to toss
 * `callback(error)` - optional, called when tossing is done. if error is
   truthy, you were not able to complete the toss.

#### bot.toss(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical id of the item you wish to toss
 * `metadata` - metadata of the item you wish to toss. Use `null`
   to match any metadata
 * `count` - how many you want to toss. `null` is an alias for `1`.
 * `callback(err)` - (optional) called once tossing is complete

#### bot.dig(block, [forceLook = true], [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Begin digging into `block` with the currently equipped item.
See also "diggingCompleted" and "diggingAborted" events.

Note that once you begin digging into a block, you may not
dig any other blocks until the block has been broken, or you call
`bot.stopDigging()`.

 * `block` - the block to start digging into
 * `forceLook` - (optional) if true, look at the block and start mining instantly
 * `callback(err)` - (optional) called when the block is broken or you
   are interrupted.

#### bot.stopDigging()

#### bot.digTime(block)

Tells you how long it will take to dig the block, in milliseconds.

#### bot.placeBlock(referenceBlock, faceVector, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `referenceBlock` - the block you want to place a new block next to
 * `faceVector` - one of the six cardinal directions, such as `new Vec3(0, 1, 0)` for the top face,
   indicating which face of the `referenceBlock` to place the block against.
 * `cb` will be called when the server confirms that the block has indeed been placed

The new block will be placed at `referenceBlock.position.plus(faceVector)`.

#### bot.activateBlock(block, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Punch a note block, open a door, etc.

 * `block` - the block to activate
 * `callback(err)` - (optional) called when the block has been activated

#### bot.activateEntity(entity, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Activate an entity, useful for villager for example.

 * `entity` - the entity to activate
 * `callback(err)` - (optional) called when the entity has been activated

#### bot.activateEntityAt(entity, position, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Activate an entity at the given position, useful for armor stands.

 * `entity` - the entity to activate
 * `position` - the world position to click at
 * `callback(err)` - (optional) called when the entity has been activated

#### bot.consume(callback)

This function also returns a `Promise`, with `void` as its argument upon completion.

Eat / drink currently held item

 * `callback(error)` - called when consume ends

#### bot.fish(callback)

This function also returns a `Promise`, with `void` as its argument upon completion.

Use fishing rod

 * `callback(error)` - called when fishing ends

#### bot.activateItem(offHand=false)

Activates the currently held item. This is how you eat, shoot bows, throw an egg, etc.
Optional parameter is `false` for main hand and `true` for off hand.

#### bot.deactivateItem()

Deactivates the currently held item. This is how you release an arrow, stop eating, etc.

#### bot.useOn(targetEntity)

Use the currently held item on an `Entity` instance. This is how you apply a saddle and
use shears.

#### bot.attack(entity)

Attack a player or a mob.

#### bot.swingArm([hand])

Play an arm swing animation.

 * `hand` can take `left` or `right` which is arm that is animated. Default: `right`

#### bot.mount(entity)

Mount a vehicle. To get back out, use `bot.dismount`.

#### bot.dismount()

Dismounts from the vehicle you are in.

#### bot.moveVehicle(left,forward)

Moves the vehicle :

 * left can take -1 or 1 : -1 means right, 1 means left
 * forward can take -1 or 1 : -1 means backward, 1 means forward

All the direction are relative to where the bot is looking at

#### bot.setQuickBarSlot(slot)

 * `slot` - 0-8 the quick bar slot to select.

#### bot.craft(recipe, count, craftingTable, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `recipe` - A `Recipe` instance. See `bot.recipesFor`.
 * `count` - How many times you wish to perform the operation.
   If you want to craft planks into `8` sticks, you would set
   `count` to `2`. `null` is an alias for `1`.
 * `craftingTable` - A `Block` instance, the crafting table you wish to
   use. If the recipe does not require a crafting table, you may use
   `null` for this argument.
 * `callback` - (optional) Called when the crafting is complete and your
   inventory is updated.

#### bot.writeBook(slot, pages, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `slot` is in inventory window coordinates (where 36 is the first quickbar slot, etc.).
 * `pages` is an array of strings represents the pages.
 * `callback(error)` - optional. called when the writing was successfully or an error occurred.

#### bot.openChest(chestBlock or minecartchestEntity)

Returns a `Chest` instance which represents the chest you are opening.

#### bot.openFurnace(furnaceBlock)

Returns a `Furnace` instance which represents the furnace you are opening.

#### bot.openDispenser(dispenserBlock)

Returns a `Dispenser` instance which represents the dispenser you are opening.

#### bot.openEnchantmentTable(enchantmentTableBlock)

Returns an `EnchantmentTable` instance which represents the enchantment table
you are opening.

#### bot.openVillager(villagerEntity)

Returns an `Villager` instance which represents the trading window you are opening.
You can listen to the `ready` event on this `Villager` to know when it's ready

#### bot.trade(villagerInstance, tradeIndex, [times], [cb])

This function also returns a `Promise`, with `void` as its argument upon completion.

Uses the open `villagerInstance` to trade.

#### bot.setCommandBlock(pos, command, [options])

Set a command block's properties at `pos`.
Example `options` argument:
```js
{
  mode: 2,
  trackOutput: true,
  conditional: false,
  alwaysActive: true
}
```
options.mode can have 3 values: 0 (SEQUENCE), 1 (AUTO), 2 (REDSTONE)
All options attributes are false by default, except mode which is 2 (as to replicate the default command block in Minecraft).

#### bot.supportFeature(name)

This can be used to check is a specific feature is available in the current Minecraft version. This is usually only required for handling version-specific functionality.

The list of available features can be found inside the [./lib/features.json](https://github.com/PrismarineJS/mineflayer/blob/master/lib/features.json) file.

### Lower level inventory methods

These are lower level methods for the inventory, they can be useful sometimes but prefer the inventory methods presented above if you can.

#### bot.clickWindow(slot, mouseButton, mode, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

Click on the current window. See details at https://wiki.vg/Protocol#Click_Window

#### bot.putSelectedItemRange(start, end, window, slot, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

Put the item at `slot` in the specified range.

#### bot.putAway(slot, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

Put the item at `slot` in the inventory.

#### bot.closeWindow(window)

Close the `window`.

#### bot.transfer(options, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

Transfer some kind of item from one range to an other. `options` is an object containing :

 * `window` : the window where the item will be moved
 * `itemType` : the type of the moved items
 * `metadata` : the metadata of the moved items
 * `sourceStart` and `sourceEnd` : the source range
 * `destStart` and `destEnd` : the dest Range

#### bot.openBlock(block, Class)

Open a block, for example a chest.

 * `block` is the block the bot will open
 * `Class` is the type of window that will be opened

#### bot.openEntity(entity, Class)

Open an entity with an inventory, for example a villager.

 * `entity` is the entity the bot will open
 * `Class` is the type of window that will be opened

#### bot.moveSlotItem(sourceSlot, destSlot, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

Move an item from `sourceSlot` to `destSlot` in the current window.

#### bot.updateHeldItem()

Update `bot.heldItem`.

#### bot.getEquipmentDestSlot(destination)

Gets the inventory equipment slot id for the given equipment destination name.

Available destinations are:
* head
* torso
* legs
* feet
* hand
* off-hand

### bot.creative

This collection of apis is useful in creative mode.
Detecting and changing gamemodes is not implemented here,
but it is assumed and often required that the bot be in creative mode for these features to work.

#### bot.creative.setInventorySlot(slot, item, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Gives the bot the specified item in the specified inventory slot.
If called twice on the same slot before first callback exceeds, first callback will have an error parameter

 * `slot` is in inventory window coordinates (where 36 is the first quickbar slot, etc.).
 * `item` is a [prismarine-item](https://github.com/PrismarineJS/prismarine-item) instance specified with arbitrary metadata, nbtdata, etc.
    If `item` is `null`, the item at the specified slot is deleted.
 * `callback(err)` (optional) is a callback which gets fired when the servers sets the slot

If this method changes anything, you can be notified via `bot.inventory.on("windowUpdate")`.

#### bot.creative.flyTo(destination, [cb])

This function also returns a `Promise`, with `void` as its argument upon completion.

Calls `startFlying()` and moves at a constant speed through 3d space in a straight line to the destination.
`destination` is a `Vec3`, and often the `x` and `z` coordinates will end with `.5`.
This operation will not work if there is an obstacle in the way,
so it is advised to fly very short distances at a time.

When the bot arrives at the destination, `cb` is called.

This method does not attempt any path finding.
It is expected that a path finding implementation will use this method to move < 2 blocks at a time.

To resume normal physics, call `stopFlying()`.

#### bot.creative.startFlying()

Sets `bot.physics.gravity` to `0`.
To resume normal physics, call `stopFlying()`.

This method is useful if you want to hover while digging the ground below you.
It is not necessary to call this function before calling `flyTo()`.

Note that while flying, `bot.entity.velocity` will not be accurate.

#### bot.creative.stopFlying()

Restores `bot.physics.gravity` to it's original value.
