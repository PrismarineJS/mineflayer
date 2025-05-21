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
      - [window.deposit(itemType, metadata, count, [callback])](#windowdeposititemtype-metadata-count-callback)
      - [window.withdraw(itemType, metadata, count, [callback])](#windowwithdrawitemtype-metadata-count-callback)
      - [window.close()](#windowclose)
    - [Recipe](#recipe)
    - [mineflayer.Container](#mineflayercontainer)
    - [mineflayer.Furnace](#mineflayerfurnace)
      - [furnace "update"](#furnace-update)
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
    - [mineflayer.EnchantmentTable](#mineflayerenchantmenttable)
      - [enchantmentTable "ready"](#enchantmenttable-ready)
      - [enchantmentTable.targetItem()](#enchantmenttabletargetitem)
      - [enchantmentTable.xpseed](#enchantmenttablexpseed)
      - [enchantmentTable.enchantments](#enchantmenttableenchantments)
      - [enchantmentTable.enchant(choice, [callback])](#enchantmenttableenchantchoice-callback)
      - [enchantmentTable.takeTargetItem([callback])](#enchantmenttabletaketargetitemcallback)
      - [enchantmentTable.putTargetItem(item, [callback])](#enchantmenttableputtargetitemitem-callback)
      - [enchantmentTable.putLapis(item, [callback])](#enchantmenttableputlapisitem-callback)
    - [mineflayer.anvil](#mineflayeranvil)
      - [anvil.combine(itemOne, itemTwo[, name, callback])](#anvilcombineitemone-itemtwo-name-callback)
      - [anvil.combine(item[, name, callback])](#anvilcombineitem-name-callback)
      - [villager "ready"](#villager-ready)
      - [villager.trades](#villagertrades)
      - [villager.trade(tradeIndex, [times], [cb])](#villagertradetradeindex-times-cb)
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
      - ["title" (title, type)](#title-title-type)
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
      - [bot.waitForChunksToLoad(cb)](#botwaitforchunkstoloadcb)
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
      - [bot.tabComplete(str, cb, [assumeCommand], [sendBlockInSight])](#bottabcompletestr-cb-assumecommand-sendblockinsight)
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
      - [bot.sleep(bedBlock, [cb])](#botsleepbedblock-cb)
      - [bot.isABed(bedBlock)](#botisabedbedblock)
      - [bot.wake([cb])](#botwakecb)
      - [bot.setControlState(control, state)](#botsetcontrolstatecontrol-state)
      - [bot.getControlState(control)](#botgetcontrolstatecontrol)
      - [bot.clearControlStates()](#botclearcontrolstates)
      - [bot.getExplosionDamages(entity, position, radius, [rawDamages])](#botgetexplosiondamagesentity-position-radius-rawdamages)
      - [bot.lookAt(point, [force], [callback])](#botlookatpoint-force-callback)
      - [bot.look(yaw, pitch, [force], [callback])](#botlookyaw-pitch-force-callback)
      - [bot.updateSign(block, text)](#botupdatesignblock-text)
      - [bot.equip(item, destination, [callback])](#botequipitem-destination-callback)
      - [bot.unequip(destination, [callback])](#botunequipdestination-callback)
      - [bot.tossStack(item, [callback])](#bottossstackitem-callback)
      - [bot.toss(itemType, metadata, count, [callback])](#bottossitemtype-metadata-count-callback)
      - [bot.dig(block, [forceLook = true], [digFace], [callback])](#botdigblock-forcelook--true-digface-callback)
      - [bot.stopDigging()](#botstopdigging)
      - [bot.digTime(block)](#botdigtimeblock)
      - [bot.acceptResourcePack()](#botacceptresourcepack)
      - [bot.denyResourcePack()](#botdenyresourcepack)
      - [bot.placeBlock(referenceBlock, faceVector, cb)](#botplaceblockreferenceblock-facevector-cb)
      - [bot.placeEntity(referenceBlock, faceVector)](#botplaceentityreferenceblock-facevector)
      - [bot.activateBlock(block, [callback])](#botactivateblockblock-callback)
      - [bot.activateEntity(entity, [callback])](#botactivateentityentity-callback)
      - [bot.activateEntityAt(entity, position, [callback])](#botactivateentityatentity-position-callback)
      - [bot.consume(callback)](#botconsumecallback)
      - [bot.fish(callback)](#botfishcallback)
      - [bot.activateItem(offHand=false)](#botactivateitemoffhandfalse)
      - [bot.deactivateItem()](#botdeactivateitem)
      - [bot.useOn(targetEntity)](#botuseontargetentity)
      - [bot.attack(entity, swing = true)](#botattackentity-swing--true)
      - [bot.swingArm([hand], showHand)](#botswingarmhand-showhand)
      - [bot.mount(entity)](#botmountentity)
      - [bot.dismount()](#botdismount)
      - [bot.moveVehicle(left,forward)](#botmovevehicleleftforward)
      - [bot.setQuickBarSlot(slot)](#botsetquickbarslotslot)
      - [bot.craft(recipe, count, craftingTable, [callback])](#botcraftrecipe-count-craftingtable-callback)
      - [bot.writeBook(slot, pages, [callback])](#botwritebookslot-pages-callback)
      - [bot.openContainer(containerBlock or containerEntity)](#botopencontainercontainerblock-or-containerentity)
      - [bot.openChest(chestBlock or minecartchestEntity)](#botopenchestchestblock-or-minecartchestentity)
      - [bot.openFurnace(furnaceBlock)](#botopenfurnacefurnaceblock)
      - [bot.openDispenser(dispenserBlock)](#botopendispenserdispenserblock)
      - [bot.openEnchantmentTable(enchantmentTableBlock)](#botopenenchantmenttableenchantmenttableblock)
      - [bot.openAnvil(anvilBlock)](#botopenanvilanvilblock)
      - [bot.openVillager(villagerEntity)](#botopenvillagervillagerentity)
      - [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)
      - [bot.setCommandBlock(pos, command, [options])](#botsetcommandblockpos-command-options)
      - [bot.supportFeature(name)](#botsupportfeaturename)
      - [bot.waitForTicks(ticks)](#botwaitforticksticks)
    - [Lower level inventory methods](#lower-level-inventory-methods)
      - [bot.clickWindow(slot, mouseButton, mode, cb)](#botclickwindowslot-mousebutton-mode-cb)
      - [bot.putSelectedItemRange(start, end, window, slot)](#botputselecteditemrangestart-end-window-slot)
      - [bot.putAway(slot)](#botputawayslot)
      - [bot.closeWindow(window)](#botclosewindowwindow)
      - [bot.transfer(options, cb)](#bottransferoptions-cb)
      - [bot.openBlock(block)](#botopenblockblock)
      - [bot.openEntity(entity)](#botopenentityentity)
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

实体表示玩家、怪物和对象.

它们在许多事件中被触发, 您可以使用 `bot.entity`.访问自己的实体
见 [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

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

#### window.deposit(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to deposit. `null` is an alias to 1.
 * `callback(err)` - (optional) - called when done depositing

#### window.withdraw(itemType, metadata, count, [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `itemType` - numerical item id
 * `metadata` - numerical value. `null` means match anything.
 * `count` - how many to withdraw. `null` is an alias to 1.
 * `callback(err)` - (optional) - called when done withdrawing

#### window.close()

### Recipe

See [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Container

Extends windows.Window for chests, dispensers, etc...
See `bot.openContainer(chestBlock or minecartchestEntity)`.

### mineflayer.Furnace

Extends windows.Window for furnace, smelter, etc...
See `bot.openFurnace(furnaceBlock)`.

#### furnace "update"

Fires when `furnace.fuel` and/or `furnace.progress` update.

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

### mineflayer.anvil

Extends windows.Window for anvils
See `bot.openAnvil(anvilBlock)`.

#### anvil.combine(itemOne, itemTwo[, name, callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `callback(err)` - in order to use callback, pass an empty string ('') for name

#### anvil.combine(item[, name, callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `callback(err)`

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

#### villager.trade(tradeIndex, [times], [cb])
Is the same as [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)

### mineflayer.ScoreBoard

#### ScoreBoard.name

记分牌的名称

#### ScoreBoard.title

记分牌的标题 (does not always equal the name)

#### ScoreBoard.itemsMap

记分板中包含所有项目的对象
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

记分板中包含所有已排序项的数组
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.Team

#### Team.name

队伍名称

#### Team.friendlyFire

#### Team.nameTagVisibility

`always`, `hideForOtherTeams`, `hideForOwnTeam` 其中一个

#### Team.collisionRule

 `always`, `pushOtherTeams`, `pushOwnTeam ` 其中一个

#### Team.color

Color (or formatting) name of team, 如 `dark_green`, `red`, `underlined`

#### Team.prefix

一个聊天组件，包含队伍前缀

#### Team.suffix

一个聊天组件，包含队伍后缀

#### Team.members

Array of team members. Usernames for players and UUIDs for other entities.

### mineflayer.BossBar

#### BossBar.title

boss 栏标题,  ChatMessage 有例子

#### BossBar.health

boss 生命百分比, 从`0` 到`1`

#### BossBar.dividers

Number of boss bar dividers, one of `0`, `6`, `10`, `12`, `20`

#### BossBar.entityUUID

Boss 栏实体 uuid

#### BossBar.shouldDarkenSky

Determines whether or not to darken the sky

#### BossBar.isDragonBar

Determines whether or not boss bar is dragon bar

#### BossBar.createFog

Determines whether or not boss bar creates fog

#### BossBar.color

Determines what color the boss bar color is,  `pink`, `blue`, `red`, `green`, `yellow`, `purple`, `white `之中的一个

## Bot

### mineflayer.createBot(options)

创建并返回bot类的实例。
`options` 是包含可选属性的对象 :

 * username : 用户名，默认为 'Player'
 * port : 端口，默认为 25565
 * password : 可以省略 (如果token也被省略，那么它将尝试以离线模式连接)
 * host : 默认为 localhost
 * version : 默认为自动猜测服务器的版本。值示例："1.12.2"
 * auth : 默认为"mojang"，也可以是"microsoft"
 * clientToken : 如果给定密码，则生成
 * accessToken : 如果给定密码，则生成
 * logErrors : 默认情况下为true，捕获错误并记录它们
 * hideErrors : 默认情况下为true，不记录错误（即使logErrors为true）
 * keepAlive : 发送保持活动的数据包：默认为true
 * checkTimeoutInterval : 默认 `30*1000` (30s), 检查是否在此期间收到keepalive，否则断开连接。
 * loadInternalPlugins : 默认为true
 * storageBuilder : 可选功能,将version和worldName作为参数，并返回与prismarine-provider-anvil具有相同API的某个对象的实例 ，将被用来保存世界
 * client : node-minecraft-protocol 实例, 如果未指定，mineflayer将创建自己的客户端.这可用于通过许多客户端的代理或普通客户端和mineflayer客户端来启用mineflayer
 * plugins : object : 默认为{}
   - pluginName : false : don't load internal plugin with given name ie. `pluginName`
   - pluginName : true : load internal plugin with given name ie. `pluginName` 即使loadInternalplugins设置为false
   - pluginName : 外部插件注入函数: 加载外部插件, overrides internal plugin with given name ie. `pluginName`
 * physicsEnabled : 默认为true, 机器人应该受到物理的影响吗？ 以后可以通过 bot.physicsEnabled 修改
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * chatLengthLimit : 单个消息中可以发送的最大字符数. 如果没有设置， 那么游戏版本在 < 1.11 为100  在 >= 1.11 为256
 * defaultChatPatterns: 默认为true, 设置为false不添加聊天和私信等模式

### Properties

#### bot.world

A sync representation of the world. 查看以下位置的文档： http://github.com/PrismarineJS/prismarine-world

##### world "blockUpdate" (oldBlock, newBlock)

当方块更新时触发. Both `oldBlock` and `newBlock` provided for
comparison.

注意 `oldBlock` 可能是 `null`.

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Fires for a specific point. Both `oldBlock` and `newBlock` provided for
comparison.

注意:  `oldBlock` 可能为 `null`


#### bot.entity

Bot自己的实体. 见 `Entity`.

#### bot.entities

所有附近的实体。 This object is a map of entityId to entity.

#### bot.username

机器人自己的名字

#### bot.spawnPoint

到主出生点的坐标, 所有指南针指向的地方。

#### bot.heldItem

机器人手中的物品, represented as a [prismarine-item](https://github.com/PrismarineJS/prismarine-item) instance specified with arbitrary metadata, nbtdata, etc.

#### bot.usingHeldItem

机器人是否正在使用其持有的物品，例如吃食物或使用盾牌。

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

#### bot.game.serverBrand

### bot.physicsEnabled

启用物理，默认为true。

### bot.player

机器人的玩家对象
```js
{
  username: 'player',
  displayName: { toString: Function }, // ChatMessage object.
  gamemode: 0,
  ping: 28,
  entity: entity // 如果距离太远，则为空
}
```

一个玩家的ping值从0开始,您可能需要等待服务器发送实际的ping

#### bot.players

Map of username to people playing the game.

#### bot.isRaining

#### bot.rainState

指示当前降雨量的数字。不下雨的时候，这个
将等于0。 当开始下雨时，该值将增加
逐渐上升到1。当雨停时，该值逐渐减小回0。

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

选项:

 * `enabled` (默认)
 * `commandsOnly`
 * `disabled`

#### bot.settings.colorsEnabled

默认为true，无论您是否从服务器接收聊天中的颜色代码。

#### bot.settings.viewDistance

选项:
 * `far` (默认)
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

Same as from server.properties.

#### bot.settings.skinParts

这些boolean设置控制玩家皮肤上的额外皮肤细节是否可见

##### bot.settings.skinParts.showCape - boolean

如果您有披风，可以将其设置为false来关闭它

##### bot.settings.skinParts.showJacket - boolean

##### bot.settings.skinParts.showLeftSleeve - boolean

##### bot.settings.skinParts.showRightSleeve - boolean

##### bot.settings.skinParts.showLeftPants - boolean

##### bot.settings.skinParts.showRightPants - boolean

##### bot.settings.skinParts.showHat - boolean


#### bot.experience.level

#### bot.experience.points

总经验点数

#### bot.experience.progress

Between 0 and 1 - amount to get to the next level.

#### bot.health

[0,20]范围内的数字，表示半颗心的数量。

#### bot.food

 [0, 20] 范围内的数字，表示半个鸡腿的数量。

#### bot.foodSaturation

Food saturation acts as a food "overcharge". Food values will not decrease
while the saturation is over zero. Players logging in automatically get a
saturation of 5.0. Eating food increases the saturation as well as the food bar.

#### bot.oxygenLevel

Number in the range [0, 20] respresenting the number of water-icons known as oxygen level.

#### bot.physics

编辑这些数字以调整重力、跳跃速度、终点速度等。
这样做的风险由你自己承担。

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

一天中的时间，单位为Tick

Time is based on ticks, where 20 ticks happen every second. There are 24000
ticks in a day, making Minecraft days exactly 20 minutes long.

The time of day is based on the timestamp modulo 24000. 0 is sunrise, 6000
is noon, 12000 is sunset, and 18000 is midnight.

#### bot.time.day

世界中的一天

#### bot.time.isDay

Whether it is day or not.

Based on whether the current time of day is between 13000 and 23000 ticks.

#### bot.time.moonPhase

月相

0-7，其中0表示满月

#### bot.time.bigAge

世界的年龄以tick为单位

此值为BigInt类型，即使在非常大的值下也准确。 (more than 2^51 - 1 ticks)

#### bot.time.age

Age of the world, in ticks.

Because the Number limit of Javascript is at 2^51 - 1 bot.time.age becomes inaccurate higher than this limit and the use of bot.time.bigAge is recommended.
Realistically though you'll probably never need to use bot.time.bigAge as it will only reach 2^51 - 1 ticks naturally after ~14280821 real years.

#### bot.quickBarSlot

选择了哪个物品栏位 (0 - 8)

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
 * `0-18` - slots defined in [protocol](https://minecraft.wiki/w/Protocol#Display_Scoreboard)

#### bot.teams

机器人已知的所有队伍

#### bot.teamMap

Mapping of member to team. Uses usernames for players and UUIDs for entities.

#### bot.controlState

An object whose keys are the main control states: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].

Setting values for this object internally calls [bot.setControlState](#botsetcontrolstatecontrol-state).

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

仅在玩家公开聊天时触发

 * `username` - who said the message (compare with `bot.username` to ignore your own chat)
 * `message` - stripped of all color and control characters
 * `translate` - chat message type. Null for most bukkit chat messages
 * `jsonMsg` - unmodified JSON message from the server
 * `matches` - array of returned matches from regular expressions. May be null

#### "whisper" (username, message, translate, jsonMsg, matches)

仅当玩家私下与您聊天时触发

 * `username` - 谁发的消息
 * `message` - 去除所有颜色和控制字符
 * `translate` - 聊天信息类型. 大多数bukkit聊天信息为空
 * `jsonMsg` - 来自服务器的未修改的JSON消息
 * `matches` - 返回从正则表达式的匹配项数组。可能为空

#### "actionBar" (jsonMsg)

Emitted for every server message which appears on the Action Bar.

 * `jsonMsg` - 来自服务器的未修改的JSON消息

#### "message" (jsonMsg, position)

Emitted for every server message, including chats.

 * `jsonMsg` - unmodified JSON message from the server

 * `position` - (>= 1.8.1): 聊天信息的position可以是
   * chat
   * system
   * game_info

#### "messagestr" (message, messagePosition, jsonMsg)

`message`事件的别名，但它调用消息对象上的toString()，以在发出前获取消息的字符串。

#### "inject_allowed"
加载索引文件后触发，您可以在此处加载mcData和插件，但最好等待`spawn`事件。

#### "login"

成功登录到服务器后触发。
在做任何事情之前 您可能要等待"spawn"事件。

#### "spawn"

在您首次登录和出生后触发一次然后在你死后重生时触发。

这通常是您想要监听的事件在服务器上执行任何操作之前.

#### "respawn"

在改变维度时和出生之前触发。
一般忽略此事件并等待"spawn"事件。

#### "game"

服务器更改任何游戏属性时触发。

#### "resourcePack" (url, hash)

当服务器发送资源包时触发

#### "title" (title, type)

当服务器发送标题时触发

 * `title` - 标题文本
 * `type` - 标题类型 "subtitle" 或 "title"

#### "rain"

开始或停止下雨时触发. 如果你加入已在下雨的服务器上，将触发此事件。

#### "weatherUpdate"

Emitted when either `bot.thunderState` or `bot.rainState` changes.
If you join a server where it is already raining, this event will fire.

#### "time"

当服务器发送时间更新时触发. 见 `bot.time`

#### "kicked" (reason, loggedIn)

当bot从服务器被踢出时触发

 `reason`是一条解释你被踢的原因的聊天信息.

`loggedIn`
 如果客户端在成功登录后被踢出则为`true`
如果kick发生在登录阶段则为 `false`

#### "end" (reason)

当您不再连接到服务器时触发
`reason` 是一个字符串，用于解释客户端断开连接的原因。 (默认为 'socketClosed')

#### "error" (err)

发生错误时触发

#### "spawnReset"

当你不能在床上出生并且出生点重置时触发

#### "death"

当你死亡时触发

#### "health"

当你的血量或饥饿发生变化时触发

#### "breath"

当你的氧气水平改变时触发

#### "entityAttributes" (entity)

当实体的属性更改时触发

#### "entitySwingArm" (entity)
#### "entityHurt" (entity)

实体被攻击（指被攻击不是受到伤害

#### "entityDead" (entity)
#### "entityTaming" (entity)
#### "entityTamed" (entity)
#### "entityShakingOffWater" (entity)
#### "entityEatingGrass" (entity)

实体吃草

#### "entityWake" (entity)

实体睡醒

#### "entityEat" (entity)

实体进食

#### "entityCriticalEffect" (entity)

实体暴击效果

#### "entityMagicCriticalEffect" (entity)
#### "entityCrouch" (entity)
#### "entityUncrouch" (entity)
#### "entityEquip" (entity)
#### "entitySleep" (entity)
#### "entitySpawn" (entity)
#### "itemDrop" (entity)
#### "playerCollect" (collector, collected)

某实体拾取一个物品

 * `collector` - 拾取物品的实体
 * `collected` - 地面上的物品所在的实体

#### "entityGone" (entity)
#### "entityMoved" (entity)

已移动的实体

#### "entityDetach" (entity, vehicle)
#### "entityAttach" (entity, vehicle)

实体乘骑在交通工具上, 例如矿车和船

 * `entity` - 搭便车的实体
 * `vehicle` - 作为车辆的实体

#### "entityUpdate" (entity)
#### "entityEffect" (entity, effect)

实体获得buff效果

#### "entityEffectEnd" (entity, effect)
#### "playerJoined" (player)

玩家加入游戏后触发

#### "playerUpdated" (player)
#### "playerLeft" (player)

玩家离开游戏触发

#### "blockUpdate" (oldBlock, newBlock)

(It is better to use this event from bot.world instead of bot directly) Fires when a block updates. Both `oldBlock` and `newBlock` provided for
comparison.

注意:  `oldBlock` 可能为 `null`

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(It is better to use this event from bot.world instead of bot directly) Fires for a specific point. Both `oldBlock` and `newBlock` provided for
comparison.

注意:  `oldBlock` 可能为 `null`

#### "blockPlaced" (oldBlock, newBlock)

当机器人放置方块时触发. Both `oldBlock` and `newBlock` provided for
comparison.

注意:  `oldBlock` 可能为 `null`

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

当区块已更新时触发. `point` is the coordinates to the corner of the chunk with the smallest x, y, and z values.

#### "soundEffectHeard" (soundName, position, volume, pitch)

当客户端听到指定的音效时触发

 * `soundName`: 音效名称
 * `position`:  Vec3 实例，声音从哪里发出（译者注：vec3即 x,y,z坐标
 * `volume`: 浮点数音量, 1.0 为100%
 * `pitch`: 整数音高，63为100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

  Fires when the client hears a hardcoded sound effect.

   * `soundId`: id of the sound effect
   * `soundCategory`: category of the sound effect
   * `position`: a Vec3 instance where the sound originates
   * `volume`: floating point volume, 1.0 is 100%
   * `pitch`: integer pitch, 63 is 100%

#### "noteHeard" (block, instrument, pitch)

当一个音符块在某处响起时触发

 * `block`: a Block instance, the block that emitted the noise
 * `instrument`:
   - `id`: integer id
   - `name`: one of [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`].
 * `pitch`: The pitch of the note (between 0-24 inclusive where 0 is the
   lowest and 24 is the highest). More information about how the pitch values
   correspond to notes in real life are available on the
   [official Minecraft wiki](http://minecraft.wiki/w/Note_Block).

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

 * `block` - 方块不再存在

#### "diggingAborted" (block)

 * `block` - 方块仍然存在

#### "usedFirework" (fireworkEntityId)

在机器人在鞘翅飞行时使用烟花火箭时触发

 * `fireworkEntityId` - 烟花火箭的实体编号

#### "move"

当机器人移动时触发. 如果需要当前位置，请使用
`bot.entity.position` 对于正常移动，如果您想要上一个位置，请使用
`bot.entity.position.minus(bot.entity.velocity)`.

#### "forcedMove"

Fires when the bot is force moved by the server (teleport, spawning, ...). If you want the current position, use
`bot.entity.position`.

#### "mount"

乘骑实体（如矿车）时触发

要访问实体，请使用 `bot.vehicle`.

要乘骑实体, 请使用 `mount`.

#### "dismount" (vehicle)

实体从坐骑上下马时触发

#### "windowOpen" (window)

Fires when you begin using a workbench, chest, brewing stand, etc.

#### "windowClose" (window)

Fires when you may no longer work with a workbench, chest, etc.

#### "sleep"

睡觉时触发

#### "wake"

当你醒来的时候触发

#### "experience"

当 `bot.experience.*` 经验点数变化时触发

#### "scoreboardCreated" (scoreboard)

记分牌被添加时触发

#### "scoreboardDeleted" (scoreboard)

记分板被删除时触发

#### "scoreboardTitleChanged" (scoreboard)

当记分牌标题更新时触发

#### "scoreUpdated" (scoreboard, item)

Fires when the score of a item in a scoreboard is updated.

#### "scoreRemoved" (scoreboard, item)

Fires when the score of a item in a scoreboard is removed.

#### "scoreboardPosition" (position, scoreboard)

Fires when the position of a scoreboard is updated.

#### "teamCreated" (team)

添加队伍时触发

#### "teamRemoved" (team)

队伍被移除触发

#### "teamUpdated" (team)

更新队伍触发

#### "teamMemberAdded" (team)

Fires when a team member or multiple members are added to a team.

#### "teamMemberRemoved" (team)

Fires when a team member or multiple members are removed from a team.

#### "bossBarCreated" (bossBar)

新boss栏创建时触发

#### "bossBarDeleted" (bossBar)

新boss栏删除时激发。

#### "bossBarUpdated" (bossBar)

更新新boss栏时触发

#### "heldItemChanged" (heldItem)

手持物品变动时触发

#### "physicsTick" ()

如果 bot.physicsEnabled 设为true则每tick触发一次

#### "chat:name" (matches)

Fires when the all of a chat pattern's regexs have matches

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

示例:
```js
const cow = bot.nearestEntity(entity => entity.name.toLowerCase() === 'cow') // 我们使用 .toLowercase() 因为在1.8版本中，cow是大写的，这样可以适用于新版本
```

### Methods

#### bot.end(reason)

End the connection with the server.
* `reason` - Optional string that states the reason of the end.

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

Equips an item from your inventory. If the argument `item` is of Instance `Item` equip will equip this specific item from its window slot. If the argument `item` is of type `number` equip will equip the first item found with that id searched by rising slot id (Hotbar is searched last. Armor, crafting, crafting result and off-hand slots are excluded).

 * `item` - `Item` instance or `number` for item id. See `window.items()`.
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

#### bot.dig(block, [forceLook = true], [digFace], [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Begin digging into `block` with the currently equipped item.
See also "diggingCompleted" and "diggingAborted" events.

Note that once you begin digging into a block, you may not
dig any other blocks until the block has been broken, or you call
`bot.stopDigging()`.

 * `block` - the block to start digging into
 * `forceLook` - (optional) if true, look at the block and start mining instantly. If false, the bot will slowly turn to the block to mine. Additionally, this can be assigned to 'ignore' to prevent the bot from moving it's head at all. Also, this can be assigned to 'raycast' to raycast from the bots head to place where the bot is looking.
 * `digFace` - (optional) Default is 'auto' looks at the center of the block and mines the top face. Can also be a vec3 vector
 of the face the bot should be looking at when digging the block. For example: ```vec3(0, 1, 0)``` when mining the top. Can also be 'raycast' raycast checks if there is a face visible by the bot and mines that face. Useful for servers with anti cheat.
 * `callback(err)` - (optional) called when the block is broken or you
   are interrupted.

If you call bot.dig twice before the first dig is finished, you will get a fatal 'diggingAborted' error.

#### bot.stopDigging()

#### bot.digTime(block)

Tells you how long it will take to dig the block, in milliseconds.

#### bot.acceptResourcePack()

Accepts resource pack.

#### bot.denyResourcePack()

Denies resource pack.

#### bot.placeBlock(referenceBlock, faceVector, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

 * `referenceBlock` - the block you want to place a new block next to
 * `faceVector` - one of the six cardinal directions, such as `new Vec3(0, 1, 0)` for the top face,
   indicating which face of the `referenceBlock` to place the block against.
 * `cb` will be called when the server confirms that the block has indeed been placed

The new block will be placed at `referenceBlock.position.plus(faceVector)`.

#### bot.placeEntity(referenceBlock, faceVector)

This function also returns a `Promise`, with `Entity` as its argument upon completion.

 * `referenceBlock` - the block you want to place the entity next to
 * `faceVector` - one of the six cardinal directions, such as `new Vec3(0, 1, 0)` for the top face,
   indicating which face of the `referenceBlock` to place the block against.

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

#### bot.waitForTicks(ticks)

This is a promise-based function that waits for a given number of in-game ticks to pass before continuing. This is useful for quick timers that need to function with specific timing, regardless of the given physics tick speed of the bot. This is similar to the standard Javascript setTimeout function, but runs on the physics timer of the bot specifically.

### Lower level inventory methods

These are lower level methods for the inventory, they can be useful sometimes but prefer the inventory methods presented above if you can.

#### bot.clickWindow(slot, mouseButton, mode, cb)

This function also returns a `Promise`, with `void` as its argument upon completion.

Click on the current window. See details at https://minecraft.wiki/w/Protocol#Click_Window

#### bot.putSelectedItemRange(start, end, window, slot)

This function also returns a `Promise`, with `void` as its argument upon completion.

Put the item at `slot` in the specified range.

#### bot.putAway(slot)

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
 * `count` : the amount of items to transfer. Default: `1`
 * `nbt` : nbt data of the item to transfer. Default: `nullish` (ignores nbt)

#### bot.openBlock(block)

Open a block, for example a chest, returns a promise on the opening `Window`.

 * `block` is the block the bot will open

#### bot.openEntity(entity)

Open an entity with an inventory, for example a villager, returns a promise on the opening `Window`.

 * `entity` is the entity the bot will open

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

If this method changes anything, you can be notified via `bot.inventory.on("updateSlot")`.

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
