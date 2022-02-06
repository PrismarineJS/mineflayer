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
      - [window.deposit(itemType, metadata, count)](#windowdeposititemtype-metadata-count)
      - [window.withdraw(itemType, metadata, count)](#windowwithdrawitemtype-metadata-count)
      - [window.close()](#windowclose)
    - [Recipe](#recipe)
    - [mineflayer.Container](#mineflayercontainer)
    - [mineflayer.Furnace](#mineflayerfurnace)
      - [furnace "update"](#furnace-update)
      - [furnace.takeInput()](#furnacetakeinput)
      - [furnace.takeFuel()](#furnacetakefuel)
      - [furnace.takeOutput()](#furnacetakeoutput)
      - [furnace.putInput(itemType, metadata, count)](#furnaceputinputitemtype-metadata-count)
      - [furnace.putFuel(itemType, metadata, count)](#furnaceputfuelitemtype-metadata-count)
      - [furnace.inputItem()](#furnaceinputitem)
      - [furnace.fuelItem()](#furnacefuelitem)
      - [furnace.outputItem()](#furnaceoutputitem)
      - [furnace.fuel](#furnacefuel)
      - [furnace.progress](#furnaceprogress)
    - [mineflayer.EnchantmentTable](#mineflayerenchantmenttable)
      - [enchantmentTable "ready"](#enchantmenttable-ready)
      - [enchantmentTable.targetItem()](#enchantmenttabletargetitem)
      - [enchantmentTable.xpseed](#enchantmenttablexpseed)
      - [enchantmentTable.enchantments](#enchantmenttableenchantments)
      - [enchantmentTable.enchant(choice)](#enchantmenttableenchantchoice)
      - [enchantmentTable.takeTargetItem()](#enchantmenttabletaketargetitem)
      - [enchantmentTable.putTargetItem(item)](#enchantmenttableputtargetitemitem)
      - [enchantmentTable.putLapis(item)](#enchantmenttableputlapisitem)
    - [mineflayer.anvil](#mineflayeranvil)
      - [anvil.combine(itemOne, itemTwo[, name])](#anvilcombineitemone-itemtwo-name)
      - [anvil.combine(item[, name])](#anvilcombineitem-name)
      - [villager "ready"](#villager-ready)
      - [villager.trades](#villagertrades)
      - [villager.trade(tradeIndex, [times])](#villagertradetradeindex-times)
    - [mineflayer.ScoreBoard](#mineflayerscoreboard)
      - [ScoreBoard.name](#scoreboardname)
      - [ScoreBoard.title](#scoreboardtitle)
      - [ScoreBoard.itemsMap](#scoreboarditemsmap)
      - [ScoreBoard.items](#scoreboarditems)
    - [mineflayer.Team](#mineflayerteam)
      - [Team.name](#teamname)
      - [Team.friendlyFire](#teamfriendlyfire)
      - [Team.nameTagVisibility](#teamnametagvisibility)
      - [Team.collisionRule](#teamcollisionrule)
      - [Team.color](#teamcolor)
      - [Team.prefix](#teamprefix)
      - [Team.suffix](#teamsuffix)
      - [Team.members](#teammembers)
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
        - [world "blockUpdate" (oldBlock, newBlock)](#world-blockupdate-oldblock-newblock)
        - [world "blockUpdate:(x, y, z)" (oldBlock, newBlock)](#world-blockupdatex-y-z-oldblock-newblock)
      - [bot.entity](#botentity)
      - [bot.entities](#botentities)
      - [bot.username](#botusername)
      - [bot.spawnPoint](#botspawnpoint)
      - [bot.heldItem](#bothelditem)
      - [bot.usingHeldItem](#botusinghelditem)
      - [bot.game.levelType](#botgameleveltype)
      - [bot.game.dimension](#botgamedimension)
      - [bot.game.difficulty](#botgamedifficulty)
      - [bot.game.gameMode](#botgamegamemode)
      - [bot.game.hardcore](#botgamehardcore)
      - [bot.game.maxPlayers](#botgamemaxplayers)
      - [bot.game.serverBrand](#botgameserverbrand)
    - [bot.physicsEnabled](#botphysicsenabled)
    - [bot.player](#botplayer)
      - [bot.players](#botplayers)
      - [bot.isRaining](#botisraining)
      - [bot.rainState](#botrainstate)
      - [bot.thunderState](#botthunderstate)
      - [bot.chatPatterns](#botchatpatterns)
      - [bot.settings.chat](#botsettingschat)
      - [bot.settings.colorsEnabled](#botsettingscolorsenabled)
      - [bot.settings.viewDistance](#botsettingsviewdistance)
      - [bot.settings.difficulty](#botsettingsdifficulty)
      - [bot.settings.skinParts](#botsettingsskinparts)
        - [bot.settings.skinParts.showCape - boolean](#botsettingsskinpartsshowcape---boolean)
        - [bot.settings.skinParts.showJacket - boolean](#botsettingsskinpartsshowjacket---boolean)
        - [bot.settings.skinParts.showLeftSleeve - boolean](#botsettingsskinpartsshowleftsleeve---boolean)
        - [bot.settings.skinParts.showRightSleeve - boolean](#botsettingsskinpartsshowrightsleeve---boolean)
        - [bot.settings.skinParts.showLeftPants - boolean](#botsettingsskinpartsshowleftpants---boolean)
        - [bot.settings.skinParts.showRightPants - boolean](#botsettingsskinpartsshowrightpants---boolean)
        - [bot.settings.skinParts.showHat - boolean](#botsettingsskinpartsshowhat---boolean)
      - [bot.experience.level](#botexperiencelevel)
      - [bot.experience.points](#botexperiencepoints)
      - [bot.experience.progress](#botexperienceprogress)
      - [bot.health](#bothealth)
      - [bot.food](#botfood)
      - [bot.foodSaturation](#botfoodsaturation)
      - [bot.oxygenLevel](#botoxygenlevel)
      - [bot.physics](#botphysics)
      - [bot.simpleClick.leftMouse (slot)](#botsimpleclickleftmouse-slot)
      - [bot.simpleClick.rightMouse (slot)](#botsimpleclickrightmouse-slot)
      - [bot.time.doDaylightCycle](#bottimedodaylightcycle)
      - [bot.time.bigTime](#bottimebigtime)
      - [bot.time.time](#bottimetime)
      - [bot.time.timeOfDay](#bottimetimeofday)
      - [bot.time.day](#bottimeday)
      - [bot.time.isDay](#bottimeisday)
      - [bot.time.moonPhase](#bottimemoonphase)
      - [bot.time.bigAge](#bottimebigage)
      - [bot.time.age](#bottimeage)
      - [bot.quickBarSlot](#botquickbarslot)
      - [bot.inventory](#botinventory)
      - [bot.targetDigBlock](#bottargetdigblock)
      - [bot.isSleeping](#botissleeping)
      - [bot.scoreboards](#botscoreboards)
      - [bot.scoreboard](#botscoreboard)
      - [bot.teams](#botteams)
      - [bot.teamMap](#botteammap)
      - [bot.controlState](#botcontrolstate)
    - [Events](#events)
      - ["chat" (username, message, translate, jsonMsg, matches)](#chat-username-message-translate-jsonmsg-matches)
      - ["whisper" (username, message, translate, jsonMsg, matches)](#whisper-username-message-translate-jsonmsg-matches)
      - ["actionBar" (jsonMsg)](#actionbar-jsonmsg)
      - ["message" (jsonMsg, position)](#message-jsonmsg-position)
      - ["messagestr" (message, messagePosition, jsonMsg)](#messagestr-message-messageposition-jsonmsg)
      - ["inject_allowed"](#inject_allowed)
      - ["login"](#login)
      - ["spawn"](#spawn)
      - ["respawn"](#respawn)
      - ["game"](#game)
      - ["resourcePack" (url, hash)](#resourcepack-url-hash)
      - ["title"](#title)
      - ["rain"](#rain)
      - ["weatherUpdate"](#weatherupdate)
      - ["time"](#time)
      - ["kicked" (reason, loggedIn)](#kicked-reason-loggedin)
      - ["end" (reason)](#end-reason)
      - ["error" (err)](#error-err)
      - ["spawnReset"](#spawnreset)
      - ["death"](#death)
      - ["health"](#health)
      - ["breath"](#breath)
      - ["entityAttributes" (entity)](#entityattributes-entity)
      - ["entitySwingArm" (entity)](#entityswingarm-entity)
      - ["entityHurt" (entity)](#entityhurt-entity)
      - ["entityDead" (entity)](#entitydead-entity)
      - ["entityTaming" (entity)](#entitytaming-entity)
      - ["entityTamed" (entity)](#entitytamed-entity)
      - ["entityShakingOffWater" (entity)](#entityshakingoffwater-entity)
      - ["entityEatingGrass" (entity)](#entityeatinggrass-entity)
      - ["entityWake" (entity)](#entitywake-entity)
      - ["entityEat" (entity)](#entityeat-entity)
      - ["entityCriticalEffect" (entity)](#entitycriticaleffect-entity)
      - ["entityMagicCriticalEffect" (entity)](#entitymagiccriticaleffect-entity)
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
      - ["playerUpdated" (player)](#playerupdated-player)
      - ["playerLeft" (player)](#playerleft-player)
      - ["blockUpdate" (oldBlock, newBlock)](#blockupdate-oldblock-newblock)
      - ["blockUpdate:(x, y, z)" (oldBlock, newBlock)](#blockupdatex-y-z-oldblock-newblock)
      - ["blockPlaced" (oldBlock, newBlock)](#blockplaced-oldblock-newblock)
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
      - ["teamCreated" (team)](#teamcreated-team)
      - ["teamRemoved" (team)](#teamremoved-team)
      - ["teamUpdated" (team)](#teamupdated-team)
      - ["teamMemberAdded" (team)](#teammemberadded-team)
      - ["teamMemberRemoved" (team)](#teammemberremoved-team)
      - ["bossBarCreated" (bossBar)](#bossbarcreated-bossbar)
      - ["bossBarDeleted" (bossBar)](#bossbardeleted-bossbar)
      - ["bossBarUpdated" (bossBar)](#bossbarupdated-bossbar)
      - ["heldItemChanged" (heldItem)](#helditemchanged-helditem)
      - ["physicsTick" ()](#physicstick-)
      - ["chat:name" (matches)](#chatname-matches)
    - [Functions](#functions)
      - [bot.blockAt(point, extraInfos=true)](#botblockatpoint-extrainfostrue)
      - [bot.waitForChunksToLoad()](#botwaitforchunkstoload)
      - [bot.blockInSight(maxSteps, vectorLength)](#botblockinsightmaxsteps-vectorlength)
      - [bot.blockAtCursor(maxDistance=256)](#botblockatcursormaxdistance256)
      - [bot.blockAtEntityCursor(entity=bot.entity, maxDistance=256)](#botblockatentitycursorentitybotentity-maxdistance256)
      - [bot.canSeeBlock(block)](#botcanseeblockblock)
      - [bot.findBlocks(options)](#botfindblocksoptions)
      - [bot.findBlock(options)](#botfindblockoptions)
      - [bot.canDigBlock(block)](#botcandigblockblock)
      - [bot.recipesFor(itemType, metadata, minResultCount, craftingTable)](#botrecipesforitemtype-metadata-minresultcount-craftingtable)
      - [bot.recipesAll(itemType, metadata, craftingTable)](#botrecipesallitemtype-metadata-craftingtable)
      - [bot.nearestEntity(match = (entity) => { return true })](#botnearestentitymatch--entity---return-true-)
    - [Methods](#methods)
      - [bot.end(reason)](#botendreason)
      - [bot.quit(reason)](#botquitreason)
      - [bot.tabComplete(str, [assumeCommand], [sendBlockInSight])](#bottabcompletestr-assumecommand-sendblockinsight)
      - [bot.chat(message)](#botchatmessage)
      - [bot.whisper(username, message)](#botwhisperusername-message)
      - [bot.chatAddPattern(pattern, chatType, description)](#botchataddpatternpattern-chattype-description)
      - [bot.addChatPattern(name, pattern, chatPatternOptions)](#botaddchatpatternname-pattern-chatpatternoptions)
      - [bot.addChatPatternSet(name, patterns, chatPatternOptions)](#botaddchatpatternsetname-patterns-chatpatternoptions)
      - [bot.removeChatPattern(name)](#botremovechatpatternname)
      - [bot.awaitMessage(...args)](#botawaitmessageargs)
      - [bot.setSettings(options)](#botsetsettingsoptions)
      - [bot.loadPlugin(plugin)](#botloadpluginplugin)
      - [bot.loadPlugins(plugins)](#botloadpluginsplugins)
      - [bot.hasPlugin(plugin)](#bothaspluginplugin)
      - [bot.sleep(bedBlock)](#botsleepbedblock)
      - [bot.isABed(bedBlock)](#botisabedbedblock)
      - [bot.wake()](#botwake)
      - [bot.setControlState(control, state)](#botsetcontrolstatecontrol-state)
      - [bot.getControlState(control)](#botgetcontrolstatecontrol)
      - [bot.clearControlStates()](#botclearcontrolstates)
      - [bot.getExplosionDamages(entity, position, radius, [rawDamages])](#botgetexplosiondamagesentity-position-radius-rawdamages)
      - [bot.lookAt(point, [force])](#botlookatpoint-force)
      - [bot.look(yaw, pitch, [force])](#botlookyaw-pitch-force)
      - [bot.updateSign(block, text)](#botupdatesignblock-text)
      - [bot.equip(item, destination)](#botequipitem-destination)
      - [bot.unequip(destination)](#botunequipdestination)
      - [bot.tossStack(item)](#bottossstackitem)
      - [bot.toss(itemType, metadata, count)](#bottossitemtype-metadata-count)
      - [bot.dig(block, [forceLook = true], [digFace])](#botdigblock-forcelook--true-digface)
      - [bot.stopDigging()](#botstopdigging)
      - [bot.digTime(block)](#botdigtimeblock)
      - [bot.acceptResourcePack()](#botacceptresourcepack)
      - [bot.denyResourcePack()](#botdenyresourcepack)
      - [bot.placeBlock(referenceBlock, faceVector)](#botplaceblockreferenceblock-facevector)
      - [bot.placeEntity(referenceBlock, faceVector)](#botplaceentityreferenceblock-facevector)
      - [bot.activateBlock(block)](#botactivateblockblock)
      - [bot.activateEntity(entity)](#botactivateentityentity)
      - [bot.activateEntityAt(entity, position)](#botactivateentityatentity-position)
      - [bot.consume()](#botconsume)
      - [bot.fish()](#botfish)
      - [bot.activateItem(offHand=false)](#botactivateitemoffhandfalse)
      - [bot.deactivateItem()](#botdeactivateitem)
      - [bot.useOn(targetEntity)](#botuseontargetentity)
      - [bot.attack(entity, swing = true)](#botattackentity-swing--true)
      - [bot.swingArm([hand], showHand)](#botswingarmhand-showhand)
      - [bot.mount(entity)](#botmountentity)
      - [bot.dismount()](#botdismount)
      - [bot.moveVehicle(left,forward)](#botmovevehicleleftforward)
      - [bot.setQuickBarSlot(slot)](#botsetquickbarslotslot)
      - [bot.craft(recipe, count, craftingTable)](#botcraftrecipe-count-craftingtable)
      - [bot.writeBook(slot, pages)](#botwritebookslot-pages)
      - [bot.openContainer(containerBlock or containerEntity)](#botopencontainercontainerblock-or-containerentity)
      - [bot.openChest(chestBlock or minecartchestEntity)](#botopenchestchestblock-or-minecartchestentity)
      - [bot.openFurnace(furnaceBlock)](#botopenfurnacefurnaceblock)
      - [bot.openDispenser(dispenserBlock)](#botopendispenserdispenserblock)
      - [bot.openEnchantmentTable(enchantmentTableBlock)](#botopenenchantmenttableenchantmenttableblock)
      - [bot.openAnvil(anvilBlock)](#botopenanvilanvilblock)
      - [bot.openVillager(villagerEntity)](#botopenvillagervillagerentity)
      - [bot.trade(villagerInstance, tradeIndex, [times])](#bottradevillagerinstance-tradeindex-times)
      - [bot.setCommandBlock(pos, command, [options])](#botsetcommandblockpos-command-options)
      - [bot.supportFeature(name)](#botsupportfeaturename)
      - [bot.waitForTicks(ticks)](#botwaitforticksticks)
    - [Lower level inventory methods](#lower-level-inventory-methods)
      - [bot.clickWindow(slot, mouseButton, mode)](#botclickwindowslot-mousebutton-mode)
      - [bot.putSelectedItemRange(start, end, window, slot)](#botputselecteditemrangestart-end-window-slot)
      - [bot.putAway(slot)](#botputawayslot)
      - [bot.closeWindow(window)](#botclosewindowwindow)
      - [bot.transfer(options)](#bottransferoptions)
      - [bot.openBlock(block)](#botopenblockblock)
      - [bot.openEntity(entity)](#botopenentityentity)
      - [bot.moveSlotItem(sourceSlot, destSlot)](#botmoveslotitemsourceslot-destslot)
      - [bot.updateHeldItem()](#botupdatehelditem)
      - [bot.getEquipmentDestSlot(destination)](#botgetequipmentdestslotdestination)
    - [bot.creative](#botcreative)
      - [bot.creative.setInventorySlot(slot, item)](#botcreativesetinventoryslotslot-item)
      - [bot.creative.flyTo(destination)](#botcreativeflytodestination)
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
  Text4: { toString: Function } // ChatMessage object
}
```

### Biome

See [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

See [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

See [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

#### window.deposit(itemType, metadata, count)

This function returns a `Promise`, with `void` as its argument when done depositing.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to deposit. `null` is an alias to 1.

#### window.withdraw(itemType, metadata, count)

This function returns a `Promise`, with `void` as its argument when done withdrawing.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to withdraw. `null` is an alias to 1.

#### window.close()

### Recipe

See [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Container

Extends windows.Window for chests, dispensers, etc...
See `bot.openChest(chestBlock or minecartchestEntity)`.

### mineflayer.Furnace

Extends windows.Window for furnace, smelter, etc...
See `bot.openFurnace(furnaceBlock)`.

#### furnace "update"

Fires when `furnace.fuel` and/or `furnace.progress` update.

#### furnace.takeInput()

This function returns a `Promise`, with `item` as its argument upon completion.


#### furnace.takeFuel()

This function returns a `Promise`, with `item` as its argument upon completion.


#### furnace.takeOutput()

This function returns a `Promise`, with `item` as its argument upon completion.


#### furnace.putInput(itemType, metadata, count)

This function returns a `Promise`, with `void` as its argument upon completion.

#### furnace.putFuel(itemType, metadata, count)

This function returns a `Promise`, with `void` as its argument upon completion.

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

### mineflayer.EnchantmentTable

Extends windows.Window for enchantment tables
See `bot.openEnchantmentTable(enchantmentTableBlock)`.

#### enchantmentTable "ready"

Fires when `enchantmentTable.enchantments` is fully populated and you
may make a selection by calling `enchantmentTable.enchant(choice)`.

#### enchantmentTable.targetItem()

Gets the target item. This is both the input and the output of the
enchantment table.

#### enchantmentTable.xpseed

The 16 bits xpseed sent by the server.

#### enchantmentTable.enchantments

Array of length 3 which are the 3 enchantments to choose from.
`level` can be `-1` if the server has not sent the data yet.

Looks like:

```js
[
  {
    level: 3
  },
  {
    level: 4
  },
  {
    level: 9
  }
]
```

#### enchantmentTable.enchant(choice)

This function returns a `Promise`, with `item` as its argument when the item has been enchanted.

 * `choice` - [0-2], the index of the enchantment you want to pick.

#### enchantmentTable.takeTargetItem()

This function returns a `Promise`, with `item` as its argument upon completion.


#### enchantmentTable.putTargetItem(item)

This function returns a `Promise`, with `void` as its argument upon completion.


#### enchantmentTable.putLapis(item)

This function returns a `Promise`, with `void` as its argument upon completion.


### mineflayer.anvil

Extends windows.Window for anvils
See `bot.openAnvil(anvilBlock)`.

#### anvil.combine(itemOne, itemTwo[, name])

This function returns a `Promise`, with `void` as its argument upon completion.


#### anvil.combine(item[, name])

This function returns a `Promise`, with `void` as its argument upon completion.


#### villager "ready"

Fires when `villager.trades` is loaded.

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

#### villager.trade(tradeIndex, [times])
Is the same as [bot.trade(villagerInstance, tradeIndex, [times])](#bottradevillagerinstance-tradeindex-times)

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

### mineflayer.Team

#### Team.name

Name of the team

#### Team.friendlyFire

#### Team.nameTagVisibility

One of `always`, `hideForOtherTeams`, `hideForOwnTeam`

#### Team.collisionRule

One of `always`, `pushOtherTeams`, `pushOwnTeam`

#### Team.color

Color (or formatting) name of team, e.g. `dark_green`, `red`, `underlined`

#### Team.prefix

A chat component containing team prefix

#### Team.suffix

A chat component containing team suffix

#### Team.members

Array of team members. Usernames for players and UUIDs for other entities.

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
 * auth : default to 'mojang', can also be 'microsoft'
 * clientToken : generated if a password is given
 * accessToken : generated if a password is given
 * logErrors : true by default, catch errors and log them
 * hideErrors : true by default, do not log errors (even if logErrors is true)
 * keepAlive : send keep alive packets : default to true
 * checkTimeoutInterval : default to `30*1000` (30s), check if keepalive received at that period, disconnect otherwise.
 * loadInternalPlugins : defaults to true
 * storageBuilder : an optional function, takes as argument version and worldName and return an instance of something with the same API as prismarine-provider-anvil. Will be used to save the world.
 * client : an instance of node-minecraft-protocol, if not specified, mineflayer makes it's own client. This can be used to enable using mineflayer through a proxy of many clients or a vanilla client and a mineflayer client.
 * plugins : object : defaults to {}
   - pluginName : false : don't load internal plugin with given name ie. `pluginName`
   - pluginName : true : load internal plugin with given name ie. `pluginName` even though loadInternalplugins is set to false
   - pluginName : external plugin inject function : loads external plugin, overrides internal plugin with given name ie. `pluginName`
 * physicsEnabled : true by default, should the bot be affected by physics? can later be modified via bot.physicsEnabled
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * chatLengthLimit : the maximum amount of characters that can be sent in a single message. If this is not set, it will be 100 in < 1.11 and 256 in >= 1.11.
 * defaultChatPatterns: defaults to true, set to false to not add the patterns such as chat and whisper

### Properties

#### bot.world

A sync representation of the world. Check the doc at http://github.com/PrismarineJS/prismarine-world

##### world "blockUpdate" (oldBlock, newBlock)

Fires when a block updates. Both `oldBlock` and `newBlock` provided for
comparison.

Note that `oldBlock` may be `null`.

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Fires for a specific point. Both `oldBlock` and `newBlock` provided for
comparison.

Note that `oldBlock` may be `null`.


#### bot.entity

Your own entity. See `Entity`.

#### bot.entities

All nearby entities. This object is a map of entityId to entity.

#### bot.username

Use this to find out your own name.

#### bot.spawnPoint

Coordinates to the main spawn point, where all compasses point to.

#### bot.heldItem

The item in the bot's hand, represented as a [prismarine-item](https://github.com/PrismarineJS/prismarine-item) instance specified with arbitrary metadata, nbtdata, etc.

#### bot.usingHeldItem

Whether the bot is using the item that it's holding, for example eating food or using a shield.

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

#### bot.game.serverBrand

#### bot.game.minY

minimum y of the world

#### bot.game.height

world height

### bot.physicsEnabled

Enable physics, default true.

### bot.player

Bot's player object
```js
{
  username: 'player',
  displayName: { toString: Function }, // ChatMessage object.
  gamemode: 0,
  ping: 28,
  entity: entity // null if you are too far away
}
```

A player's ping starts at 0, you might have to wait a bit for the server to send their actual ping.

#### bot.players

Map of username to people playing the game.

#### bot.isRaining

#### bot.rainState

A number indicating the current rain level. When it isn't raining, this
will be equal to 0. When it starts to rain, this value will increase
gradually up to 1. When it stops raining, this value gradually decreases back to 0.

Each time `bot.rainState` is changed, the "weatherUpdate" event is emitted.

#### bot.thunderState

A number indicating the current thunder level. When there isn't a thunderstorm, this
will be equal to 0. When a thunderstorm starts, this value will increase
gradually up to 1. When the thunderstorm stops, this value gradually decreases back to 0.

Each time `bot.thunderState` is changed, the "weatherUpdate" event is emitted.

This is the same as `bot.rainState`, but for thunderstorms.
For thunderstorms, both `bot.rainState` and `bot.thunderState` will change.

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

#### bot.settings.skinParts

These boolean Settings control if extra Skin Details on the own players' skin should be visible

##### bot.settings.skinParts.showCape - boolean

If you have a cape you can turn it off by setting this to false.

##### bot.settings.skinParts.showJacket - boolean

##### bot.settings.skinParts.showLeftSleeve - boolean

##### bot.settings.skinParts.showRightSleeve - boolean

##### bot.settings.skinParts.showLeftPants - boolean

##### bot.settings.skinParts.showRightPants - boolean

##### bot.settings.skinParts.showHat - boolean


#### bot.experience.level

#### bot.experience.points

Total experience points.

#### bot.experience.progress

Between 0 and 1 - amount to get to the next level.

#### bot.health

Number in the range [0, 20] representing the number of half-hearts.

#### bot.food

Number in the range [0, 20] representing the number of half-turkey-legs.

#### bot.foodSaturation

Food saturation acts as a food "overcharge". Food values will not decrease
while the saturation is over zero. Players logging in automatically get a
saturation of 5.0. Eating food increases the saturation as well as the food bar.

#### bot.oxygenLevel

Number in the range [0, 20] respresenting the number of water-icons known as oxygen level.

#### bot.physics

Edit these numbers to tweak gravity, jump speed, terminal velocity, etc.
Do this at your own risk.

#### bot.simpleClick.leftMouse (slot)

abstraction over `bot.clickWindow(slot, 0, 0)`

#### bot.simpleClick.rightMouse (slot)

abstraction over `bot.clickWindow(slot, 1, 0)`

#### bot.time.doDaylightCycle

Whether or not the gamerule doDaylightCycle is true or false.

#### bot.time.bigTime

The total number of ticks since day 0.

This value is of type BigInt and is accurate even at very large values. (more than 2^51 - 1 ticks)

#### bot.time.time

The total numbers of ticks since day 0.

Because the Number limit of Javascript is at 2^51 - 1 bot.time.time becomes inaccurate higher than this limit and the use of bot.time.bigTime is recommended.
Realistically though you'll probably never need to use bot.time.bigTime as it will only reach 2^51 - 1 ticks naturally after ~14280821 real years.

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

Based on whether the current time of day is between 13000 and 23000 ticks.

#### bot.time.moonPhase

Phase of the moon.

0-7 where 0 is full moon.

#### bot.time.bigAge

Age of the world, in ticks.

This value is of type BigInt and is accurate even at very large values. (more than 2^51 - 1 ticks)

#### bot.time.age

Age of the world, in ticks.

Because the Number limit of Javascript is at 2^51 - 1 bot.time.age becomes inaccurate higher than this limit and the use of bot.time.bigAge is recommended.
Realistically though you'll probably never need to use bot.time.bigAge as it will only reach 2^51 - 1 ticks naturally after ~14280821 real years.

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

#### bot.teams

All teams known to the bot

#### bot.teamMap

Mapping of member to team. Uses usernames for players and UUIDs for entities.

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

#### "messagestr" (message, messagePosition, jsonMsg)

Alias for the "message" event but it calls .toString() on the message object to get a string for the message before emitting.

#### "inject_allowed"
Fires when the index file has been loaded, you can load mcData and plugins here but it's better to wait for "spawn" event.

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

#### "resourcePack" (url, hash)

Emitted when the server sends a resource pack.

#### "title"

Emitted when the server sends a title

 * `text` - title's text

#### "rain"

Emitted when it starts or stops raining. If you join a
server where it is already raining, this event will fire.

#### "weatherUpdate"

Emitted when either `bot.thunderState` or `bot.rainState` changes.
If you join a server where it is already raining, this event will fire.

#### "time"

Emitted when the server sends a time update. See `bot.time`.

#### "kicked" (reason, loggedIn)

Emitted when the bot is kicked from the server. `reason`
is a chat message explaining why you were kicked. `loggedIn`
is `true` if the client was kicked after successfully logging in,
or `false` if the kick occurred in the login phase.

#### "end" (reason)

Emitted when you are no longer connected to the server.
`reason` is a string explaining why the client was disconnected. (defaults to 'socketClosed')

#### "error" (err)

Emitted when an error occurs.

#### "spawnReset"

Fires when you cannot spawn in your bed and your spawn point gets reset.

#### "death"

Fires when you die.

#### "health"

Fires when your hp or food change.

#### "breath"

Fires when your oxygen level change.

#### "entityAttributes" (entity)

Fires when an attribute of an entity changes.

#### "entitySwingArm" (entity)
#### "entityHurt" (entity)
#### "entityDead" (entity)
#### "entityTaming" (entity)
#### "entityTamed" (entity)
#### "entityShakingOffWater" (entity)
#### "entityEatingGrass" (entity)
#### "entityWake" (entity)
#### "entityEat" (entity)
#### "entityCriticalEffect" (entity)
#### "entityMagicCriticalEffect" (entity)
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
#### "playerUpdated" (player)
#### "playerLeft" (player)

#### "blockUpdate" (oldBlock, newBlock)

(It is better to use this event from bot.world instead of bot directly) Fires when a block updates. Both `oldBlock` and `newBlock` provided for
comparison.

Note that `oldBlock` may be `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(It is better to use this event from bot.world instead of bot directly) Fires for a specific point. Both `oldBlock` and `newBlock` provided for
comparison.

Note that `oldBlock` may be `null`.

#### "blockPlaced" (oldBlock, newBlock)

Fires when bot places block. Both `oldBlock` and `newBlock` provided for
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

#### "teamCreated" (team)

Fires when a team is added.

#### "teamRemoved" (team)

Fires when a team is removed.

#### "teamUpdated" (team)

Fires when a team is updated.

#### "teamMemberAdded" (team)

Fires when a team member or multiple members are added to a team.

#### "teamMemberRemoved" (team)

Fires when a team member or multiple members are removed from a team.

#### "bossBarCreated" (bossBar)

Fires when new boss bar is created.

#### "bossBarDeleted" (bossBar)

Fires when new boss bar is deleted.

#### "bossBarUpdated" (bossBar)

Fires when new boss bar is updated.

#### "heldItemChanged" (heldItem)

Fires when the held item is changed.

#### "physicsTick" ()

Fires every tick if bot.physicsEnabled is set to true.

#### "chat:name" (matches)

Fires when the all of a chat pattern's regexs have matches

### Functions

#### bot.blockAt(point, extraInfos=true)

Returns the block at `point` or `null` if that point is not loaded. If `extraInfos` set to true, also returns informations about signs, paintings and block entities (slower).
See `Block`.

#### bot.waitForChunksToLoad()

This function returns a `Promise`, with `void` as its argument when many chunks have loaded.

#### bot.blockInSight(maxSteps, vectorLength)

Deprecated, use `blockAtCursor` instead.

Returns the block at which bot is looking at or `null`
 * `maxSteps` - Number of steps to raytrace, defaults to 256.
 * `vectorLength` - Length of raytracing vector, defaults to `5/16`.

#### bot.blockAtCursor(maxDistance=256)

Returns the block at which bot is looking at or `null`
 * `maxDistance` - The maximum distance the block can be from the eye, defaults to 256.

#### bot.blockAtEntityCursor(entity=bot.entity, maxDistance=256)

Returns the block at which specific entity is looking at or `null`
 * `entity` - Entity data as `Object`
 * `maxDistance` - The maximum distance the block can be from the eye, defaults to 256.

#### bot.canSeeBlock(block)

Returns true or false depending on whether the bot can see the specified `block`.

#### bot.findBlocks(options)

Finds the closest blocks from the given point.
 * `options` - Options for the search:
   - `point` - The start position of the search (center). Default is the bot position.
   - `matching` - A function that returns true if the given block is a match. Also supports this value being a block id or array of block ids.
   - `useExtraInfo` - To preserve backward compatibility can result in two behavior depending on the type
      - **boolean** - Provide your `matching` function more data - noticeably slower aproach
      - **function** - Creates two stage maching, if block passes `matching` function it is passed further to `useExtraInfo` with additional info
   - `maxDistance` - The furthest distance for the search, defaults to 16.
   - `count` - Number of blocks to find before returning the search. Default to 1. Can return less if not enough blocks are found exploring the whole area.

Returns an array (possibly empty) with the found block coordinates (not the blocks). The array is sorted (closest first)

#### bot.findBlock(options)

Alias for `bot.blockAt(bot.findBlocks(options)[0])`. Return a single block or `null`.

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

Example:
```js
const cow = bot.nearestEntity(entity => entity.name.toLowerCase() === 'cow') // we use .toLowercase() because in 1.8 cow was capitalized, for newer versions that can be ommitted
```

### Methods

#### bot.end(reason)

End the connection with the server.
* `reason` - Optional string that states the reason of the end.

#### bot.quit(reason)

Gracefully disconnect from the server with the given reason (defaults to 'disconnect.quitting').

#### bot.tabComplete(str, [assumeCommand], [sendBlockInSight])

This function returns a `Promise`, with `matches` as its argument upon completion.

Requests chat completion from the server.
 * `str` - String to complete.
 * `assumeCommand` - Field sent to server, defaults to false.
 * `sendBlockInSight` - Field sent to server, defaults to true. Set this option to false if you want more performance.

#### bot.chat(message)

Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary.

#### bot.whisper(username, message)

Shortcut for "/tell <username>". All split messages will be whispered to username.

#### bot.chatAddPattern(pattern, chatType, description)

Deprecated, use `addChatPattern` instead.

Adds a regex pattern to the bot's chat matching. Useful for bukkit servers where the chat format changes a lot.
 * `pattern` - regular expression to match chat
 * `chatType` - the event the bot emits when the pattern matches. Eg: "chat" or "whisper"
 * 'description ' - Optional, describes what the pattern is for

#### bot.addChatPattern(name, pattern, chatPatternOptions)

** this is an alias of `bot.addChatPatternSet(name, [pattern], chatPatternOptions)`

make an event that is called every time the pattern is matched to a message,
the event will be called `"chat:name"`, with name being the name passed
* `name` - the name used to listen for the event
* `pattern` - regular expression to match to messages recieved
* `chatPatternOptions` - object
  * `repeat` - defaults to true, whether to listen for this event after the first match
  * `parse` - instead of returning the actual message that was matched, return the capture groups from the regex
  * `deprecated` - (**unstable**) used by bot.chatAddPattern to keep compatability, likely to be removed

returns a number which can be used with bot.removeChatPattern() to only delete this pattern

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

make an event that is called every time all patterns havee been matched to messages,
the event will be called `"chat:name"`, with name being the name passed
* `name` - the name used to listen for the event
* `patterns` - array of regular expression to match to messages recieved
* `chatPatternOptions` - object
  * `repeat` - defaults to true, whether to listen for this event after the first match
  * `parse` - instead of returning the actual message that was matched, return the capture groups from the regex

returns a number which can be used with bot.removeChatPattern() to only delete this patternset

#### bot.removeChatPattern(name)

removes a chat pattern(s)
* `name` : string or number

if name is a string, all patterns that have that name will be removed
else if name is a number, only that exact pattern will be removed

#### bot.awaitMessage(...args)

promise that is resolved when one of the messages passed as an arg is resolved

Example:

```js
async function wait () {
  await bot.awaitMessage('<flatbot> hello world') // resolves on "hello world" in chat by flatbot
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world']) // resolves on "hello" or "world" in chat by flatbot
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world'], ['<flatbot> im', '<flatbot> batman']) // resolves on "hello" or "world" or "im" or "batman" in chat by flatbot
  await bot.awaitMessage('<flatbot> hello', '<flatbot> world') // resolves on "hello" or "world" in chat by flatbot
  await bot.awaitMessage(/<flatbot> (.+)/) // resolves on first message matching the regex
}
```

#### bot.setSettings(options)

See the `bot.settings` property.

#### bot.loadPlugin(plugin)

Injects a Plugin. Does nothing if the plugin is already loaded.

 * `plugin` - function

```js
function somePlugin (bot, options) {
  function someFunction () {
    bot.chat('Yay!')
  }

  bot.myPlugin = {} // Good practice to namespace plugin API
  bot.myPlugin.someFunction = someFunction
}

const bot = mineflayer.createBot({})
bot.loadPlugin(somePlugin)
bot.once('login', function () {
  bot.myPlugin.someFunction() // Yay!
})
```

#### bot.loadPlugins(plugins)

Injects plugins see `bot.loadPlugin`.
 * `plugins` - array of functions

#### bot.hasPlugin(plugin)

Checks if the given plugin is loaded (or scheduled to be loaded) on this bot.

#### bot.sleep(bedBlock)

This function returns a `Promise`, with `void` as its argument upon completion.

Sleep in a bed. `bedBlock` should be a `Block` instance which is a bed. 

#### bot.isABed(bedBlock)

Return true if `bedBlock` is a bed

#### bot.wake()

This function returns a `Promise`, with `void` as its argument upon completion.

Get out of bed. 

#### bot.setControlState(control, state)

This is the main method controlling the bot movements. It works similarly to pressing keys in minecraft.
For example forward with state true will make the bot move forward. Forward with state false will make the bot stop moving forward.
You may use bot.lookAt in conjunction with this to control movement. The jumper.js example shows how to use this.

 * `control` - one of ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
 * `state` - `true` or `false`

#### bot.getControlState(control)

Returns true if a control state is toggled.

* `control` - one of ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']

#### bot.clearControlStates()

Sets all controls to off.

#### bot.getExplosionDamages(entity, position, radius, [rawDamages])

Returns how much damage will be done to the entity in a radius around the position of the explosion.
It will return `null` if the entity has no armor and rawDamages is not set to true, since the function can't calculate the damage with armor if there is no armor.

* `entity` - Entity instance
* `position` - [Vec3](https://github.com/andrewrk/node-vec3) instance
* `radius` - the explosion radius as a number
* `rawDamages` - optional, if true it ignores armor in the calculation

#### bot.lookAt(point, [force])

This function returns a `Promise`, with `void` as its argument when you are looking at `point`.

 * `point` [Vec3](https://github.com/andrewrk/node-vec3) instance - tilts your head so that it is directly facing this point.
 * `force` - See `force` in `bot.look`

#### bot.look(yaw, pitch, [force])

This function returns a `Promise`, with `void` as its argument called when you are looking at `yaw` and `pitch`.

Set the direction your head is facing.

 * `yaw` - The number of radians to rotate around the vertical axis, starting
   from due east. Counter clockwise.
 * `pitch` - Number of radians to point up or down. 0 means straight forward.
   pi / 2 means straight up. -pi / 2 means straight down.
 * `force` - If present and true, skips the smooth server-side transition.
   Specify this to true if you need the server to know exactly where you
   are looking, such as for dropping items or shooting arrows. This is not
   needed for client-side calculation such as walking direction.

#### bot.updateSign(block, text)

Changes the text on the sign.

#### bot.equip(item, destination)

This function returns a `Promise`, with `void` as its argument when you have successfully equipped the item or when you learn that you have failed to equip the item.

Equips an item from your inventory. If the argument `item` is of Instance `Item` equip will equip this specific item from its window slot. If the argument `item` is of type `number` equip will equip the first item found with that id searched by rising slot id (Hotbar is searched last. Armor, crafting, crafting result and off-hand slots are excluded).

 * `item` - `Item` instance or `number` for item id. See `window.items()`.
 * `destination`
   - `"hand"` - `null` aliases to this
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
   - `"off-hand"` - when available

#### bot.unequip(destination)

This function returns a `Promise`, with `void` as its argument upon completion.

Remove an article of equipment.

#### bot.tossStack(item)

This function returns a `Promise`, with `void` as its argument when tossing is done.

 * `item` - the stack of items you wish to toss
   truthy, you were not able to complete the toss.

#### bot.toss(itemType, metadata, count)

This function returns a `Promise`, with `void` as its argument once tossing is complete.

 * `itemType` - numerical id of the item you wish to toss
 * `metadata` - metadata of the item you wish to toss. Use `null`
   to match any metadata
 * `count` - how many you want to toss. `null` is an alias for `1`.

#### bot.dig(block, [forceLook = true], [digFace])

This function returns a `Promise`, with `void` as its argument when the block is broken or you are interrupted.

Begin digging into `block` with the currently equipped item.
See also "diggingCompleted" and "diggingAborted" events.

Note that once you begin digging into a block, you may not
dig any other blocks until the block has been broken, or you call
`bot.stopDigging()`.

 * `block` - the block to start digging into
 * `forceLook` - (optional) if true, look at the block and start mining instantly. If false, the bot will slowly turn to the block to mine. Additionally, this can be assigned to 'ignore' to prevent the bot from moving it's head at all. Also, this can be assigned to 'raycast' to raycast from the bots head to place where the bot is looking.
 * `digFace` - (optional) Default is 'auto' looks at the center of the block and mines the top face. Can also be a vec3 vector
 of the face the bot should be looking at when digging the block. For example: ```vec3(0, 1, 0)``` when mining the top. Can also be 'raycast' raycast checks if there is a face visible by the bot and mines that face. Useful for servers with anti cheat.

If you call bot.dig twice before the first dig is finished, you will get a fatal 'diggingAborted' error.

#### bot.stopDigging()

#### bot.digTime(block)

Tells you how long it will take to dig the block, in milliseconds.

#### bot.acceptResourcePack()

Accepts resource pack.

#### bot.denyResourcePack()

Denies resource pack.

#### bot.placeBlock(referenceBlock, faceVector)

This function returns a `Promise`, with `void` as its argument when the server confirms that the block has indeed been placed.

 * `referenceBlock` - the block you want to place a new block next to
 * `faceVector` - one of the six cardinal directions, such as `new Vec3(0, 1, 0)` for the top face,
   indicating which face of the `referenceBlock` to place the block against.

The new block will be placed at `referenceBlock.position.plus(faceVector)`.

#### bot.placeEntity(referenceBlock, faceVector)

This function returns a `Promise`, with `Entity` as its argument upon completion.

 * `referenceBlock` - the block you want to place the entity next to
 * `faceVector` - one of the six cardinal directions, such as `new Vec3(0, 1, 0)` for the top face,
   indicating which face of the `referenceBlock` to place the block against.

The new block will be placed at `referenceBlock.position.plus(faceVector)`.

#### bot.activateBlock(block)

This function returns a `Promise`, with `void` as its argument upon completion.

Punch a note block, open a door, etc.

 * `block` - the block to activate

#### bot.activateEntity(entity)

This function returns a `Promise`, with `void` as its argument upon completion.

Activate an entity, useful for villager for example.

 * `entity` - the entity to activate

#### bot.activateEntityAt(entity, position)

This function returns a `Promise`, with `void` as its argument upon completion.

Activate an entity at the given position, useful for armor stands.

 * `entity` - the entity to activate
 * `position` - the world position to click at

#### bot.consume()

This function returns a `Promise`, with `void` as its argument when consume ends.

Eat / drink currently held item


#### bot.fish()

This function returns a `Promise`, with `void` as its argument when fishing ends.

Use fishing rod


#### bot.activateItem(offHand=false)

Activates the currently held item. This is how you eat, shoot bows, throw an egg, etc.
Optional parameter is `false` for main hand and `true` for off hand.

#### bot.deactivateItem()

Deactivates the currently held item. This is how you release an arrow, stop eating, etc.

#### bot.useOn(targetEntity)

Use the currently held item on an `Entity` instance. This is how you apply a saddle and
use shears.

#### bot.attack(entity, swing = true)

Attack a player or a mob.

 * `entity` is a type of entity. To get a specific entity use [bot.nearestEntity()](#botnearestentitymatch--entity---return-true-) or [bot.entities](#botentities).
 * `swing` Default `true`. If false the bot does not swing is arm when attacking.

#### bot.swingArm([hand], showHand)

Play an arm swing animation.

 * `hand` can take `left` or `right` which is arm that is animated. Default: `right`
 * `showHand` is a boolean whether to add the hand to the packet, Default: `true`

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

#### bot.craft(recipe, count, craftingTable)

This function returns a `Promise`, with `void` as its argument when the crafting is complete and your inventory is updated.

 * `recipe` - A `Recipe` instance. See `bot.recipesFor`.
 * `count` - How many times you wish to perform the operation.
   If you want to craft planks into `8` sticks, you would set
   `count` to `2`. `null` is an alias for `1`.
 * `craftingTable` - A `Block` instance, the crafting table you wish to
   use. If the recipe does not require a crafting table, you may use
   `null` for this argument.

#### bot.writeBook(slot, pages)

This function returns a `Promise`, with `void` as its argument when the writing was successfully or an error occurred.

 * `slot` is in inventory window coordinates (where 36 is the first quickbar slot, etc.).
 * `pages` is an array of strings represents the pages.

#### bot.openContainer(containerBlock or containerEntity)

Returns a promise on a `Container` instance which represents the container you are opening.

#### bot.openChest(chestBlock or minecartchestEntity)

Deprecated. Same as `openContainer`

#### bot.openFurnace(furnaceBlock)

Returns a promise on a `Furnace` instance which represents the furnace you are opening.

#### bot.openDispenser(dispenserBlock)

Deprecated. Same as `openContainer`

#### bot.openEnchantmentTable(enchantmentTableBlock)

Returns a promise on an `EnchantmentTable` instance which represents the enchantment table
you are opening.

#### bot.openAnvil(anvilBlock)

Returns a promise on an `anvil` instance which represents the anvil you are opening.

#### bot.openVillager(villagerEntity)

Returns a promise on a `Villager` instance which represents the trading window you are opening.
You can listen to the `ready` event on this `Villager` to know when it's ready

#### bot.trade(villagerInstance, tradeIndex, [times])

This function returns a `Promise`, with `void` as its argument upon completion.

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

#### bot.waitForTicks(ticks)

This is a promise-based function that waits for a given number of in-game ticks to pass before continuing. This is useful for quick timers that need to function with specific timing, regardless of the given physics tick speed of the bot. This is similar to the standard Javascript setTimeout function, but runs on the physics timer of the bot specifically.

### Lower level inventory methods

These are lower level methods for the inventory, they can be useful sometimes but prefer the inventory methods presented above if you can.

#### bot.clickWindow(slot, mouseButton, mode)

This function returns a `Promise`, with `void` as its argument upon completion.

Click on the current window. See details at https://wiki.vg/Protocol#Click_Window

#### bot.putSelectedItemRange(start, end, window, slot)

This function returns a `Promise`, with `void` as its argument upon completion.

Put the item at `slot` in the specified range.

#### bot.putAway(slot)

This function returns a `Promise`, with `void` as its argument upon completion.

Put the item at `slot` in the inventory.

#### bot.closeWindow(window)

Close the `window`.

#### bot.transfer(options)

This function returns a `Promise`, with `void` as its argument upon completion.

Transfer some kind of item from one range to an other. `options` is an object containing :

 * `window` : the window where the item will be moved
 * `itemType` : the type of the moved items
 * `metadata` : the metadata of the moved items
 * `sourceStart` and `sourceEnd` : the source range
 * `destStart` and `destEnd` : the dest Range
 * `count` : the amount of items to transfer. Default: `1`
 * `nbt` : nbt data of the item to transfer. Default: `nullish` (ignores nbt)

#### bot.openBlock(block)

Open a block, for example a chest, returns a promise on the opening `Window`.

 * `block` is the block the bot will open

#### bot.openEntity(entity)

Open an entity with an inventory, for example a villager, returns a promise on the opening `Window`.

 * `entity` is the entity the bot will open

#### bot.moveSlotItem(sourceSlot, destSlot)

This function returns a `Promise`, with `void` as its argument upon completion.

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

#### bot.creative.setInventorySlot(slot, item)

This function returns a `Promise`, with `void` as its argument when gets fired when the servers sets the slot.

Gives the bot the specified item in the specified inventory slot.

 * `slot` is in inventory window coordinates (where 36 is the first quickbar slot, etc.).
 * `item` is a [prismarine-item](https://github.com/PrismarineJS/prismarine-item) instance specified with arbitrary metadata, nbtdata, etc.
    If `item` is `null`, the item at the specified slot is deleted.

If this method changes anything, you can be notified via `bot.inventory.on("updateSlot")`.

#### bot.creative.flyTo(destination)

This function returns a `Promise`, with `void` as its argument when the bot arrives at the destination.

Calls `startFlying()` and moves at a constant speed through 3d space in a straight line to the destination.
`destination` is a `Vec3`, and often the `x` and `z` coordinates will end with `.5`.
This operation will not work if there is an obstacle in the way,
so it is advised to fly very short distances at a time.

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
