<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Содержание**  *сгенерировано с помощью [DocToc](https://github.com/thlorenz/doctoc)*

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
      - [Player Skin Data](#player-skin-data)
    - [Block](#block)
    - [Biome](#biome)
    - [Item](#item)
    - [windows.Window (base class)](#windowswindow-base-class)
      - [window.deposit(itemType, metadata, count, nbt)](#windowdeposititemtype-metadata-count-nbt)
      - [window.withdraw(itemType, metadata, count, nbt)](#windowwithdrawitemtype-metadata-count-nbt)
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
    - [mineflayer.Particle](#mineflayerparticle)
      - [Particle.id](#particleid)
      - [Particle.name](#particlename)
      - [Particle.position](#particleposition)
      - [Particle.offset](#particleoffset)
      - [Particle.longDistanceRender](#particlelongdistancerender)
      - [Particle.count](#particlecount)
      - [Particle.movementSpeed](#particlemovementspeed)
  - [Bot](#bot)
    - [mineflayer.createBot(options)](#mineflayercreatebotoptions)
    - [Properties](#properties)
      - [bot.registry](#botregistry)
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
      - [bot.game.minY](#botgameminy)
      - [bot.game.height](#botgameheight)
      - [bot.physicsEnabled](#botphysicsenabled)
      - [bot.player](#botplayer)
      - [bot.players](#botplayers)
      - [bot.tablist](#bottablist)
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
      - [bot.settings.enableTextFiltering - boolean](#botsettingsenabletextfiltering---boolean)
      - [bot.settings.enableServerListing - boolean](#botsettingsenableserverlisting---boolean)
      - [bot.experience.level](#botexperiencelevel)
      - [bot.experience.points](#botexperiencepoints)
      - [bot.experience.progress](#botexperienceprogress)
      - [bot.health](#bothealth)
      - [bot.food](#botfood)
      - [bot.foodSaturation](#botfoodsaturation)
      - [bot.oxygenLevel](#botoxygenlevel)
      - [bot.physics](#botphysics)
      - [bot.fireworkRocketDuration](#botfireworkrocketduration)
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
      - ["actionBar" (jsonMsg, verified)](#actionbar-jsonmsg-verified)
      - ["message" (jsonMsg, position, sender, verified)](#message-jsonmsg-position-sender-verified)
      - ["messagestr" (message, messagePosition, jsonMsg, sender, verified)](#messagestr-message-messageposition-jsonmsg-sender-verified)
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
      - ["entityHandSwap" (entity)](#entityhandswap-entity)
      - ["entityWake" (entity)](#entitywake-entity)
      - ["entityEat" (entity)](#entityeat-entity)
      - ["entityCriticalEffect" (entity)](#entitycriticaleffect-entity)
      - ["entityMagicCriticalEffect" (entity)](#entitymagiccriticaleffect-entity)
      - ["entityCrouch" (entity)](#entitycrouch-entity)
      - ["entityUncrouch" (entity)](#entityuncrouch-entity)
      - ["entityEquip" (entity)](#entityequip-entity)
      - ["entitySleep" (entity)](#entitysleep-entity)
      - ["entitySpawn" (entity)](#entityspawn-entity)
      - ["entityElytraFlew" (entity)](#entityelytraflew-entity)
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
      - ["blockBreakProgressObserved" (block, destroyStage, entity)](#blockbreakprogressobserved-block-destroystage-entity)
      - ["blockBreakProgressEnd" (block, entity)](#blockbreakprogressend-block-entity)
      - ["diggingCompleted" (block)](#diggingcompleted-block)
      - ["diggingAborted" (block)](#diggingaborted-block)
      - ["usedFirework"](#usedfirework)
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
      - ["particle"](#particle)
    - [Functions](#functions)
      - [bot.blockAt(point, extraInfos=true)](#botblockatpoint-extrainfostrue)
      - [bot.waitForChunksToLoad()](#botwaitforchunkstoload)
      - [bot.blockInSight(maxSteps, vectorLength)](#botblockinsightmaxsteps-vectorlength)
      - [bot.blockAtCursor(maxDistance=256)](#botblockatcursormaxdistance256)
      - [bot.entityAtCursor(maxDistance=3.5)](#botentityatcursormaxdistance35)
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
      - [bot.updateSign(block, text, back = false)](#botupdatesignblock-text)
      - [bot.equip(item, destination)](#botequipitem-destination)
      - [bot.unequip(destination)](#botunequipdestination)
      - [bot.tossStack(item)](#bottossstackitem)
      - [bot.toss(itemType, metadata, count)](#bottossitemtype-metadata-count)
      - [bot.elytraFly()](#botelytrafly)
      - [bot.dig(block, [forceLook = true], [digFace])](#botdigblock-forcelook--true-digface)
      - [bot.stopDigging()](#botstopdigging)
      - [bot.digTime(block)](#botdigtimeblock)
      - [bot.acceptResourcePack()](#botacceptresourcepack)
      - [bot.denyResourcePack()](#botdenyresourcepack)
      - [bot.placeBlock(referenceBlock, faceVector)](#botplaceblockreferenceblock-facevector)
      - [bot.placeEntity(referenceBlock, faceVector)](#botplaceentityreferenceblock-facevector)
      - [bot.activateBlock(block, direction?: Vec3, cursorPos?: Vec3)](#botactivateblockblock-direction-vec3-cursorpos-vec3)
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
      - [bot.openContainer(containerBlock or containerEntity, direction?, cursorPos?)](#botopencontainercontainerblock-or-containerentity-direction-cursorpos)
      - [bot.openChest(chestBlock or minecartchestEntity, direction?, cursorPos?)](#botopenchestchestblock-or-minecartchestentity-direction-cursorpos)
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
      - [bot.openBlock(block, direction?: Vec3, cursorPos?: Vec3)](#botopenblockblock-direction-vec3-cursorpos-vec3)
      - [bot.openEntity(entity)](#botopenentityentity)
      - [bot.moveSlotItem(sourceSlot, destSlot)](#botmoveslotitemsourceslot-destslot)
      - [bot.updateHeldItem()](#botupdatehelditem)
      - [bot.getEquipmentDestSlot(destination)](#botgetequipmentdestslotdestination)
    - [bot.creative](#botcreative)
      - [bot.creative.setInventorySlot(slot, item)](#botcreativesetinventoryslotslot-item)
      - [bot.creative.clearSlot(slot)](#botcreativeclearslotslot)
      - [bot.creative.clearInventory()](#botcreativeclearinventory)
      - [bot.creative.flyTo(destination)](#botcreativeflytodestination)
      - [bot.creative.startFlying()](#botcreativestartflying)
      - [bot.creative.stopFlying()](#botcreativestopflying)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API

## Enums

Эти данные хранятся независимо от проекта [minecraft-data](https://github.com/PrismarineJS/minecraft-data),
 и доступны через [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

### minecraft-data

Данные доступны в модуле [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

Используйте `require('minecraft-data')(bot.version)`.

### mcdata.blocks

Идентификация блоков по ID.

### mcdata.items

Идентификация предметов по ID.

### mcdata.materials

Название материала и объект, который содержит информацию об инструментах и их эффективности разрушения..

### mcdata.recipes

Идентификация крафтов по ID.

### mcdata.instruments

Идентификация инструментов по ID.

### mcdata.biomes

Идентификация биомов по ID.

### mcdata.entities

Идентификация существ по ID.

## Classes

### vec3

Смотрите [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3).

Все координаты библиотеки Mineflayer используют данный класс.

 * `x` - Юг.
 * `y` - Вверх.
 * `z` - Запад.

Функции и методы, требующие точного аргумента позиции, как правило, используют `Vec3`,
а также массив с тремя значениями и объект с `x`, `y`, `z`.

### mineflayer.Location

### Entity

Энтити (существо) - это игроки, мобы и объекты. Вы также можете получить доступ
к своему существу, используя `bot.entity`.
Смотрите [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity).

#### Player Skin Data

Данные скина хранятся в свойстве `skinData` объекта игрока, если имеются.

```js
// player.skinData
{
  url: 'http://textures.minecraft.net/texture/...',
  model: 'slim' // или 'classic'
}
```

### Block

Смотрите [prismarine-block](https://github.com/PrismarineJS/prismarine-block).

`block.blockEntity` является дополнительным полем с данными блок-существ в виде `Object`.
```js
// sign.blockEntity
{
  x: -53,
  y: 88,
  z: 66,
  id: 'minecraft:sign', // 'Sign' в 1.10
  Text1: { toString: Function }, // ChatMessage object
  Text2: { toString: Function }, // ChatMessage object
  Text3: { toString: Function }, // ChatMessage object
  Text4: { toString: Function } // ChatMessage object
}
```

### Biome

Смотрите [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome).

### Item

Смотрите [prismarine-item](https://github.com/PrismarineJS/prismarine-item).

### windows.Window (base class)

Смотрите [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows).

#### window.deposit(itemType, metadata, count, nbt)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

 * `itemType` - Числовой ID предмета.
 * `metadata` - Числовое значение мета-данных. `null` означает любой вид.
 * `count` - Сколько предметов класть. `null` будет равно `1`.
 * `nbt` - Совпадение по нбт. `null` отключает это.

#### window.withdraw(itemType, metadata, count, nbt)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении. Выдаёт ошибку, если нет места в инвентаре.

 * `itemType` - Числовой ID предмета.
 * `metadata` - Числовое значение мета-данных. `null` означает любой вид.
 * `count` - Сколько предметов брать. `null` будет равно `1`.
 * `nbt` - Совпадение по нбт. `null` отключает это.

#### window.close()

Закрывает окно.

### Recipe

Смотрите [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe).

### mineflayer.Container

Дополнение к `windows.Window` для сундуков, раздатчиков и прочих.
Смотрите `bot.openContainer(chestBlock или minecartchestEntity)`.

### mineflayer.Furnace

Дополнение к `windows.Window` для печки, плавильни и прочих.
Смотрите `bot.openFurnace(furnaceBlock)`.

#### furnace "update"

Срабатывает при обновлении `furnace.fuel` и/или `furnace.progress`.

#### furnace "updateSlot" (oldItem, newItem)

Срабатывает, когда в печи обновляется слот для плавки.

#### furnace.takeInput()

Эта функция возвращает `Promise` с `item` в качестве аргумента при завершении.


#### furnace.takeFuel()

Эта функция возвращает `Promise` с `item` в качестве аргумента при завершении.


#### furnace.takeOutput()

Эта функция возвращает `Promise` с `item` в качестве аргумента при завершении.


#### furnace.putInput(itemType, metadata, count)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

#### furnace.putFuel(itemType, metadata, count)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

#### furnace.inputItem()

Возвращает предмет, который плавится, в виде `Item`.

#### furnace.fuelItem()

Возвращает топливо в виде `Item`.

#### furnace.outputItem()

Возвращает результат плавки в виде `Item`.

#### furnace.fuel

Возвращает количество оставшегося топлива от `0` до `1`.

#### furnace.progress

Возвращает прогресс плавки предмета от `0` до `1`.

### mineflayer.EnchantmentTable

Дополнение к `windows.Window` для стола зачарований.
Смотрите `bot.openEnchantmentTable(enchantmentTableBlock)`.

#### enchantmentTable "ready"

Срабатывает, когда `enchantmentTable.enchantments` полностью заполнен, и вы
можете сделать выбор, вызвав `enchantmentTable.enchant(choice)`.

#### enchantmentTable.targetItem()

Возвращает текущий предмет в столе зачарования. Этот метод может использоваться, чтобы положить или забрать предмет.

#### enchantmentTable.xpseed

16-битный xpseed, отправленный сервером.

#### enchantmentTable.enchantments

Возвращает массив из трёх зачарований, доступных для выбора.
`level` может быть `-1`, если сервер ещё не отправил данные.

Пример:

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

Возращает `Promise` с `item` в качестве аргумента после зачарования.

 * `choice` - [0-2], индекс зачарования, которое вы выбираете.

#### enchantmentTable.takeTargetItem()

Возращает `Promise` с `item` в качестве аргумента при завершении.


#### enchantmentTable.putTargetItem(item)

Возращает `Promise` с `void` в качестве аргумента при завершении.


#### enchantmentTable.putLapis(item)

Возращает `Promise` с `void` в качестве аргумента при завершении.


### mineflayer.anvil

Дополнение к `windows.Window` для наковальни.
Смотрите `bot.openAnvil(anvilBlock)`.

#### anvil.combine(itemOne, itemTwo[, name])

Возращает `Promise` с `void` в качестве аргумента при завершении.

#### anvil.combine(item[, name])

Возращает `Promise` с `void` в качестве аргумента при завершении.


#### villager "ready"

Срабатывает, когда `villager.trades` был загружен.

#### villager.trades

Массив с вариантами торговли.

Пример:

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
Подобно [bot.trade(villagerInstance, tradeIndex, [times])](#bottradevillagerinstance-tradeindex-times)

### mineflayer.ScoreBoard

#### ScoreBoard.name

Имя скорборда.

#### ScoreBoard.title

Заголовок скорборда (может не совпадать с именем).

#### ScoreBoard.itemsMap

Объект со всеми элементами скорборда.

Пример:

```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

Массив со всеми отсортированными элементами скорборда.

Пример:

```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.Team

#### Team.name

Название команды.

#### Team.friendlyFire

Определяет, включен ли огонь по своим.

#### Team.nameTagVisibility

Может быть `always`, `hideForOtherTeams`, `hideForOwnTeam`.

#### Team.collisionRule

Может быть `always`, `pushOtherTeams`, `pushOwnTeam`.

#### Team.color

Цвет (или форматирование) названия команды, например `dark_green`, `red`, `underlined`.

#### Team.prefix

Компонент чата, содержащий префикс команды.

#### Team.suffix

Компонент чата, содержащий суффикс команды.

#### Team.members

Массив с участниками команды. Ники игроков и UUID существ.

### mineflayer.BossBar

#### BossBar.title

Название боссбара, передается в `ChatMessage`.

#### BossBar.health

Количество здоровья от `0` до `1`.

#### BossBar.dividers

Количество ячеек, может быть `0`, `6`, `10`, `12`, `20`.

#### BossBar.entityUUID

UUID существа, который определяется боссом.

#### BossBar.shouldDarkenSky

Определяет, стоит ли затемнять небо.

#### BossBar.isDragonBar

Определяет, является ли боссбар - боссбаром Дракона Края.

#### BossBar.createFog

Определяет, стоит ли создават туман.

#### BossBar.color

Определяет цвет боссбара. Может быть `pink`, `blue`, `red`, `green`, `yellow`, `purple`, `white`.

### mineflayer.Particle

#### Particle.id

Идентификатор частицы, который прописан в [протоколе](https://wiki.vg/Protocol#Particle).

#### Particle.name

Название частицы, которое прописано в [протоколе](https://wiki.vg/Protocol#Particle).

#### Particle.position

Расположение частицы в Vec3.

#### Particle.offset

Смещение частицы в Vec3.

#### Particle.longDistanceRender

Определяет, следует ли принудительно отображать частицу, несмотря на настройки частиц клиента, и увеличивает максимальную дальность прорисовки с 256 до 65536.

#### Particle.count

Количество созданных частиц.

#### Particle.movementSpeed

Скорость частиц в случайном направлении.

## Bot

### mineflayer.createBot(options)

Создаёт и возвращает экземпляр класса бота.
`options` - это объект, который содержит в себе :
 * `username` : Ник игрока, по умолчанию `"Player"`.
 * `port` : Порт сервера, по умолчанию `25565`.
 * `password` : Пароль может быть пропущен, если подключение осуществляется к пиратскому серверу.
 * `host` : Айпи сервера, по умолчанию `"localhost"`.
 * `version` : По умолчанию версия сервера определяется автоматически. Пример использования : `"1.12.2"`.
 * `auth` : Вид аутентификации, по умолчанию `"mojang"`, может быть `"microsoft"`.
 * `clientToken` : Генерируется, если задан пароль.
 * `accessToken` : Генерируется, если задан пароль.
 * `logErrors` : По умолчанию включено, используется для отлова и логирования ошибок.
 * `hideErrors` : По умолчанию включено, не логирует ошибки (даже если включен `logErrors`).
 * `keepAlive` : Отправка пакета активности, по умолчанию включено.
 * `checkTimeoutInterval` : По умолчанию `30*1000` (30 сек.), проверяет, получен ли пакет активности, иначе отключается.
 * `loadInternalPlugins` : Загрузка плагинов, по умолчанию включено.
 * `storageBuilder` : Необязательная функция, принимающая в качестве аргумента версию и название мира (`worldName`) и возвращающая экземпляр чего-либо с тем же API, что и `prismarine-provider-anvil`. Будет использовано для сохранения мира.
 * `client` : Экземпляр `node-minecraft-protocol`, если не указан, mineflayer создает свой собственный клиент. Это может быть нужно для использования mineflayer через прокси многих клиентов или ванильного клиента и mineflayer клиента.
 * `brand` : Название версии, которое будет использовать клиент. По умолчанию `vanilla`. Может использоваться для имитации пользовательских клиентов для серверов, которым это требуется.
 * `respawn` : Отвечает за автоматическое возрождение бота, по умолчанию включено.
 * `plugins` : Объект : По умолчанию `{}`
   - `pluginName` : `false` : Не загружать плагин с заданным именем `pluginName`.
   - `pluginName` : `true` : Загрузить плагин с заданным именем `pluginName`, даже если `loadInternalplugins` отключен.
   - `pluginName` : Функция ввода внешнего плагина : загружает сторонний плагин, переопределяет внутренний плагин с заданным именем `pluginName`.
 * `physicsEnabled` : По умолчанию включено. Должна ли физика влиять на бота? Можно изменить с помощью `bot.physicsEnabled`.
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * [enableTextFiltering](#bot.settings.enableTextFiltering)
 * [enableServerListing](#bot.settings.enableServerListing)
 * `chatLengthLimit` : Максимальное количество символов, отправляемое в чат. Если не установлено, будет установлено следующее: 100 в < 1.11 и 256 в >= 1.11.
 * `defaultChatPatterns`: По умолчанию включено, добавляет шаблоны, такие как общий чат и личные сообщения.

### Properties

#### bot.registry

Экземпляр `minecraft-data` используемый ботом. Передайте это конструкторам, которые ожидают `minecraft-data`, таким как `prismarine-block`.

#### bot.world

Синхронное представление мира. Смотрите [prismarine-world](http://github.com/PrismarineJS/prismarine-world).

##### world "blockUpdate" (oldBlock, newBlock)

Срабатывает при обновлении блока. `oldBlock` и `newBlock` предоставляются для сравнения.
`oldBlock` может быть `null` при обычном обновлении блока.

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Срабатывает в определенной точке. `oldBlock` и `newBlock` предоставляются для сравнения. Все слушатели получают `null` для `oldBlock` и `newBlock` и автоматически удаляются при выгрузке мира.
`oldBlock` может быть `null` при обычном обновлении блока.

#### bot.entity

Ваше собственное существо. Смотрите `Entity`.

#### bot.entities

Все близлежащие существа. Этот объект представляет собой сопоставление `entityId` с `entity`.

#### bot.username

Используйте это, чтобы узнать имя бота.

#### bot.spawnPoint

Показывает координаты спавна бота, на которые указывает компас.

#### bot.heldItem

Предмет, который держит бот. Представляет экземпляр [prismarine-item](https://github.com/PrismarineJS/prismarine-item), основанный на мета-данных, нбт-данных и т.д.

#### bot.usingHeldItem

Использует ли бот предмет, который он держит в руках, например, ест пищу или использует щит.

#### bot.game.levelType

Тип генерации.

#### bot.game.dimension

Текущее измерение бота, может быть `overworld`, `the_end` или `the_nether`.

#### bot.game.difficulty

Сложность на сервере.

#### bot.game.gameMode

Игровой режим.

#### bot.game.hardcore

Включен ли режим хардкода.

#### bot.game.maxPlayers

#### bot.game.serverBrand

Ядро сервера.

#### bot.game.minY

Минимальная высота Y в мире.

#### bot.game.height

Максимальная высота мира.

#### bot.physicsEnabled

Включает физику бота, по умолчанию `true`.

### bot.player

Объект игрока.

Пример:
```js
{
  username: 'player',
  displayName: { toString: Function }, // Объект ChatMessage.
  gamemode: 0,
  ping: 28,
  entity: entity // null, если Вы находитесь слишком далеко
}
```

Пинг игрока изначально равен `0`, нужно подождать, пока сервер отправит его пинг.

#### bot.players

Показывает всех игроков, которые находятся на сервере.

#### bot.tablist

Объект таблиста бота, содержит `header` и `footer`.

Пример:
```js
{
  header: { toString: Function }, // Объект ChatMessage.
  footer: { toString: Function } // Объект ChatMessage.
}
```

#### bot.isRaining

Определяет, идёт ли дождь.

#### bot.rainState

Число, указывающее текущий уровень дождя. Когда дождя нет, значение будет равно 0. Когда начнется дождь, значение будет постепенно увеличиваться до 1. Когда дождь прекращается, значение постепенно возвращается к 0.

Каждый раз, когда изменяется `bot.rainState`, срабатывает событие `"weatherUpdate"`.

#### bot.thunderState

Число, указывающее текущий уровень грозы. Когда грозы нет, значение будет равно 0. Когда начнется гроза, значение будет постепенно увеличиваться до 1. Когда гроза прекращается, значение постепенно возвращается к 0.

Каждый раз, когда изменяется `bot.thunderState`, срабатывает событие `"weatherUpdate"`.

Это то же самое, что и `bot.rainState`, но для грозы.
Во время грозы изменяются значения `bot.rainState` и `bot.thunderState`.

#### bot.chatPatterns

Массив шаблонов следующего формата: [/regex/, "chattype", "description"]

 * `/regex/` - Шаблон регулярного выражения, который должен иметь как минимум две группы.
 * `'chattype'` - Тип чата, который может является "chat" или "whisper".
 * `'description'` - Описание шаблона, необязательно.

#### bot.settings.chat

Выбор:

 * `enabled` - Включен (по умолчанию).
 * `commandsOnly` - Только команды.
 * `disabled` - Выключен.

#### bot.settings.colorsEnabled

По умолчанию активно, используется для отображения цветов в чате.

#### bot.settings.viewDistance

Выбор прорисовки:
 * `far` - Дальняя (по умолчанию).
 * `normal` - Нормальная.
 * `short` - Малая.
 * `tiny` - Минимальная.

#### bot.settings.difficulty

Сложность. Вернет то же, что и в `server.properties`.

#### bot.settings.skinParts

Должны ли отображаться дополнительные детали скинов игроков.

#### bot.settings.skinParts.showCape - boolean

Отображение плаща.

##### bot.settings.skinParts.showJacket - boolean

Отображение куртки.

##### bot.settings.skinParts.showLeftSleeve - boolean

Отображение левого рукава.

##### bot.settings.skinParts.showRightSleeve - boolean

Отображение правого рукава.

##### bot.settings.skinParts.showLeftPants - boolean

Отображение левой штанины.

##### bot.settings.skinParts.showRightPants - boolean

Отображение правой штанины.

##### bot.settings.skinParts.showHat - boolean

Отображение головного убора.

#### bot.settings.enableTextFiltering - boolean

Не используется. По умолчанию выключен в ванильном клиенте.

#### bot.settings.enableServerListing - boolean

Этот параметр отправляется на сервер, чтобы определить, должен ли игрок отображаться в списке серверов.

#### bot.experience.level

Уровень опыта.

#### bot.experience.points

Общее количество очков опыта.

#### bot.experience.progress

Значение от `0` до `1` - число для перехода на следующий уровень.

#### bot.health

Число от `0` до `20`. Каждое число является половиной ячейки здоровья в игре.

#### bot.food

Число от `0` до `20`. Каждое число является половиной ячейки голода в игре.

#### bot.foodSaturation

Показывает насыщенность. Голод не уменьшается, если насыщенность больше нуля. Игроки, зашедшие на сервер, автоматически получают насыщенность `5,0`. Еда увеличивает как насыщенность, так и голод.

#### bot.oxygenLevel

Число от `0` до `20`. Каждое число отображает количество значков воды, известных как уровень кислорода.

#### bot.physics

Изменение значений скорости, отдачи, скорости прыжка и т.д.
Изменяйте на свой страх и риск!

#### bot.fireworkRocketDuration

Сколько физических тиков осталось до окончания ускорения от фейерверка.

#### bot.simpleClick.leftMouse (slot)

То же, что и `bot.clickWindow(slot, 0, 0)`.

#### bot.simpleClick.rightMouse (slot)

То же, что и `bot.clickWindow(slot, 1, 0)`.

#### bot.time.doDaylightCycle

Отображает включено ли игровое правило `doDaylightCycle`.

#### bot.time.bigTime

Количество тиков с нулевого дня в мире.

Это значение имеет тип `BigInt` и является точным даже при очень больших значениях (более 2^51 - 1 тиков).

#### bot.time.time

Количество тиков с нулевого дня в мире.

Поскольку ограничение `Number` в Javascript составляет 2^51 - 1, значение `bot.time.time` становится неточным при превышении этого ограничения, рекомендуется использовать `bot.time.bigTime`.
Вероятно вам никогда не понадобится `bot.time.bigTime`, так как 2^51 - 1 тиков это примерно 14280821 настоящих лет.

#### bot.time.timeOfDay

Время суток в тиках.

Время основано на тиках, где каждую секунду происходит 20 тиков. 24000 тиков - 1 игровой день, или же 20 реальных минут.

Время суток основано на тиках. `0` - восход, `6000` - полдень, `12000` - закат, а `18000` - полночь.

#### bot.time.day

Отображает, какой день в мире.

#### bot.time.isDay

Определяет, сейчас день (`true`) или ночь (`false`).

Основано на времени между `0` и `13000` тиками (день + закат).

#### bot.time.moonPhase

Фаза луны.

Значение от `0` до `7`, где `0` - полнолуние.

#### bot.time.bigAge

Возраст мира в тиках.

Это значение имеет тип `BigInt` и является точным даже при очень больших значениях. (более 2^51 - 1 тиков)

#### bot.time.age

Возраст мира в тиках.

Поскольку ограничение `Number` в Javascript составляет 2^51 - 1, значение `bot.time.age` становится неточным при превышении этого ограничения, рекомендуется использовать `bot.time.bigAge`.
Вероятно вам никогда не понадобится `bot.time.bigAge`, так как 2^51 - 1 тиков это примерно 14280821 настоящих лет.

#### bot.quickBarSlot

Показывает, какой слот сейчас выбран (0-8).

#### bot.inventory

Экземпляр [`Window`](https://github.com/PrismarineJS/prismarine-windows#windowswindow-base-class), который представляет ваш инвентарь.

#### bot.targetDigBlock

Показывает блок, который вы сейчас копаете, или же `null`.

#### bot.isSleeping

Возвращает `true` или `false`, в зависимости от того,
лежите вы в кровати или нет.

#### bot.scoreboards

Показывает все скорборды в виде объекта: `name -> scoreboard`.

#### bot.scoreboard

Показывает все скорборды в виде объекта: `scoreboard displaySlot -> scoreboard`.

 * `belowName` - Cкорборд размещен снизу никнейма.
 * `sidebar` - Cкорборд размещен на боковой панели.
 * `list` - Cкорборд помещен в список игроков.
 * `0-18` - Cлоты, определённые в [протоколе](https://wiki.vg/Protocol#Display_Scoreboard).

#### bot.teams

Все команды (Подобно `/team list`).

#### bot.teamMap

Список участников команды. Использует никнеймы для игроков и UUID для существ.

#### bot.controlState

Объект, состоящий из основных элементов управления: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].

Установка значения для этого объекта вызовет [bot.setControlState](#botsetcontrolstatecontrol-state).

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

При получении сообщения в чате от игрока.

 * `username` - Имя отправителя (сравните с `bot.username`, если вы не хотите видеть собственные сообщения).
 * `message` - Сообщение, очищенное от всех цветовых кодов.
 * `translate` - Тип сообщения. В большинстве случаев является `null`.
 * `jsonMsg` - Сообщение в формате JSON.
 * `matches` - Массив совпадений в регулярных выражениях. Может являться `null`.

#### "whisper" (username, message, translate, jsonMsg, matches)

При получении сообщения в личных сообщениях от игрока.

 * `username` - И отправителя.
 * `message` - Сообщение, очищенное от всех цветовых кодов.
 * `translate` - Тип сообщения. В большинстве является `null`.
 * `jsonMsg` - Сообщение в формате JSON.
 * `matches` - Массив совпадений в регулярных выражениях. Может являться `null`.

#### "actionBar" (jsonMsg, verified)

При появлении сообщения от сервера над хотбаром.

 * `jsonMsg` - Сообщение в формате JSON.
 * `verified` - Если не подтверждено - `null`, если подтверждено и правильно - `true`, если подтверждено, но не правильно - `false`.

#### "message" (jsonMsg, position, sender, verified)

При появлении любого серверного сообщения, включая чаты.

 * `jsonMsg` - Объект [ChatMessage](https://github.com/PrismarineJS/prismarine-chat) содержащий форматированное сообщение. Дополнительно может обладать следующими свойствами:
   * unsigned - Неподтверждённый объект `ChatMessage`. Только для версий 1.19.2+, когда сервер разрешает "небезопасный" чат или сервер изменяет сообщения без подписи игрока.
 * `position` - (> = 1.8.1): Положение сообщения в чате может быть
   * `chat`
   * `system`
   * `game_info`
 * `sender` - UUID отправителя, если известно (1.16+), иначе `null`.
 * `verified` - Если не подтверждено - `null`, если подтверждено и правильно - `true`, если подтверждено, но не правильно - `false`.

#### "messagestr" (message, messagePosition, jsonMsg, sender, verified)

То же самое, что и `"message"`, но вызывает `.toString()` в объекте `prismarine-message`, чтобы сразу получить сообщение.

 * `sender` - UUID отправителя, если известно (1.16+), иначе `null`.
 * `verified` - Если не подтверждено - `null`, если подтверждено и правильно - `true`, если подтверждено, но не правильно - `false`.

#### "inject_allowed"

Срабатывает, когда главный файл загружен, здесь вы можете загрузить `mcData` и плагины, но лучше подождать событие `"spawn"`.

#### "login"

Срабатывает при успешном подключении к серверу.
Возможно, вам потребуется дождаться события `"spawn"`, прежде чем что-либо делать на сервере.

#### "spawn"

Срабатывает один раз после того, как вы вошли на сервер и появились в мире, а также срабатывает при респавне после смерти.

В большинстве случаев это событие, которое вы хотите прослушать, прежде чем что-либо делать на сервере.


#### "respawn"

Срабатывает при смене миров и после появления в мире.
В большинстве случаев вам нужно сначала дождаться события `"spawn"` вместо этого.

#### "game"

Срабатывает, если сервер меняет свойства в `server.properties`.

#### "resourcePack" (url, hash)

Срабатывает, когда сервер отправляет ресурспак.

#### "title" (title, type)

Срабатывает, когда сервер отправляет текст по центру экрана.

 * `title` - Текст на экране.
 * `type` - Тип текста "subtitle" или "title"

#### "rain"

Срабатывает, когда начинается или прекращается дождь. Если вы присоединитесь к
серверу, на котором уже идет дождь, это событие также сработает.

#### "weatherUpdate"

Срабатывает, когда `bot.thunderState` или `bot.rainState` изменяются.
Если вы присоединитесь к серверу, на котором уже идет дождь, это событие также сработает.

#### "time"

Срабатывает, когда сервер отправляет время. Смотрите `bot.time`.

#### "kicked" (reason, loggedIn)

Срабатывает при кике с сервера.

 * `reason` - Причина отключения.
 * `loggedIn` - `true`, если вы были кикнуты после успешного входа на сервер, или `false`, если отключение произошло во время подключения.

#### "end" (reason)

Срабатывает, когда вы отключены от сервера.

 * `reason` - причина отключения. (обычно `'socketClosed'`)

#### "error" (err)

Срабатывает, когда происходит какая-либо ошибка.

#### "spawnReset"

Срабатывает, когда вы не можете заспавниться у своей кровати, и ваша точка появления сбрасывается.

#### "death"

Срабатывает, когда вы умираете.

#### "health"

Срабатывает, когда значения здоровья или голода изменяются.

#### "breath"

Срабатывает, когда значение запаса воздуха изменяется.

#### "entityAttributes" (entity)

Срабатывает при изменении атрибутов (свойств) существа.


#### "entitySwingArm" (entity)
#### "entityHurt" (entity)
#### "entityDead" (entity)
#### "entityTaming" (entity)
#### "entityTamed" (entity)
#### "entityShakingOffWater" (entity)
#### "entityEatingGrass" (entity)
#### "entityHandSwap" (entity)
#### "entityWake" (entity)
#### "entityEat" (entity)
#### "entityCriticalEffect" (entity)
#### "entityMagicCriticalEffect" (entity)
#### "entityCrouch" (entity)
#### "entityUncrouch" (entity)
#### "entityEquip" (entity)
#### "entitySleep" (entity)
#### "entitySpawn" (entity)
#### "entityElytraFlew" (entity)

Если существо начало летать на элитрах.

#### "itemDrop" (entity)
#### "playerCollect" (collector, collected)

Если существо подняло предмет.

 * `collector` - Существо, поднявшее предмет.
 * `collected` - Существо, которое являлось поднятым предметом.

#### "entityGone" (entity)
#### "entityMoved" (entity)
#### "entityDetach" (entity, vehicle)
#### "entityAttach" (entity, vehicle)

Если существо сидит в транспортном средстве, таком как лодка или вагонетка.

 * `entity` - Существо, которое сидит в транспортном средстве.
 * `vehicle` - Существо, которое является транспортным средством.

#### "entityUpdate" (entity)
#### "entityEffect" (entity, effect)
#### "entityEffectEnd" (entity, effect)
#### "playerJoined" (player)
#### "playerUpdated" (player)
#### "playerLeft" (player)

#### "blockUpdate" (oldBlock, newBlock)

(Лучше использовать это событие от `bot.world`, чем напрямую от бота)
Срабатывает при обновлении блока. `oldBlock` и `newBlock` можно сравнить.

Стоит заметить, что `oldBlock` может быть `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(Лучше использовать это событие от `bot.world`, чем напрямую от бота)
Срабатывает при обновлении блока в определенном месте. `oldBlock` и `newBlock` можно сравнить.

Стоит заметить, что `oldBlock` может быть `null`.

#### "blockPlaced" (oldBlock, newBlock)

Срабатывает при установке блока. `oldBlock` и `newBlock` можно сравнить.

Стоит заметить, что `oldBlock` может быть `null`.

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

Срабатывает при обновлении чанка. `point` является координатами угла чанка с наименьшими значениями `x`, `y`, и `z`.

#### "soundEffectHeard" (soundName, position, volume, pitch)

Срабатывает, когда вы слышите звуковой эффект.

 * `soundName` - Имя звукового эффекта.
 * `position` - Координаты в виде `Vec3`, где был проигран звук.
 * `volume` - Уровень звука в виде `float`, `1.0` является 100%.
 * `pitch` - Искажение звука в виде `integer`, `63` является 100%.

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

Срабатывает, когда вы слышите нестандартный звуковой эффект.

 * `soundId` - ID звукового эффекта.
 * `soundCategory` - Категория звукового эффекта.
 * `position` - Координаты в виде `Vec3`, где был проигран звук.
 * `volume` - Уровень звука в виде `float`, `1.0` является 100%.
 * `pitch` - Искажение звука в виде `integer`, `63` является 100%.

#### "noteHeard" (block, instrument, pitch)

Срабатывает, когда был проигран звук нотного блока.

 * `block` - Блок, который проиграл звук.
 * `instrument`: Объект
   - `id` : ID в виде `integer`.
   - `name` : Один из видов звука.
 * `pitch` - Высота ноты (от 0 до 24 включительно, где 0 - это самая низкая, а 24 - самая высокая). Больше информации об этом можно найти на [оффициальной Minecraft википедии](http://minecraft.wiki/w/Note_Block).

#### "pistonMove" (block, isPulling, direction)

#### "chestLidMove" (block, isOpen, block2)
* `block` - Блок, который был открыт. Если это двойной сундук - то отмечается правый блок.
* `isOpen` - Число игроков, открывших сундук. 0, если он закрыт.
* `block2`: Второй блок, который является частью двойного сундук. `null`, если это не двойной сундук.

#### "blockBreakProgressObserved" (block, destroyStage, entity)

Срабатывает, когда вы наблюдаете процесс разрушения блока

 * `block` - Блок, который ломают.
 * `destroyStage` - Уровень прогресса (0-9).
 * `entity` - Существо, которое ломает блок.

#### "blockBreakProgressEnd" (block, entity)

Срабатывает, когда процесс разрушения блока прекращен.
Происходит при прекращении разрушения блока или после его полного разрушения.

 * `block` - Блок, который перестали ломать.
 * `entity` - Существо, которое перестало ломать блок.

#### "diggingCompleted" (block)

 * `block` - Блок, который был разрушен.

#### "diggingAborted" (block)

 * `block` - Блок, который не был разрушен.

#### "usedfirework"

Срабатывает при использовании фейерверка во время полёта на элитрах.

#### "move"

Срабатывает при движении бота. Если вы хотите узнать текущее положение, используйте `bot.entity.position`, если вы хотите узнать предыдущее положение, используйте `bot.entity.position.minus(bot.entity.velocity)`.

#### "forcedMove"

Срабатывает при принудительном перемещении бота сервером (телепорт, спавн и т.д.). Если вы хотите узнать текущее положение, используйте `bot.entity.position`.

#### "mount"

Срабатывает, если вы поставили существо, например вагонетку. Чтобы получить доступ к ней,
используйте `bot.vehicle`.

Чтобы сесть в неё, используйте `mount`.

#### "dismount" (vehicle)

Срабатывает, если вы слезли с существа.

#### "windowOpen" (window)

Срабатывает, если вы открываете верстак, сундук и т.д.

#### "windowClose" (window)

Срабатывает, если вы закрыли верстак, сундук и т.д.

#### "sleep"

Срабатывает, если вы легли спать.

#### "wake"

Срабатывает, если вы проснулись.

#### "experience"

Срабатывает, если значение `bot.experience.*` было обновлено.

#### "scoreboardCreated" (scoreboard)

Срабатывает, если скорборд был создан.

#### "scoreboardDeleted" (scoreboard)

Срабатывает, если скорборд был удален.

#### "scoreboardTitleChanged" (scoreboard)

Срабатывает, если название скорборда было обновлено.

#### "scoreUpdated" (scoreboard, item)

Срабатывает, если значение в скорборде было обновлено.

#### "scoreRemoved" (scoreboard, item)

Срабатывает, если значение в скорборде было удалено.

#### "scoreboardPosition" (position, scoreboard)

Срабатывает, если позиция скорборда была обновлена.

#### "teamCreated" (team)

Срабатывает, если команда была создана.

#### "teamRemoved" (team)

Срабатывает, если команда была удалена.

#### "teamUpdated" (team)

Срабатывает, если команда была обновлена.

#### "teamMemberAdded" (team)

Срабатывает, если участник(и) были добавлены в команду.

#### "teamMemberRemoved" (team)

Срабатывает, если участник(и) были удалены из команды.

#### "bossBarCreated" (bossBar)

Срабатывает, если боссбар был создан.

#### "bossBarDeleted" (bossBar)

Срабатывает, если боссбар был удален.

#### "bossBarUpdated" (bossBar)

Срабатывает, если боссбар был обновлен.

#### "heldItemChanged" (heldItem)

Срабатывает, если предмет в руке был изменён.

#### "physicsTick" ()

Срабатывает каждый тик, если `bot.physicsEnabled` включен.

#### "chat:name" (matches)

Срабатывает, если все регулярные выражения шаблона чата совпадают.

#### "particle"

Срабатывает, если появилась частица.

### Functions

#### bot.blockAt(point, extraInfos=true)

Возвращает блок в `point` или `null`, если эта точка не загружена. Если значение `extraInfos` равно `true`, возращает информацию о табличках, картинах, сундуках, шалкерах и т.д. (медленнее).
Смотрите `Block`.

#### bot.waitForChunksToLoad()

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда все чанки были загружены.

#### bot.blockInSight(maxSteps, vectorLength)

Неподдерживается, используйте `blockAtCursor`.

Возвращает блок, на который смотрит бот, либо `null`.

 * `maxSteps` - Количество блоков, по умолчанию 256.
 * `vectorLength` - Длина вектора, по умолчанию `5/16`.

#### bot.blockAtCursor(maxDistance=256)

Возвращает блок, на который смотрит бот, либо `null`.
 * `maxDistance` - Максимальное расстояние от глаз до блока, по умолчанию 256.

#### bot.entityAtCursor(maxDistance=3.5)

Возвращает существо, на которое смотрит бот, либо `null`.
 * `maxDistance` - Максимальное расстояние от глаз до существа, по умолчанию 3,5.

#### bot.blockAtEntityCursor(entity=bot.entity, maxDistance=256)

Возвращает блок, на который смотрит существо, либо `null`.
 * `entity` - Существо в виде `Object`.
 * `maxDistance` - Максимальное расстояние от глаз до блока, по умолчанию 256.

#### bot.canSeeBlock(block)

Возвращает `true` или `false`, в зависимости от того,
видит ли бот указанный блок, или нет.

#### bot.findBlocks(options)

Находит ближайшие блоки от заданной точки.

 * `options` - Параметры для поиска:
   - `point` - Начальная позиция поиска (центр). По умолчанию позиция бота.
   - `matching` - Функция, которая возращает `true`, если данный блок совпадает. Также поддерживает значение в виде ID блока или массива с ID нескольких блоков.
   - `useExtraInfo` - Для сохранения обратной совместимости может привести к двум вариантам поведения в зависимости от типа
      - **boolean** - Предсталяет функции `matching` больше информации - медленнее.
      - **function** - Создаёт двойную функцию проверки, если блок проходит через функцию `matching`, то далее проходит через `useExtraInfo` с дополнительной информацией.
   - `maxDistance` - Самое дальнее расстояние для поиска, по умолчанию 16.
   - `count` - Количество блоков, которые нужно найти. По умолчанию 1. Может вернуть меньше, если будет найдено недостаточно блоков.

Возвращает массив (может быть пустым) с координатами найденных блоков (не сами блоки). Массив отсортирован (от ближайших до дальних блоков).

#### bot.findBlock(options)

То же самое, что и `bot.blockAt(bot.findBlocks(options)[0])`. Возращает один блок, либо `null`.

#### bot.canDigBlock(block)

Возвращает, можно ли сломать блок и находится ли в пределах диапозона бота.

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

Возвращает список рецептов(`Recipe`), которые вы можете использовать для крафта
предмета(`itemType`) с мета-данными(`metadata`).

 * `itemType` - Числовой ID предмета, который вы хотите создать.
 * `metadata` - Числовое значение мета-данных создаваемого предмета, `null` соответствует любым мета-данным
 * `minResultCount` - Количество создаваемых предметов, на основе ресурсов из вашего инвентаря, `null` эквивалентно 1 предмету.
 * `craftingTable` - Верстак (или подобный блок) в виде экземпляра `Block`. Если `null`, то будут работать только те рецепты, которые можно выполнить в окне инвентаря.

#### bot.recipesAll(itemType, metadata, craftingTable)

То же, что и `bot.recipesFor`, но без проверки количества материала, требуемого для изготовления предмета.

#### bot.nearestEntity(match = (entity) => { return true })

Возвращает ближайшее к боту существо, подходящий по функции (по умолчанию находит любое существо). Возвращает `null`, если существо не найдено.

Пример:
```js
const cow = bot.nearestEntity(entity => entity.name.toLowerCase() === 'cow') // используем .toLowercase(), потому что в 1.8 "cow" пишется с большой буквы, что может вызвать несовместимость с новыми версиями
```

### Methods

#### bot.end(reason)

Закрывает соединение с сервером.
* `reason` - Необязательная строка, в которой указывается причина отключения.

#### bot.quit(reason)

Принудительно завершает соединение по собственной причине (по умолчанию `'disconnect.quitting'`).

#### bot.tabComplete(str, [assumeCommand], [sendBlockInSight])

Эта функция возвращает `Promise` с `matches` в качестве аргумента при завершении.

Запрашивает подсказки к командам/аргументам в чате от сервера.

 * `str` - Строка для завершения через подсказки.
 * `assumeCommand` - Поле отправляемое серверу, по умолчанию `false`.
 * `sendBlockInSight` - Поле отправляемое серверу, по умолчанию `true`. Установите для этого параметра значение `false`, если вы хотите повысить производительность.

#### bot.chat(message)

Отправляет сообщение в чат. При необходимости разбивает большое сообщение на несколько маленьких.

#### bot.whisper(username, message)

Аналог "/tell <никнейм>". Все разделенные сообщения будут отправлятся пользователю.

#### bot.chatAddPattern(pattern, chatType, description)

Неподдерживается, используйте `addChatPattern`.

Добавляет шаблон чата с помощью регулярных выражений. Полезно, если формат чата сильно меняется за счёт плагинов.

 * `pattern` - Регулярное выражение для совпадения с сообщением.
 * `chatType` - Вид сообщения. Является названием события, который будет срабатывать при совпадении с шаблоном. Например: "chat" или "whisper".
 * `description` - Необязательно, описание шаблона.

#### bot.addChatPattern(name, pattern, chatPatternOptions)

** то же самое, что и `bot.addChatPatternSet(name, [pattern], chatPatternOptions)`

Создаёт событие, который вызывается каждый раз, когда сообщение совпадает с шаблоном.
Событие будет называться `"chat:name"`, где название - это значение `name`

* `name` - Название, используемое для прослушивания события.
* `pattern` - Регулярное выражение для совпадения с сообщением.
* `chatPatternOptions` - Объект:
  * `repeat` - По умолчанию `true`. Нужно ли прослушивать событие после первого совпадения.
  * `parse` - Вместо самого сообщения, которое совпало с шаблоном, возвращает группы из регулярного выражения.
  * `deprecated` - (**нестабильно**) используется методом `bot.chatAddPattern` для сохранения совместимости, вероятно, будет удален.

Возвращает число, которое используется методом `bot.removeChatPattern()` лишь для того, чтобы можно было удалить этот шаблон.

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

Создаёт событие, который вызывается каждый раз, когда сообщения совпадают с шаблонами.
Событие будет называться `"chat:name"`, где название - это значение `name`.
* `name` - Название, используемое для прослушивания события.
* `patterns` - Массив с регулярными выражениями для совпадения с сообщениями.
* `chatPatternOptions` - Объект:
  * `repeat` - По умолчанию `true`. Нужно ли прослушивать событие после первого совпадения.
  * `parse` - Вместо самого сообщения, которое совпало с шаблоном, возвращает группы из регулярного выражения.

Возвращает число, которое используется методом `bot.removeChatPattern()` лишь для того, чтобы можно было удалить этот шаблон.

#### bot.removeChatPattern(name)

Удаляет шаблон(ы) чата.
* `name` - Строка или число.

Если `name` - строка, все шаблоны с этим названием будут удалены.
Если `name` - число, удаляет только определённый шаблон.

#### bot.awaitMessage(...args)

Промис, который срабатывает, когда сообщение совпадает с переданными аргументами.

Пример:

```js
async function wait () {
  await bot.awaitMessage('<flatbot> hello world') // срабатывает на "hello world" в чате от flatbot
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world']) // срабатывает на "hello" или "world" в чате от flatbot
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world'], ['<flatbot> im', '<flatbot> batman']) // срабатывает на "hello" или "world" или "im" или "batman" в чате от flatbot
  await bot.awaitMessage('<flatbot> hello', '<flatbot> world') // срабатывает на "hello" или "world" в чате от flatbot
  await bot.awaitMessage(/<flatbot> (.+)/) // срабатывает на первое сообщение подходящее по шаблону
}
```

#### bot.setSettings(options)

Устанавливает значения для `bot.settings`.

#### bot.loadPlugin(plugin)

Загружает плагин. Ничего не делает, если плагин уже был загружен.

 * `plugin` - Функция.

```js
function somePlugin (bot, options) {
  function someFunction () {
    bot.chat('Yay!')
  }
  bot.someFunction = someFunction
}

const bot = mineflayer.createBot({})
bot.loadPlugin(somePlugin)
bot.once('login', () => {
  bot.someFunction() // Yay!
})
```

#### bot.loadPlugins(plugins)

О загрузке плагинов смотрите в `bot.loadPlugin`.
 * `plugins` - Массив функций.

#### bot.hasPlugin(plugin)

Проверяет, загружен ли плагин (или планирует загружаться) для данного бота.

#### bot.sleep(bedBlock)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Отправляет бота спать. `bedBlock` должен быть экземпляром `Block`, который является кроватью.

#### bot.isABed(bedBlock)

Возвращает `true`, если `bedBlock` является кроватью.

#### bot.wake()

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Поднимает бота с кровати.

#### bot.setControlState(control, state)

Это основной способ управлять ботом. Работает как нажатия кнопок в майнкрафте.
Например, `forward` со значением `true` будет перемещать бота вперёд. `forward` со значением `false` остановит бота от движения вперёд.
Вы можете использовать `bot.lookAt` вместе с этой функцией. jumper.js показывает на примере, как это можно использовать.

 * `control` - Одно из ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].
 * `state` - `true` или `false`.

#### bot.getControlState(control)

Возращает `true`, если определённый элемент управления включен.

* `control` - Одно из ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].

#### bot.clearControlStates()

Отключает элементы управления.

#### bot.getExplosionDamages(entity, position, radius, [rawDamages])

Возвращает, какой урон будет нанесен существу в радиусе вокруг места взрыва.
Будет возвращать `null`, если у существа нет брони и `rawDamages` является `true`, потому что функция не может рассчитать урон с броней без самой брони.

* `entity` - Экземпляр существа.
* `position` - Экземпляр [Vec3](https://github.com/andrewrk/node-vec3).
* `radius` - Радиус взрыва в виде числа.
* `rawDamages` - Необязательно, если `true`, то при рассчётах не считает броню.

#### bot.lookAt(point, [force])

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда вы смотрите в указанную точку.

 * `point` - Экземпляр [Vec3](https://github.com/andrewrk/node-vec3). Поворачивает голову к указанной точке.
 * `force` - Смотрите `force` в `bot.look`.

#### bot.look(yaw, pitch, [force])

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда вы смотрите с указанным `yaw` и `pitch`.

Устанавливает направление головы.

 * `yaw` - Количество радианов по горизонтальной оси, начиная с востока по часовой стрелке.
 * `pitch` - Количество радианов для поворота вверх или вниз. `0`  - строго вперед. `pi / 2` - смотреть вверх. `-pi / 2` - смотреть вниз.
 * `force` - Если установлен `true`, плавного поворота не будет. Укажите значение `true`,
 если хотите передать серверу куда вы целитесь, например при бросании предметов или выстреле с лука. Это не требуется для вычислений на стороне клиента, таких как направление ходьбы.

#### bot.updateSign(block, text, back = false)

Изменяет текст на табличке. В Майнкрафте 1.20 и выше будет пытаться изменить текст с обратной стороны, если табличка не прикреплена к стене (Значение `back`).

#### bot.equip(item, destination)

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда вы надели предмет или когда узнаёте, что вам не удалось надеть предмет.

Надевает предмет из вашего инвентаря. Если аргумент `item` является экземпляром `Item`, то функция будет пытаться надеть указанный предмет из слота окна. Если аргумент `item` является числом, то функция будет пытаться надеть первый попавшийся предмет в инвентаре с этим ID. (Проверка хотбара идёт последней. Слоты брони, крафта, результата крафта и второй руки не проверяются).

 * `item` - Экземпляр `Item` или число с ID предмета. Смотрите `window.items()`.
 * `destination`
   - `"hand"` - (ведущая рука) `null` альтернатива к этому.
   - `"head"` - (шлем)
   - `"torso"` - (нагрудник)
   - `"legs"` - (поножи)
   - `"feet"` - (ботинки)
   - `"off-hand"` - (вторая рука) Если доступно.

#### bot.unequip(destination)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Снимает предмет.

#### bot.tossStack(item)

Эта функция возвращает `Promise` с `void` в качестве аргумента при выбрасывании.

 * `item` - Cтак предметов, которые вы хотите выбросить.

#### bot.toss(itemType, metadata, count)

Эта функция возвращает `Promise` с `void` в качестве аргумента при одном выбрасывании.

 * `itemType` - Числовой ID предмета, который вы хотите выбросить.
 * `metadata` - Мета-данные предмета. Используйте `null`, чтобы выбрать любые мета-данные.
 * `count` - Количество предметов, которые вы хотите выбросить. `null` равно `1`.

#### bot.elytraFly()

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении полёта на элитрах.
В случае сбоя выдаёт сообщение об ошибке.

#### bot.dig(block, [forceLook = true], [digFace])

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда блок был сломан или разрушение было прервано.

Начинает ломать блок предметом, который находится в руке.
Смотрите также события `"diggingCompleted"` и `"diggingAborted"`.

Обратите внимание, что вы не сможете ломать другие блоки, пока выбранный блок не будет сломан, либо не будет вызвана функция `bot.stopDigging()`.

 * `block` - Блок, который нужно сломать.
 * `forceLook` - (необязательно) если `true`, сразу смотрит на блок и начинает ломать. Если `true`, бот плавно поворачивается к блоку, который нужно сломать. Кроме того, можно присвоить значение `'ignore'`, чтобы бот вообще не двигал головой. Также можно присвоить значение `'raycast'` для поворота головы бота до места, куда бот смотрит.
 * `digFace` - (необязательно) По умолчанию `'auto'`, смотрит на центр блока и ломает верхнюю грань. Также может быть вектором vec3 для направления бота при разрушении блока. Например: ```vec3(0, 1, 0)```, когда копаешь сверху. Кроме того, может быть `'raycast'`, оно проверяет, видна ли сторона для бота и копает с этим направлением. Полезно для серверов с анти-читом.

#### bot.stopDigging()

Останавливает разрушение блока.

#### bot.digTime(block)

Покажет время, которое нужно потратить, чтобы сломать блок в миллисекундах.

#### bot.acceptResourcePack()

Подтверждает загрузку ресурс-пака.

#### bot.denyResourcePack()

Отклоняет загрузку ресурс-пака.

#### bot.placeBlock(referenceBlock, faceVector)

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда сервер подтверждает, что блок поставлен.

 * `referenceBlock` - Блок, на котором вы хотите разместить свой блок.
 * `faceVector` - Одно из шести направлений (Например: `new Vec3(0, 1, 0)` для верхней грани), указывающее, на какую грань `referenceBlock` будет установлен новый блок.

Новый блок будет размещен на `referenceBlock.position.plus(faceVector)`.

#### bot.placeEntity(referenceBlock, faceVector)

Эта функция возвращает `Promise` с `Entity` в качестве аргумента при завершении.

 * `referenceBlock` - Блок, на котором вы хотите разместить существо.
 * `faceVector` - Одно из шести направлений (Например: `new Vec3(0, 1, 0)` для верхней грани), указывающее, на какую грань `referenceBlock` будет установлено существо.

Новое существо будет размещено на `referenceBlock.position.plus(faceVector)`.

#### bot.activateBlock(block, direction?: Vec3, cursorPos?: Vec3)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Ударяет нотный блок, открывает дверь и т.д.

 * `block` - Блок для активации.
 * `direction` - (необязательно) По умолчанию `new Vec3(0, 1, 0)` (сверху). Вектор, отвечающий с какой стороны будет активироваться блок. Ничего не делает, когда целью является существо-хранилище.
 * `cursorPos` - (необязательно) По умолчанию `new Vec3(0.5, 0.5, 0.5)` (центр блока). Является точкой, куда будет смотреть бот при активации блока. Отправляется с пакетом активации блока. Ничего не делает, когда целью является существо-хранилище.

#### bot.activateEntity(entity)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Нажимает на существо, например житель, или NPC.

 * `entity` - Существо для активации.

#### bot.activateEntityAt(entity, position)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Нажимает на существо с указанной позицией, полезно при взаимодействии с стойками для брони.

 * `entity` - Существо для активации.
 * `position` - Позиция для клика.

#### bot.consume()

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении употребления.

Съедает/выпивает предмет, который находится в руке.

#### bot.fish()

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении рыбалки.

Использует удочку.

#### bot.activateItem(offHand=false)

Активирует предмет, который находится в руке. Используется для выстрела из лука, бросания яиц, использования фейерверков и т.д.

 * `offHand` - Во второй ли руке находится предмет для активации.

#### bot.deactivateItem()

Деактивирует предмет, который находится в руке. Например для прекращения натягивания тетевы лука и т.д.

#### bot.useOn(targetEntity)

Использует предмет, который находится в руке, на существе. Например, одеть седло или использовать ножницы.

#### bot.attack(entity, swing = true)

Атакует игрока или моба.

 * `entity` - Тип существа. Чтобы получить конкретное существо, используйте [bot.nearestEntity()](#botnearestentitymatch--entity---return-true-) или [bot.entities](#botentities).
 * `swing` - По умолчанию `true`. Если `false` анимация руки при ударе не будет отображаться.

#### bot.swingArm([hand], showHand)

Проигрывает анимацию руки при ударе.

 * `hand` - Может быть `left` или `right`, в зависимости от того, какую руку нужно анимировать. По умолчанию: `right`.
 * `showHand` - Нужно ли добавлять руку в пакет. По умолчанию: `true`.

#### bot.mount(entity)

Сесть в транспортное средство. Чтобы слезть, используйте `bot.dismount`.

#### bot.dismount()

Вылезти из транспортного средства.

#### bot.moveVehicle(left,forward)

Двигаться в транспортном средстве:

 * `left` - Может быть -1 или 1 : -1 означает вправо, 1 означает влево.
 * `forward` - Может быть -1 или 1 : -1 означает назад, 1 означает вперед.

Направление относительно того, куда смотрит бот.

#### bot.setQuickBarSlot(slot)

Выбирает слот в хотбаре.

 * `slot` - Слот в хотбаре (0-8).

#### bot.craft(recipe, count, craftingTable)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении крафта и обновлении инвентаря.

 * `recipe` - Рецепт крафта (экземпляр `Recipe`). Смотрите `bot.recipesFor`.
 * `count` - Количество операций для крафта. Например: Если вы хотите скрафтить 8 палок из досок, вы должны установить `count` на `2`. `null` является `1`.
 * `craftingTable` - Блок верстака (экземпляр `Block`), Вы можете использовать `null`, если рецепт можно использовать в инвентаре.

#### bot.writeBook(slot, pages)

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда написание было выполнено успешно или произошла ошибка.

 * `slot` - Слот в инвентаре (например, 36 - первый слот в хотбаре).
 * `pages` - Массив со страницами.

#### bot.openContainer(containerBlock or containerEntity, direction?, cursorPos?)

Открывает хранилище блока или существа.

 * `containerBlock` или `containerEntity` - Экземпляр блока или существа для открытия.
 * `direction` - (необязательно) По умолчанию `new Vec3(0, 1, 0)` (сверху). Вектор, отвечающий с какой стороны будет активироваться блок. Ничего не делает, когда целью является существо-хранилище.
 * `cursorPos` - (необязательно) По умолчанию `new Vec3(0.5, 0.5, 0.5)` (центр блока). Является точкой, куда будет смотреть бот при активации блока. Отправляется с пакетом активации блока. Ничего не делает, когда целью является существо-хранилище.

Вовзращает `Promise` с экземпляром `Container`, которое представляет хранилище, которое вы открываете.

#### bot.openChest(chestBlock or minecartchestEntity, direction?, cursorPos?)

Устарело. То же самое, что `openContainer`.

#### bot.openFurnace(furnaceBlock)

Возвращает `Promise` с экземпляром `Furnace`, представляющий печь, которую вы открываете.

#### bot.openDispenser(dispenserBlock)

Устарело. То же самое, что `openContainer`.

#### bot.openEnchantmentTable(enchantmentTableBlock)

Возвращает `Promise` с экземпляром `EnchantmentTable`, представляющий стол зачарований, который вы открываете.

#### bot.openAnvil(anvilBlock)

Возвращает `Promise` с экземпляром `anvil`, представляющий наковальню, которую вы открываете.

#### bot.openVillager(villagerEntity)

Возвращает `Promise` с экземпляром `Villager`, представляющий жителя, с которым вы торгуете.
Вы можете прослушивать события `ready` для этого `Villager`, чтобы знать, когда он готов торговаться.

#### bot.trade(villagerInstance, tradeIndex, [times])

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

 * `villagerInstance` - Житель, с которым вы торгуете.
 * `tradeIndex` - Номер предложения.
 * `times` - Сколько раз произвести торговлю.

#### bot.setCommandBlock(pos, command, [options])

Устанавливает настройки командного блока в позиции `pos`.
Пример аргумента `options`:

```js
{
  mode: 2,
  trackOutput: true,
  conditional: false,
  alwaysActive: true
}
```

`options.mode` может иметь 3 значения: 0 (Цепной), 1 (Цикличный), 2 (Импульсный)
Все дополнительные настройки по умолчанию `false`, кроме `mode`, который равен 2 (для повторения командного блока по умолчанию в Майнкрафте).

#### bot.supportFeature(name)

Может использоваться для проверки особой для текущей версии Майнкрафт возможности. Обычно это требуется только для обработки функций, зависящих от версии.

Список возможностей можно найти в файле [./lib/features.json](https://github.com/PrismarineJS/mineflayer/blob/master/lib/features.json).

#### bot.waitForTicks(ticks)

Это функция основана на промисе. Она ожидает определённое количество игровых тиков перед продолжением. Может быть полезно для быстрых таймеров, который требуют особых задержек, независимо от заданной физической скорости тиканья бота. Это похоже на стандартную функцию Javascript `setTimeout`, но выполняется специально по физическому таймеру бота.

### Методы инвентаря низкого уровня

Эти методы могут быть иногда полезны, но мы рекомендуем использовать методы, описанные выше.

#### bot.clickWindow(slot, mouseButton, mode)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Единственное действительное значение для `mode` - 0. Нажатие с шифтом или перемещение через мышь не реализовано.

Нажимает на текущее окно. Подробнее - https://wiki.vg/Protocol#Click_Container

Рекомендуется использовать `bot.simpleClick.*`

#### bot.putSelectedItemRange(start, end, window, slot)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Помещает предмет в слот в указаном диапазоне.

#### bot.putAway(slot)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Помещает предмет в слот инвентаря.

#### bot.closeWindow(window)

Закрывает окно.

#### bot.transfer(options)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Перемещает предмет с одного диапазона в другой. `options` это объект, содержащий :

 * `window` : (необязательно) Окно, куда требуется положить предмет.
 * `itemType` : Тип предмета.
 * `metadata` : (необязательно) Мета-данные предмета.
 * `sourceStart` и `sourceEnd` : Старый диапозон. `sourceEnd` необязателен и будет по умолчанию равен `sourceStart` + 1.
 * `destStart` и `destEnd` : Новый диапозон. `destEnd` необязателен и будет по умолчанию равен `destStart` + 1.
 * `count` : Количество предметов. По умолчанию: `1`.
 * `nbt` : Нбт-данные предмета. По умолчанию: `nullish` (игнорирует нбт).

#### bot.openBlock(block, direction?: Vec3, cursorPos?: Vec3)

Открывает блок, например сундук. Возвращает `Promise` с открытым окном (`Window`).

 * `block` - Блок, который нужно открыть боту.
 * `direction` - (необязательно) По умолчанию `new Vec3(0, 1, 0)` (сверху). Вектор, отвечающий с какой стороны будет активироваться блок. Ничего не делает, когда целью является существо-хранилище.
 * `cursorPos` - (необязательно) По умолчанию `new Vec3(0.5, 0.5, 0.5)` (центр блока). Является точкой, куда будет смотреть бот при активации блока. Отправляется с пакетом активации блока. Ничего не делает, когда целью является существо-хранилище.

#### bot.openEntity(entity)

Открывает GUI существа, например жителя. Возвращает `Promise` с открытым окном (`Window`).

 * `entity` - Существо, GUI которого нужно открыть.

#### bot.moveSlotItem(sourceSlot, destSlot)

Эта функция возвращает `Promise` с `void` в качестве аргумента при завершении.

Помещает предмет со слота `sourceSlot` в слот `destSlot` в открытом окне.

#### bot.updateHeldItem()

Обновляет `bot.heldItem`.

#### bot.getEquipmentDestSlot(destination)

Получает ID слота экипировки по названию.

Доступны:
 * head (шлем)
 * torso (нагрудник)
 * legs (поножи)
 * feet (ботинки)
 * hand (главная рука)
 * off-hand (вторая рука)

### bot.creative

Эта коллекция API полезна в творческом режиме.
Обнаружение и изменение игровых режимов здесь не реализовано, но предполагается и часто требуется, чтобы бот находился в творческом режиме для работы этих функций.

#### bot.creative.setInventorySlot(slot, item)

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда сервер выдаёт предмет в слот.

Выдёт боту указанный предмет в слоте инвентаря.

 * `slot` - Номер слота (например: 36 - первый слот в хотбаре).
 * `item` - Экземпляр [prismarine-item](https://github.com/PrismarineJS/prismarine-item), содержащий мета-данные, нбт-данные и т.д.
    Если `item` равен `null`, предмет в указанном слоте удаляется.

Если этот метод что-либо изменит, вы можете узнать об этом через `bot.inventory.on("updateSlot")`.

#### bot.creative.clearSlot(slot)

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда сервер очищает слот.

Устанавливает значение `null` для предмета в заданном слоте.

 * `slot` - Номер слота (например: 36 - первый слот в хотбаре).

#### bot.creative.clearInventory()

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда сервер очищает слоты.

#### bot.creative.flyTo(destination)

Эта функция возвращает `Promise` с `void` в качестве аргумента, когда бот достигает точки назначения.

Вызывает `startFlying()` и движется к месту назначения по прямой.
`destination` - это `Vec3`. Координаты `x` и `z` обычно заканчиваются на `.5`.
Функция не будет работать, если на пути присутствуют препятствия.
Рекомендуется отправлять на небольшие расстояния.

Этот метод не пытается найти путь до точки.
Ожидается, что реализация поиска пути будет использовать этот метод для перемещения на <2 блоков одновременно.

Чтобы остановить полет, используйте `stopFlying()`.

#### bot.creative.startFlying()

Устанавливает `bot.physics.gravity` на `0`.
Чтобы остановить полет, используйте `stopFlying()`.

Этот метод полезен, если вы хотите летать, копая землю под собой.
Нет необходимости вызывать эту функцию перед вызовом `flyTo()`.

Обратите внимание, что во время полета `bot.entity.velocity` не будет точным.

#### bot.creative.stopFlying()

Восстанавливает `bot.physics.gravity` к исходному значению.
