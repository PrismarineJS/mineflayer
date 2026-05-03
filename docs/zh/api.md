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
      - ["title_times" (fadeIn, stay, fadeOut)](#title_times-fadein-stay-fadeout)
      - ["title_clear"](#title_clear)
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
      - ["usedFirework" (fireworkEntityId)](#usedfirework-fireworkentityid)
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
      - [bot.tabComplete(str, [assumeCommand], [sendBlockInSight], [timeout])](#bottabcompletestr-assumecommand-sendblockinsight-timeout)
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
      - [bot.updateSign(block, text, back = false)](#botupdatesignblock-text-back--false)
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
      - [bot.respawn()](#botrespawn)
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

这些枚举值存储在与语言无关的 [minecraft-data](https://github.com/PrismarineJS/minecraft-data) 项目中，
并通过 [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data) 进行访问。

### minecraft-data
数据可在 [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data) 模块中获取。
`require('minecraft-data')(bot.version)` 可让您访问这些数据。

### mcdata.blocks
按 ID 索引的方块

### mcdata.items
按 ID 索引的物品

### mcdata.materials
键为材料名称。值是一个对象，其键为工具的物品 ID，值为效率乘数。

### mcdata.recipes
按 ID 索引的合成配方

### mcdata.instruments
按 ID 索引的乐器

### mcdata.biomes
按 ID 索引的群系

### mcdata.entities
按 ID 索引的实体

## Classes

### vec3
参见 [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

mineflayer 中的所有坐标点均以该类的实例形式提供。
- x - 南方
- y - 上方
- z - 西方

需要坐标点参数的函数和方法既接受 `Vec3` 实例，也接受包含 3 个数值的数组，或包含 `x`、`y`、`z` 属性的对象。

### mineflayer.Location

### Entity
实体表示玩家、怪物和对象。  
它们在许多事件中被触发，您可以使用 `bot.entity` 访问自己的实体。
参见 [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

### Player Skin Data
皮肤数据存储在玩家对象的 `skinData` 属性中（如果存在）。
```js
// player.skinData
{
  url: 'http://textures.minecraft.net/texture/...',
  model: 'slim' // 或 'classic'
}
```

### Block
参见 [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

此外，`block.blockEntity` 是一个附加字段，包含方块实体数据（类型为 `Object`）。此数据在不同版本中有所差异。
```js
// sign.blockEntity 示例（来自 1.19 版本）
{
  GlowingText: 0, // 0 表示假，1 表示真
  Color: 'black',
  Text1: '{ "text": "1" }',
  Text2: '{ "text": "2" }',
  Text3: '{ "text": "3" }',
  Text4: '{ "text": "4" }'
}
```
> 注意：如果您想获取告示牌的纯文本，可以使用 `[block.getSignText()](https://github.com/PrismarineJS/prismarine-block/blob/master/doc/API.md#sign)` 而不是不稳定的 blockEntity 数据。
```js
> block = bot.blockAt(new Vec3(0, 60, 0)) // 假设此处有一个告示牌
> block.getSignText()
[ "Front text\nHello world", "Back text\nHello world" ]
```

### Biome
参见 [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item
参见 [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)
参见 [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

### window.deposit(itemType, metadata, count, nbt)
此函数返回一个 `Promise`，完成存入操作时以 `void` 作为参数。
- `itemType` - 物品数字 ID
- `metadata` - 数值。`null` 表示匹配任意值。
- `count` - 要存入的数量。`null` 是 1 的别名。
- `nbt` - 匹配 NBT 数据。`null` 表示不匹配 NBT。

### window.withdraw(itemType, metadata, count, nbt)
此函数返回一个 `Promise`，完成取出操作时以 `void` 作为参数。如果机器人的物品栏没有空闲空间，将抛出错误。
- `itemType` - 物品数字 ID
- `metadata` - 数值。`null` 表示匹配任意值。
- `count` - 要取出的数量。`null` 是 1 的别名。
- `nbt` - 匹配 NBT 数据。`null` 表示不匹配 NBT。

### window.close()

### Recipe
参见 [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Container
为箱子、投掷器等容器扩展 windows.Window。
参见 `bot.openContainer(chestBlock or minecartchestEntity)`。

## mineflayer.Furnace
扩展 `windows.Window` 以支持熔炉、冶炼炉等容器。
参见 `bot.openFurnace(furnaceBlock)`。

### furnace "update"
当 `furnace.fuel` 和/或 `furnace.progress` 更新时触发。

### furnace.takeInput()
此函数返回一个 `Promise`，完成时以 `item` 作为参数。

### furnace.takeFuel()
此函数返回一个 `Promise`，完成时以 `item` 作为参数。

### furnace.takeOutput()
此函数返回一个 `Promise`，完成时以 `item` 作为参数。

### furnace.putInput(itemType, metadata, count)
此函数返回一个 `Promise`，完成时以 `void` 作为参数。

### furnace.putFuel(itemType, metadata, count)
此函数返回一个 `Promise`，完成时以 `void` 作为参数。

### furnace.inputItem()
返回表示输入物品的 `Item` 实例。

### furnace.fuelItem()
返回表示燃料物品的 `Item` 实例。

### furnace.outputItem()
返回表示输出物品的 `Item` 实例。

### furnace.fuel
燃料剩余量，范围在 0 到 1 之间。

### furnace.progress
输入物品的烹饪进度，范围在 0 到 1 之间。

## mineflayer.EnchantmentTable
扩展 `windows.Window` 以支持附魔台。
参见 `bot.openEnchantmentTable(enchantmentTableBlock)`。

### enchantmentTable "ready"
当 `enchantmentTable.enchantments` 完全填充时触发，此时您可以通过调用 `enchantmentTable.enchant(choice)` 进行选择。

### enchantmentTable.targetItem()
获取目标物品。这既是附魔台的输入也是输出。

### enchantmentTable.xpseed
服务器发送的 16 位经验种子值。

### enchantmentTable.enchantments
长度为 3 的数组，包含 3 个可供选择的附魔选项。
如果服务器尚未发送数据，`level` 可能为 `-1`。
示例：
```js
[
  { level: 3 },
  { level: 4 },
  { level: 9 }
]
```

### enchantmentTable.enchant(choice)
此函数返回一个 `Promise`，当物品附魔完成时以 `item` 作为参数。
- `choice` - [0-2]，您想要选择的附魔选项的索引。

### enchantmentTable.takeTargetItem()
此函数返回一个 `Promise`，完成时以 `item` 作为参数。

### enchantmentTable.putTargetItem(item)
此函数返回一个 `Promise`，完成时以 `void` 作为参数。

### enchantmentTable.putLapis(item)
此函数返回一个 `Promise`，完成时以 `void` 作为参数。

## mineflayer.anvil
扩展 `windows.Window` 以支持铁砧。
参见 `bot.openAnvil(anvilBlock)`。

### anvil.combine(itemOne, itemTwo[, name])
此函数返回一个 `Promise`，完成时以 `void` 作为参数。

### anvil.combine(item[, name])
此函数返回一个 `Promise`，完成时以 `void` 作为参数。

## villager "ready"
当 `villager.trades` 加载完成时触发。

### villager.trades
交易数组。
示例：
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
    hasSecondItem: true,
    secondaryInput: Item,
    disabled: false,
    tooluses: 0,
    maxTradeuses: 7
  }
]
```

### villager.trade(tradeIndex, [times])
与 [bot.trade(villagerInstance, tradeIndex, [times])](#bottradevillagerinstance-tradeindex-times) 相同。

## mineflayer.ScoreBoard

### ScoreBoard.name

记分牌的名称。

#### ScoreBoard.title

记分牌的标题（不一定与名称相同）。

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

是否允许友军伤害。

#### Team.nameTagVisibility

名称标签可见性，可选值：`always`, `hideForOtherTeams`, `hideForOwnTeam`

#### Team.collisionRule

碰撞规则，可选值：`always`, `pushOtherTeams`, `pushOwnTeam`

#### Team.color

队伍的颜色（或格式）名称，例如 `dark_green`、`red`、`underlined`。

#### Team.prefix

一个聊天组件，包含队伍前缀

#### Team.suffix

一个聊天组件，包含队伍后缀

#### Team.members

队伍成员数组。玩家使用用户名，其他实体使用 UUID。

### mineflayer.BossBar

#### BossBar.title

boss 栏标题,  ChatMessage 有例子

#### BossBar.health

boss 生命百分比, 从`0` 到`1`

#### BossBar.dividers

Boss 栏分隔符数量，可选值：`0`、`6`、`10`、`12`、`20`

#### BossBar.entityUUID

Boss 栏实体 UUID

#### BossBar.shouldDarkenSky

是否使天空变暗。

#### BossBar.isDragonBar

是否为末影龙 Boss 栏。

#### BossBar.createFog

是否创建雾气效果。

#### BossBar.color

Boss 栏颜色，可选值：`pink`、`blue`、`red`、`green`、`yellow`、`purple`、`white`。

### mineflayer.Particle

#### Particle.id

粒子 ID，定义于 [协议](https://zh.minecraft.wiki/w/Protocol#Particle) 中。

#### Particle.name

粒子名称，定义于 [协议](https://zh.minecraft.wiki/w/Protocol#Particle) 中。

#### Particle.position

粒子创建位置的 `Vec3` 实例。

#### Particle.offset

粒子偏移量的 `Vec3` 实例。

#### Particle.longDistanceRender

是否强制渲染粒子，忽略客户端粒子设置，并将最大可视距离从 256 增加到 65536。

#### Particle.count

创建的粒子数量。

#### Particle.movementSpeed

粒子在随机方向上的移动速度。

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
 * brand : 客户端将要使用的品牌代称。默认为 `vanilla`（原版）。可用于模拟自定义客户端，以满足那些要求特定客户端标识的服务器。
 * respawn : 当设置为false禁用bot自动重生时，默认为true，即机器人死亡会立刻自动重生。
 * plugins : object : 默认为 {}
   - `pluginName` : `false` : 不加载指定名称的内部插件（例如 `pluginName`）
   - `pluginName` : `true` : 加载指定名称的内部插件（例如 `pluginName`），即使 `loadInternalPlugins` 已设置为 `false`
   - `pluginName` : 外部插件注入函数 : 加载外部插件，并覆盖同名内部插件（例如 `pluginName`）
* `physicsEnabled` : 默认为 `true`，表示机器人是否应受物理引擎影响？该值后续可通过 `bot.physicsEnabled` 进行修改。
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * [enableTextFiltering](#bot.settings.enableTextFiltering)
 * [enableServerListing](#bot.settings.enableServerListing)
 * chatLengthLimit : 单个消息中可以发送的最大字符数. 如果没有设置， 那么游戏版本在 < 1.11 为100  在 >= 1.11 为256
 * defaultChatPatterns: 默认为true, 设置为false不添加聊天和私信等模式

### Properties

属性

#### bot.registry

bot 使用的 minecraft-data 实例。将其传递给需要 minecraft-data 实例的构造函数，例如 prismarine-block。

#### bot.world

世界的同步表示。查看文档：http://github.com/PrismarineJS/prismarine-world

##### world "blockUpdate" (oldBlock, newBlock)

当方块更新时触发。提供 `oldBlock` 和 `newBlock` 以便比较。在正常方块更新时，`oldBlock` 可能为 `null`。

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

针对特定点触发。提供 `oldBlock` 和 `newBlock` 以便比较。当世界卸载时，所有监听器会收到 `null` 的 `oldBlock` 和 `newBlock` 并自动被移除。在正常方块更新时，`oldBlock` 可能为 `null`。

#### bot.entity

Bot自己的实体. 见 `Entity`.

#### bot.entities

所有附近的实体。该对象是entityId到entity的映射。

#### bot.username

用这个找出你自己的名字。

#### bot.spawnPoint

到主出生点的坐标, 所有指南针指向的地方。

#### bot.heldItem

机器人手中的物品，表示为 [prismarine-item](https://github.com/PrismarineJS/prismarine-item) 实例，可指定任意元数据、NBT 数据等。

#### bot.usingHeldItem

机器人是否正在使用其持有的物品，例如吃食物或使用盾牌。

#### bot.game.levelType

#### bot.game.dimension

机器人当前所在的维度，例如 `overworld`（主世界）、`the_end`（末地）或 `the_nether`（下界）。

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

#### bot.game.serverBrand

#### bot.game.minY

世界的最小 Y 坐标。

#### bot.game.height

世界高度。

#### bot.physicsEnabled

启用物理，默认为true。

#### bot.player

机器人的玩家对象
```js
{
  username: 'player',
  displayName: { toString: Function }, // ChatMessage object.
  gamemode: 0,
  ping: 28,
  entity: entity // null if you are too far away
}
```

一个玩家的ping值从0开始,您可能需要等待服务器发送实际的ping

#### bot.players

用户名到游戏玩家的映射表。是一个对象，包含所有在线玩家能获取的数据内容。

#### bot.tablist

机器人的 Tab 列表对象包含两个键：`header`（页眉）和 `footer`（页脚）。

```js
{
  header: { toString: Function }, // ChatMessage object.
  footer: { toString: Function } // ChatMessage object.
}
```

#### bot.isRaining

#### bot.rainState

指示当前降雨量的数字。不下雨的时候，这个将等于0。 当开始下雨时，该值将增加逐渐上升到1。当雨停时，该值逐渐减小回0。

每当 `bot.rainState` 发生变化时，就会触发 "weatherUpdate" 事件。

#### bot.thunderState

表示当前雷雨强度的数值。当没有雷雨时，该值为 0。当雷雨开始时，该值会逐渐增加到 1。当雷雨停止时，该值会逐渐减小回 0。

每次 `bot.thunderState` 发生变化时，都会触发 `"weatherUpdate"` 事件。

这与 `bot.rainState` 类似，但针对的是雷雨。在雷雨天气中，`bot.rainState` 和 `bot.thunderState` 都会发生变化。

#### bot.chatPatterns

这是一个模式对象数组，格式如下：
`{ /regex/, "chattype", "description" }`
* `/regex/` - 正则表达式模式，应至少包含两个捕获组
* `'chattype'` - 模式匹配的聊天类型，例如 `"chat"` 或 `"whisper"`，也可以是其他任意值。
* `'description'` - 对该模式用途的描述，可选。

#### bot.settings.chat

聊天选项是否开启:

 * `enabled` (默认)
 * `commandsOnly`
 * `disabled`

#### bot.settings.colorsEnabled

默认为true，无论您是否从服务器接收聊天中的颜色代码。

#### bot.settings.viewDistance

视距，可以是下面列出的字符串或正数。
选项:
 * `far` (default)
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

与 server.properties 相同。

#### bot.settings.skinParts

这些布尔值设置控制玩家皮肤上的额外皮肤细节是否可见

##### bot.settings.skinParts.showCape - boolean

如果您有披风，可以将其设置为false来关闭它

##### bot.settings.skinParts.showJacket - boolean

##### bot.settings.skinParts.showLeftSleeve - boolean

##### bot.settings.skinParts.showRightSleeve - boolean

##### bot.settings.skinParts.showLeftPants - boolean

##### bot.settings.skinParts.showRightPants - boolean

##### bot.settings.skinParts.showHat - boolean

#### bot.settings.enableTextFiltering - boolean
未使用，在Notchian （Vanilla）客户端中默认为false。
#### bot.settings.enableServerListing - boolean
这个设置被发送到服务器，以确定玩家是否应该出现在服务器列表中
#### bot.experience.level

#### bot.experience.points

总经验点数

#### bot.experience.progress

升级进度条，在0和1之间-达到下一级别的数量。

#### bot.health

机器人血量，[0,20]范围内的数字，表示半心的数量。

#### bot.food

饥饿条 [0, 20] 范围内的数字，表示半个鸡腿的数量。

#### bot.foodSaturation

食物饱和相当于食物“过度充电”。当饱和度超过零时，食物的价值不会降低。登录的玩家会自动获得5.0的饱和度。吃东西会增加饱和度，也会增加食物条。

#### bot.oxygenLevel

在[0,20]范围内的数字表示水泡图标的数量，即氧气条。

#### bot.physics

编辑这些数字以调整重力，跳跃速度，终端速度等。
这样做的风险由你自己承担。

#### bot.fireworkRocketDuration

还剩多少物理刻度值的烟火火箭助推。

#### bot.simpleClick.leftMouse (slot)

从 `bot.clickWindow(slot, 0, 0)` 的抽象

#### bot.simpleClick.rightMouse (slot)

从 `bot.clickWindow(slot, 1, 0)` 的抽象

#### bot.time.doDaylightCycle

不管游戏规则 doDaylightCycle 日夜交替是true真还是false假。

#### bot.time.bigTime

从第0天开始的ticks总数。

此值为BigInt类型，即使在非常大的值下也准确。（大于2^51 - 1个ticks）

#### bot.time.time

从第0天开始的ticks总数。

由于Javascript的Number限制是 2^51 - 1 ，因此 bot.time.time 超过此限制会变得不准确，建议使用 bot.time.bigTime 。
实际上，你可能永远不需要使用bot.time.bigTime，因为在现实约 14280821 年之后，它才会自然地达到第 2^51 - 1 个ticks。

#### bot.time.timeOfDay

一天中的时间，以tick为单位。

时间是以ticks为基础的，每秒有20个ticks。每天有24000ticks，我的世界每天都是20分钟。

一天中的时间基于时间戳对24000取模。0是日出，6000是中午，12000是日落，18000是午夜。

#### bot.time.day

世界中的一天

#### bot.time.isDay

不管现在是白天还是黑夜。

基于一天的当前时间是否在0到13000个刻度之间（日+日落）。

#### bot.time.moonPhase

月相。

0-7，其中0代表满月。

#### bot.time.bigAge

世界的年龄，以tick为单位

此值为BigInt类型，即使在非常大的值下也准确。（大于2^51 - 1个ticks）

#### bot.time.age

世界的年龄，以tick为单位

由于Javascript的Number限制是 2^51 - 1 ，因此 bot.time.age 超过此限制会变得不准确，建议使用 bot.time.bigAge 。
实际上，你可能永远不需要使用bot.time.bigAge，因为在现实约 14280821 年之后，它才会自然地达到第 2^51 - 1 个ticks。

#### bot.quickBarSlot

选择了哪个物品栏位 (0 - 8)

#### bot.inventory

一个 [`Window`](https://github.com/PrismarineJS/prismarine-windows#windowswindow-base-class) 实例，代表你的物品栏。

#### bot.targetDigBlock

你当前正在挖掘的 `block`（方块），如果没有则为 `null`。

#### bot.isSleeping

布尔值，表示你是否正躺在床上。

#### bot.scoreboards

机器人已知的所有记分板，以对象形式存储，键为记分板名称，值为记分板对象。

#### bot.scoreboard

机器人已知的所有记分板，以对象形式存储，键为显示位置（displaySlot），值为记分板对象。

 * `belowName` - 显示在玩家列表下方的记分板
 * `sidebar` - 显示在侧边栏的记分板
 * `list` - 显示在玩家列表中的记分板
 * `0-18` - [protocol](https://zh.minecraft.wiki/w/Protocol#Display_Scoreboard) 中定义的插槽

#### bot.teams

机器人已知的所有队伍。

#### bot.teamMap

成员到队伍的映射。玩家使用用户名，实体使用uuid。

#### bot.controlState

一个对象，其键为主要控制状态：`['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']`。

设置此对象的值会在内部调用 [bot.setControlState](#botsetcontrolstatecontrol-state)。

### Events（事件）

#### "chat" (username, message, translate, jsonMsg, matches)

仅在玩家公开聊天时触发。如果服务器有插件修改，则包括游戏提示的所有聊天都会从此经过，没有私聊。

 * `username` - 发送消息的玩家（可与 `bot.username` 比较以忽略自己的聊天消息）
 * `message` - 去除了所有颜色和控制字符的消息内容
 * `translate` - 聊天消息类型。对于大多数 Bukkit 聊天消息为 null
 * `jsonMsg` - 来自服务器的未修改 JSON 消息
 * `matches` - 正则表达式返回的匹配数组。可能为 null

#### "whisper" (username, message, translate, jsonMsg, matches)

仅当玩家私下向您发送消息时触发

 * `username` - 发送消息的玩家
 * `message` - 去除了所有颜色和控制字符的消息内容
 * `translate` - 聊天消息类型。对于大多数 Bukkit 聊天消息为 null
 * `jsonMsg` - 来自服务器的未修改 JSON 消息
 * `matches` - 正则表达式返回的匹配数组。可能为 null

#### "actionBar" (jsonMsg, verified)

每当服务器发送显示在动作栏（Action Bar）上的消息时触发。

 * `jsonMsg` - 来自服务器的未修改 JSON 消息
 * `verified` - 如果未签名则为 null；如果已签名且正确则为 true；如果已签名但不正确则为 false

#### "message" (jsonMsg, position, sender, verified)

每当服务器发送任何消息（包括聊天消息）时触发。

 * `jsonMsg` - [ChatMessage](https://github.com/PrismarineJS/prismarine-chat) 对象，包含格式化的聊天消息。可能还具有以下属性：
   * unsigned - 未签名的 ChatMessage 对象。仅存在于 1.19.2+ 版本中，且仅当服务器允许不安全聊天并且服务器在未经用户签名的情况下修改了聊天消息时存在

 * `position` - (>= 1.8.1): 聊天消息的位置，可以是：
   * chat（聊天）
   * system（系统）
   * game_info（游戏信息）

 * `sender` - 如果已知则为发送者的 UUID (1.16+)，否则为 null

 * `verified` - 如果未签名则为 null；如果已签名且正确则为 true；如果已签名但不正确则为 false

#### "messagestr" (message, messagePosition, jsonMsg, sender, verified)

`message` 事件的别名，但它在发出前会对 prismarine-message 对象调用 `.toString()` 以获取消息字符串。

 * `sender` - 如果已知则为发送者的 UUID (1.16+)，否则为 null

 * `verified` - 如果未签名则为 null；如果已签名且正确则为 true；如果已签名但不正确则为 false

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

当服务器发送标题时触发（即平时游戏跳脸的全屏大字）

 * `title` - 标题文本
 * `type` - 标题类型 "subtitle" 或 "title"

#### "title_times" (fadeIn, stay, fadeOut)

当服务器发送标题时间数据包（即设置或更新标题的淡入、停留和淡出时间）时触发。

 * `fadeIn` - 淡入时间，单位为 tick（数值）
 * `stay` - 停留时间，单位为 tick（数值）
 * `fadeOut` - 淡出时间，单位为 tick（数值）

示例：

```js
bot.on('title_times', (fadeIn, stay, fadeOut) => {
  console.log(`标题时间: 淡入=${fadeIn}, 停留=${stay}, 淡出=${fadeOut}`)
})
```

#### "title_clear"

当服务器清除所有标题时触发。

#### "rain"

开始或停止下雨时触发. 如果你加入已在下雨的服务器上，将触发此事件。

#### "weatherUpdate"

当 `bot.thunderState` 或 `bot.rainState` 发生改变时触发。
如果您加入的服务器已经在下雨，则此事件将触发。

#### "time"

当服务器发送时间更新时触发. 见 `bot.time`

#### "kicked" (reason, loggedIn)

当bot从服务器被踢出时触发

`reason` 是一条解释你被踢的原因的聊天信息。
`loggedIn` 如果客户端在成功登录后被踢，则为true；如果踢在登录阶段发生，则为false。

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
#### "entityHandSwap" (entity)
摆臂

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
#### "entityElytraFlew" (entity)

一个实体开始鞘翅飞行。

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

玩家加入游戏后触发（比spawn早发生，任何添加player都会触发，包括初次登录和后续有人进来）

#### "playerUpdated" (player)
#### "playerLeft" (player)

玩家离开游戏触发

#### "blockUpdate" (oldBlock, newBlock)

（建议从 `bot.world` 而不是直接从 `bot` 使用此事件）当方块更新时触发。提供 `oldBlock` 和 `newBlock` 以便比较。

注意：`oldBlock` 可能为 `null`

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

（建议从 `bot.world` 而不是直接从 `bot` 使用此事件）针对特定点触发。提供 `oldBlock` 和 `newBlock` 以便比较。

注意：`oldBlock` 可能为 `null`

#### "blockPlaced" (oldBlock, newBlock)

当机器人放置方块时触发。提供 `oldBlock` 和 `newBlock` 以便比较。

注意：`oldBlock` 可能为 `null`

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

当区块加载或卸载时触发。`point` 是区块中具有最小 x、y 和 z 值的角落坐标。

#### "soundEffectHeard" (soundName, position, volume, pitch)

当客户端听到命名的音效时触发

 * `soundName`: 音效名称
 * `position`: `Vec3` 实例，声音发出的位置
 * `volume`: 浮点数音量，1.0 表示 100%
 * `pitch`: 整数音高，63 表示 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

当客户端听到硬编码的音效时触发

 * `soundId`: 音效 ID
 * `soundCategory`: 音效类别
 * `position`: `Vec3` 实例，声音发出的位置
 * `volume`: 浮点数音量，1.0 表示 100%
 * `pitch`: 整数音高，63 表示 100%

#### "noteHeard" (block, instrument, pitch)

当音符盒在某处响起时触发

 * `block`: `Block` 实例，发出声音的方块
 * `instrument`:
   - `id`: 整数 ID
   - `name`: [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`] 之一
 * `pitch`: 音符的音高（介于 0-24 之间，其中 0 最低，24 最高）。有关音高值如何对应现实生活中的音符的更多信息，请参阅 [官方 Minecraft Wiki](http://zh.minecraft.wiki/w/Note_Block)。

#### "pistonMove" (block, isPulling, direction)

活塞运动

#### "chestLidMove" (block, isOpen, block2)

* `block`: `Block` 实例，盖子打开的方块。如果是双箱，则为右侧的方块
* `isOpen`: 打开箱子的玩家数量。如果关闭则为 0
* `block2`: `Block` 实例，盖子打开的方块的另一半。如果不是双箱则为 null

#### "blockBreakProgressObserved" (block, destroyStage, entity)

当客户端观察到方块正在被破坏时触发。

 * `block`: `Block` 实例，正在被破坏的方块
 * `destroyStage`: 对应破坏进度的整数 (0-9)
 * `entity`: 正在破坏该方块的实体。

#### "blockBreakProgressEnd" (block, entity)

当客户端观察到方块停止被破坏时触发。
无论过程是完成还是中止，都会发生这种情况。

 * `block`: `Block` 实例，不再被破坏的方块
 * `entity`: 已停止破坏该方块的实体

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

当机器人被服务器强制移动时触发（传送，出生，…）。如果需要当前位置，使用
`bot.entity.position`.

#### "mount"

乘骑实体（如矿车）时触发

要访问实体，请使用 `bot.vehicle`.

要乘骑实体, 请使用 `mount`.

#### "dismount" (vehicle)

实体从坐骑上下马时触发（vehicle交通工具）

#### "windowOpen" (window)

当你开始使用工作台、箱子、酿造台等时触发。

#### "windowClose" (window)

当您可能不再使用工作台、箱子等时触发。

#### "sleep"

睡觉时触发

#### "wake"

当你醒来的时候触发

#### "experience"

当 `bot.experience.*` 经验点数变化时触发

#### "scoreboardCreated" (scoreboard)

记分板被添加时触发

#### "scoreboardDeleted" (scoreboard)

记分板被删除时触发

#### "scoreboardTitleChanged" (scoreboard)

当记分板标题更新时触发

#### "scoreUpdated" (scoreboard, item)

当计分板中某个项目的分数被更新时触发。

#### "scoreRemoved" (scoreboard, item)

当计分板中某项的分数被删除时触发。

#### "scoreboardPosition" (position, scoreboard)

当计分板的位置更新时触发。

#### "teamCreated" (team)

添加队伍时触发

#### "teamRemoved" (team)

队伍被移除触发

#### "teamUpdated" (team)

更新队伍触发

#### "teamMemberAdded" (team)

当队伍成员或多个成员被添加到团队中时触发

#### "teamMemberRemoved" (team)

当队伍成员或多个成员从队伍中移除时触发。

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

当聊天模式的所有正则表达式都匹配时触发。参见 `bot.addChatPattern`

### Functions

#### bot.blockAt(point, extraInfos=true)
返回 `point` 处的方块，如果该点未加载则返回 `null`。如果 `extraInfos` 设置为 true，还会返回有关告示牌、画和方块实体的信息（速度较慢）。
参见 `Block`。

#### bot.waitForChunksToLoad()
此函数返回一个 `Promise`，当许多区块加载完成时以 `void` 作为参数。

#### bot.blockInSight(maxSteps, vectorLength)
已弃用，请改用 `blockAtCursor`。
返回机器人视线中的方块，如果没有则返回 `null`。
- `maxSteps` - 射线追踪的步数，默认为 256。
- `vectorLength` - 射线追踪向量的长度，默认为 `5/16`。

#### bot.blockAtCursor(maxDistance=256)
返回机器人视线中的方块，如果没有则返回 `null`。
- `maxDistance` - 方块距离眼睛的最大距离，默认为 256。

#### bot.entityAtCursor(maxDistance=3.5)
返回机器人视线中的实体，如果没有则返回 `null`。
- `maxDistance` - 实体距离眼睛的最大距离，默认为 3.5。

#### bot.blockAtEntityCursor(entity=bot.entity, maxDistance=256)
返回特定实体视线中的方块，如果没有则返回 `null`。
- `entity` - 实体数据对象
- `maxDistance` - 方块距离眼睛的最大距离，默认为 256。

#### bot.canSeeBlock(block)
根据机器人是否能看到指定的 `block` 返回 true 或 false。

#### bot.findBlocks(options)
从给定点查找最近的方块。
 * `options` - 搜索选项：
  - `point` - 搜索的起始位置（中心）。默认为机器人位置。
  - `matching` - 如果给定方块匹配则返回 true 的函数。也支持该值为方块 ID 或方块 ID 数组。
  - `useExtraInfo` - 为了保持向后兼容性，根据类型可能导致两种行为：
    - **boolean** - 为 `matching` 函数提供更多数据 - 明显更慢的方法
    - **function** - 创建两阶段匹配，如果方块通过 `matching` 函数，则会连同附加信息一起传递给 `useExtraInfo`
  - `maxDistance` - 搜索的最远距离，默认为 16。
  - `count` - 在返回搜索结果前要找到的方块数量。默认为 1。如果探索整个区域后没有找到足够的方块，可能会返回更少。
  返回一个（可能为空）包含找到的方块坐标（不是方块本身）的数组。数组已排序（最近的在前）。

#### bot.findBlock(options)
`bot.blockAt(bot.findBlocks(options)[0])` 的别名。返回单个方块或 `null`。

#### bot.canDigBlock(block)
返回 `block` 是否可挖掘且在范围内。

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)
返回可用于制作带有 `metadata` 的 `itemType` 的 `Recipe` 实例列表。
- `itemType` - 你要制作的物品的数字 ID
- `metadata` - 你要制作的物品的数字元数据值。`null` 匹配任何元数据。
- `minResultCount` - 基于你当前的物品栏，返回列表中的任何配方都能制作出这么多物品。`null` 是 `1` 的别名。
- `craftingTable` - `Block` 实例。如果为 `null`，则列表中仅包含可以在物品栏窗口中执行的配方。

#### bot.recipesAll(itemType, metadata, craftingTable)
与 `bot.recipesFor` 相同，但不检查机器人是否有足够的材料来制作配方。

#### bot.nearestEntity(match = (entity) => { return true })
返回距离机器人最近的实体，匹配该函数（默认为所有实体）。如果没有找到实体则返回 null。
示例：
```js
const cow = bot.nearestEntity(entity => entity.name.toLowerCase() === 'cow') // 我们使用 .toLowerCase() 因为在 1.8 版本中 cow 是大写的，对于新版本可以省略
```

### Methods
方法

#### bot.end(reason)

终止与服务器的连接。
* `reason` - 可选字符串，说明终止连接的原因。

#### bot.quit(reason)

以给定的原因优雅地断开与服务器的连接（默认为 'disconnect.quitting'）。

#### bot.tabComplete(str, [assumeCommand], [sendBlockInSight], [timeout])

此函数返回一个 `Promise`，完成时以 `matches` 作为参数。

向服务器请求聊天补全。
 * `str` - 要补全的字符串。
 * `assumeCommand` - 发送给服务器的字段，默认为 false。
 * `sendBlockInSight` - 发送给服务器的字段，默认为 true。如果希望提高性能，请将此选项设置为 false。
 * `timeout` - 超时时间（毫秒），超过该时间后函数将返回空数组，默认为 5000。

#### bot.chat(message)

发送公开广播的聊天消息。如有必要，会将长消息拆分为多条聊天消息。

#### bot.whisper(username, message)

"/tell <username>" 的快捷方式。所有拆分后的消息都将私聊发送给指定用户。

#### bot.chatAddPattern(pattern, chatType, description)

已弃用，请使用 `addChatPattern` 代替。

为机器人的聊天匹配添加正则表达式模式。对于聊天格式变化频繁的 Bukkit 服务器非常有用。
 * `pattern` - 用于匹配聊天的正则表达式
 * `chatType` - 当模式匹配时机器人触发的事件。例如："chat" 或 "whisper"
 * 'description' - 可选，描述该模式的用途

#### bot.addChatPattern(name, pattern, chatPatternOptions)

** 这是 `bot.addChatPatternSet(name, [pattern], chatPatternOptions)` 的别名

创建一个事件，每当模式与消息匹配时调用该事件，
事件名称将为 `"chat:name"`，其中 name 是传入的名称
* `name` - 用于监听事件的名称
* `pattern` - 用于匹配接收消息的正则表达式
* `chatPatternOptions` - 对象
  * `repeat` - 默认为 true，是否在第一次匹配后继续监听此事件
  * `parse` - 不返回实际匹配的消息，而是返回正则表达式的捕获组
  * `deprecated` - (**不稳定**) 由 bot.chatAddPattern 使用以保持兼容性，可能会被移除

返回一个数字，可与 bot.removeChatPattern() 一起使用以仅删除此模式

- :eyes: 参见 [examples/chat_parsing](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js#L17-L36)

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

创建一个事件，每当所有模式都与消息匹配时调用该事件，
事件名称将为 `"chat:name"`，其中 name 是传入的名称
* `name` - 用于监听事件的名称
* `patterns` - 用于匹配接收消息的正则表达式数组
* `chatPatternOptions` - 对象
  * `repeat` - 默认为 true，是否在第一次匹配后继续监听此事件
  * `parse` - 不返回实际匹配的消息，而是返回正则表达式的捕获组

返回一个数字，可与 bot.removeChatPattern() 一起使用以仅删除此模式集

- :eyes: 参见 [examples/chat_parsing](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js#L17-L36)

#### bot.removeChatPattern(name)

移除聊天模式
* `name` : 字符串或数字

如果 name 是字符串，所有具有该名称的模式都将被移除
否则如果 name 是数字，仅移除该确切模式

#### bot.awaitMessage(...args)

当作为参数传入的任一消息被解析时，Promise 即被解决

示例：

```js
async function wait () {
  await bot.awaitMessage('<flatbot> hello world') // 当 flatbot 在聊天中发送 "hello world" 时解决
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world']) // 当 flatbot 在聊天中发送 "hello" 或 "world" 时解决
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world'], ['<flatbot> im', '<flatbot> batman']) // 当 flatbot 在聊天中发送 "hello"、"world"、"im" 或 "batman" 时解决
  await bot.awaitMessage('<flatbot> hello', '<flatbot> world') // 当 flatbot 在聊天中发送 "hello" 或 "world" 时解决
  await bot.awaitMessage(/<flatbot> (.+)/) // 当第一条匹配正则表达式的消息出现时解决
}
```

#### bot.setSettings(options)

参见 `bot.settings` 属性。

#### bot.loadPlugin(plugin)

注入插件。如果插件已加载，则不执行任何操作。

 * `plugin` - 函数

```js
function somePlugin (bot, options) {
  function someFunction () {
    bot.chat('Yay!')
  }

  bot.myPlugin = {} // 良好的实践：为插件 API 设置命名空间
  bot.myPlugin.someFunction = someFunction
}

const bot = mineflayer.createBot({})
bot.loadPlugin(somePlugin)
bot.once('login', function () {
  bot.myPlugin.someFunction() // Yay!
})
```

#### bot.loadPlugins(plugins)

注入插件，参见 `bot.loadPlugin`。
 * `plugins` - 函数数组

#### bot.hasPlugin(plugin)

检查给定的插件是否已加载（或计划加载）到此机器人上。

#### bot.sleep(bedBlock)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

在床上睡觉。`bedBlock` 应该是一个代表床的 `Block` 实例。

#### bot.isABed(bedBlock)

如果 `bedBlock` 是床，则返回 true。

#### bot.wake()

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

起床。

#### bot.setControlState(control, state)

这是控制机器人移动的主要方法。它的工作方式类似于在 Minecraft 中按键。
例如，将 forward 状态设置为 true 会使机器人向前移动。将 forward 状态设置为 false 会使机器人停止向前移动。
你可以结合使用 `bot.lookAt` 来控制移动。`jumper.js` 示例展示了如何使用此功能。

 * `control` - ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'] 之一
 * `state` - `true` 或 `false`

#### bot.getControlState(control)

如果控制状态已切换，则返回 true。

* `control` - ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'] 之一

#### bot.clearControlStates()

将所有控制状态设置为关闭。

#### bot.getExplosionDamages(entity, position, radius, [rawDamages])

返回在爆炸位置周围半径内对实体造成的伤害量。
如果实体没有盔甲且 `rawDamages` 未设置为 true，它将返回 `null`，因为如果没有盔甲数据，该函数无法计算带盔甲的伤害。

* `entity` - Entity 实例
* `position` - [Vec3](https://github.com/andrewrk/node-vec3) 实例
* `radius` - 爆炸半径，数值类型
* `rawDamages` - 可选，如果为 true，则在计算中忽略盔甲

#### bot.lookAt(point, [force])

此函数返回一个 `Promise`，当你看向 `point` 时以 `void` 作为参数。

 * `point` [Vec3](https://github.com/andrewrk/node-vec3) 实例 - 倾斜你的头部使其直接面向此点。
 * `force` - 参见 `bot.look` 中的 `force`

#### bot.look(yaw, pitch, [force])

此函数返回一个 `Promise`，当你看向 `yaw` 和 `pitch` 方向时以 `void` 作为参数。

设置你头部的朝向。

 * `yaw` - 绕垂直轴旋转的弧度数，从正东方向开始。逆时针方向。
 * `pitch` - 向上或向下指向的弧度数。0 表示正前方。pi / 2 表示正上方。-pi / 2 表示正下方。
 * `force` - 如果存在且为 true，则跳过平滑的服务器端过渡。
   如果你需要服务器确切知道你在看哪里（例如丢弃物品或射箭），请将其指定为 true。这对于客户端计算（如行走方向）是不需要的。

#### bot.updateSign(block, text, back = false)

更改告示牌上的文本。在 Minecraft 1.20 及更高版本中，如果 `back` 为真值，将尝试设置告示牌背面的文本（仅在不依附于墙壁时可见）。

#### bot.equip(item, destination)

此函数返回一个 `Promise`，当你成功装备物品或得知装备失败时以 `void` 作为参数。

从你的物品栏中装备物品。如果参数 `item` 是 `Item` 实例，equip 将从其窗口槽位装备该特定物品。如果参数 `item` 是 `number` 类型，equip 将装备找到的第一个具有该 ID 的物品，按槽位 ID 升序搜索（快捷栏最后搜索。排除盔甲、合成、合成结果和副手槽位）。

 * `item` - `Item` 实例或物品 ID 的 `number`。参见 `window.items()`。
 * `destination`
   - `"hand"` - `null` 是此值的别名
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
   - `"off-hand"` - 副手，在高版本可用时

#### bot.unequip(destination)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

移除一件装备。

#### bot.tossStack(item)

此函数返回一个 `Promise`，当丢弃完成时以 `void` 作为参数。

 * `item` - 你希望丢弃的物品堆

#### bot.toss(itemType, metadata, count)

此函数返回一个 `Promise`，当丢弃完成时以 `void` 作为参数。

 * `itemType` - 你希望丢弃的物品数字 ID
 * `metadata` - 你希望丢弃的物品元数据。使用 `null` 匹配任何元数据
 * `count` - 你希望丢弃的数量。`null` 是 `1` 的别名。

#### bot.elytraFly()

此函数返回一个 `Promise`，当激活鞘翅飞行完成时以 `void` 作为参数。如果失败，将抛出错误。

#### bot.dig(block, [forceLook = true], [digFace])

此函数返回一个 `Promise`，当方块被破坏或你被中断时以 `void` 作为参数。

开始用当前装备的物品挖掘 `block`。
另见 "diggingCompleted" 和 "diggingAborted" 事件。

注意，一旦你开始挖掘一个方块，在方块被破坏或你调用 `bot.stopDigging()` 之前，你不能挖掘任何其他方块。

 * `block` - 开始挖掘的方块
 * `forceLook` - (可选) 如果为 true，看向方块并立即开始挖掘。如果为 false，机器人将缓慢转向方块进行挖掘。此外，这可以赋值为 'ignore' 以防止机器人完全移动头部。也可以赋值为 'raycast' 从机器人头部向机器人观看的位置进行射线检测。
 * `digFace` - (可选) 默认为 'auto'，看向方块中心并挖掘顶面。也可以是一个 vec3 向量，表示机器人在挖掘方块时应看向的面。例如：挖掘顶部时为 ```vec3(0, 1, 0)```。也可以是 'raycast'，射线检测检查机器人是否可见某个面并挖掘该面。对于有反作弊的服务器很有用。

如果你在第一次挖掘完成之前调用两次 bot.dig，你将得到一个致命的 'diggingAborted' 错误。

#### bot.stopDigging()

#### bot.digTime(block)

告诉你挖指定方块需要多长时间，以毫秒为单位。

#### bot.acceptResourcePack()

接受资源包。

#### bot.denyResourcePack()

拒绝资源包。

#### bot.placeBlock(referenceBlock, faceVector)

此函数返回一个 `Promise`，当服务器确认方块已成功放置时以 `void` 作为参数。

 * `referenceBlock` - 你想要在其旁边放置新方块的参考方块
 * `faceVector` - 六个基本方向之一，例如顶面为 `new Vec3(0, 1, 0)`，
   指示要将新方块放置在 `referenceBlock` 的哪个面上。

新方块将被放置在 `referenceBlock.position.plus(faceVector)` 的位置。

#### bot.placeEntity(referenceBlock, faceVector)

此函数返回一个 `Promise`，完成时以 `Entity` 作为参数。

 * `referenceBlock` - 你想要在其旁边放置实体的参考方块
 * `faceVector` - 六个基本方向之一，例如顶面为 `new Vec3(0, 1, 0)`，
   指示要将实体放置在 `referenceBlock` 的哪个面上。

新实体将被放置在 `referenceBlock.position.plus(faceVector)` 的位置。

#### bot.activateBlock(block, direction?: Vec3, cursorPos?: Vec3)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

敲击音符盒、打开门等。

 * `block` - 要激活的方块
 * `direction` 可选，默认为 `new Vec3(0, 1, 0)`（向上）。一个表示与容器方块交互方向的向量。如果目标是容器实体，则无效。
 * `cursorPos` 可选，默认为 `new Vec3(0.5, 0.5, 0.5)`（方块中心）。打开方块实例时的光标位置。这会随激活方块数据包一起发送。如果目标是容器实体，则无效。

#### bot.activateEntity(entity)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

激活一个实体，例如对村民使用。

 * `entity` - 要激活的实体

#### bot.activateEntityAt(entity, position)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

在给定位置激活一个实体，例如对盔甲架使用。

 * `entity` - 要激活的实体
 * `position` - 点击的世界坐标位置

#### bot.consume()

此函数返回一个 `Promise`，当消耗结束时以 `void` 作为参数。

食用/饮用当前手持物品

#### bot.fish()

此函数返回一个 `Promise`，当钓鱼结束时以 `void` 作为参数。

使用钓鱼竿

#### bot.activateItem(offHand=false)

激活当前手持物品。这是你进食、射箭、扔鸡蛋、激活烟花火箭等方式。

可选参数：主手为 `false`，副手为 `true`。

#### bot.deactivateItem()

停用当前手持物品。这是你释放箭矢、停止进食等方式。

#### bot.useOn(targetEntity)

在 `Entity` 实例上使用当前手持物品。这是你安装鞍和使用剪刀的方式。

#### bot.attack(entity, swing = true)

攻击玩家或生物。

 * `entity` 是实体类型。要获取特定实体，请使用 [bot.nearestEntity()](#botnearestentitymatch--entity---return-true-) 或 [bot.entities](#botentities)。
 * `swing` 默认为 `true`。如果为 false，机器人在攻击时不会挥动手臂。

#### bot.swingArm([hand], showHand)

播放手臂挥舞动画。

 * `hand` 可以是 `left` 或 `right`，表示要动画化的手臂。默认：`right`
 * `showHand` 是一个布尔值，表示是否将手部信息添加到数据包中，默认：`true`

#### bot.mount(entity)

骑乘坐具。要下来，请使用 `bot.dismount`。

#### bot.dismount()

从你所在的载具上下来。

#### bot.moveVehicle(left,forward)

移动载具：

 * left 可以是 -1 或 1：-1 表示向右，1 表示向左
 * forward 可以是 -1 或 1：-1 表示向后，1 表示向前

所有方向均相对于机器人观看的方向

#### bot.setQuickBarSlot(slot)

 * `slot` - 0-8，要选择的快捷栏槽位。

#### bot.craft(recipe, count, craftingTable)

此函数返回一个 `Promise`，当合成完成且你的物品栏更新时以 `void` 作为参数。

 * `recipe` - 一个 `Recipe` 实例。参见 `bot.recipesFor`。
 * `count` - 你希望执行操作的次数。
   如果你想将木板合成为 `8` 根木棍，你应该将 `count` 设置为 `2`。`null` 是 `1` 的别名。
 * `craftingTable` - 一个 `Block` 实例，你希望使用的工作台。
   如果配方不需要工作台，你可以对此参数使用 `null`。

#### bot.writeBook(slot, pages)

写书的函数。此函数返回一个 `Promise`，当写入成功或发生错误时以 `void` 作为参数。

 * `slot` 位于物品栏窗口坐标中（其中 36 是第一个快捷栏槽位，依此类推）。
 * `pages` 是一个字符串数组，代表书页内容。

#### bot.openContainer(containerBlock or containerEntity, direction?, cursorPos?)
打开方块容器或实体。

 * `containerBlock` 或 `containerEntity` 要打开的方块实例或要打开的实体。
 * `direction` 可选，默认为 `new Vec3(0, 1, 0)`（向上）。一个表示与容器方块交互方向的向量。如果目标是容器实体，则无效。
 * `cursorPos` 可选，默认为 `new Vec3(0.5, 0.5, 0.5)`（方块中心）。打开方块实例时的光标位置。这会随激活方块数据包一起发送。如果目标是容器实体，则无效。

返回一个代表你正在打开的容器的 `Container` 实例的 Promise。

#### bot.openChest(chestBlock or minecartchestEntity, direction?, cursorPos?)

已弃用。与 `openContainer` 相同

#### bot.openFurnace(furnaceBlock)

返回一个代表你正在打开的熔炉的 `Furnace` 实例的 Promise。

#### bot.openDispenser(dispenserBlock)

已弃用。与 `openContainer` 相同

#### bot.openEnchantmentTable(enchantmentTableBlock)

返回一个代表你正在打开的附魔台的 `EnchantmentTable` 实例的 Promise。

#### bot.openAnvil(anvilBlock)

返回一个代表你正在打开的铁砧的 `anvil` 实例的 Promise。

#### bot.openVillager(villagerEntity)

返回一个代表你正在打开的交易窗口的 `Villager` 实例的 Promise。
你可以监听此 `Villager` 上的 `ready` 事件以知道何时准备就绪

#### bot.trade(villagerInstance, tradeIndex, [times])

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

使用打开的 `villagerInstance` 进行交易。请先获取该村民提供的全部交易列表，再根据索引交易。

#### bot.setCommandBlock(pos, command, [options])

设置 `pos` 处命令方块的属性。
`options` 参数示例：
```js
{
  mode: 2,
  trackOutput: true,
  conditional: false,
  alwaysActive: true
}
```
options.mode 可以有 3 个值：0 (SEQUENCE/连锁), 1 (AUTO/自动), 2 (REDSTONE/红石)
除了 mode 默认为 2（以模仿 Minecraft 中的默认命令方块）外，所有选项属性默认均为 false。
conditional 是否处于条件制约模式

#### bot.supportFeature(name)

这可用于检查当前 Minecraft 版本中是否可用特定功能。这通常仅在处理特定于版本的功能时需要。
可用功能列表可以在 [./lib/features.json](https://github.com/PrismarineJS/mineflayer/blob/master/lib/features.json) 文件中找到。

#### bot.waitForTicks(ticks)

这是一个基于 Promise 的函数，它在继续之前等待给定数量的游戏刻（ticks）过去。这对于需要特定定时的快速计时器很有用，无论机器人的物理刻速度如何。这类似于标准的 Javascript setTimeout 函数，但专门在机器人的物理计时器上运行。

#### bot.respawn()

当 `respawn` 选项关闭时（createBot时默认自动重生），你可以手动调用此方法来重生。

### Lower level inventory methods
低级库存方法

这些是库存的底层方法，有时可能有用，但若可行，建议优先使用上述库存方法。

#### bot.clickWindow(slot, mouseButton, mode)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

模式支持：
  - 稳定：
    - 鼠标点击 (0)

  - 实验性：
    - Shift 点击 (1)
    - 数字键点击 (2)
    - 中键点击 (3)
    - 丢弃点击 (4)

  - 未实现：
    - 拖拽点击 (5)
    - 双击 (6)

点击当前窗口。详见 https://minecraft.wiki/w/Protocol#Click_Container

建议优先使用 `bot.simpleClick.*`

#### bot.putSelectedItemRange(start, end, window, slot)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

将物品放入指定范围内的 `slot`。

#### bot.putAway(slot)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

将 `slot` 处的物品放入物品栏。

#### bot.closeWindow(window)

关闭 `window`。

#### bot.transfer(options)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

将某种物品从一个范围转移到另一个范围。`options` 是一个包含以下内容的对象：

 * `window` : 可选。物品将被移动到的窗口
 * `itemType` : 被移动物品的类型
 * `metadata` : 可选。被移动物品的元数据
 * `sourceStart` 和 `sourceEnd` : 源范围。`sourceEnd` 是可选的，默认为 `sourceStart` + 1
 * `destStart` 和 `destEnd` : 目标范围。`destEnd` 是可选的，默认为 `destStart` + 1
 * `count` : 要转移的物品数量。默认：`1`
 * `nbt` : 要转移物品的 NBT 数据。默认：`nullish`（忽略 NBT）

#### bot.openBlock(block, direction?: Vec3, cursorPos?: Vec3)

打开一个方块，例如箱子，返回一个代表打开的 `Window` 的 Promise。

 * `block` 是机器人将打开的方块。
 * `direction` 可选，默认为 `new Vec3(0, 1, 0)`（向上）。一个表示与容器方块交互方向的向量。如果目标是容器实体，则无效。
 * `cursorPos` 可选，默认为 `new Vec3(0.5, 0.5, 0.5)`（方块中心）。打开方块实例时的光标位置。这会随激活方块数据包一起发送。如果目标是容器实体，则无效。

#### bot.openEntity(entity)

打开一个带有物品栏的实体，例如村民，返回一个代表打开的 `Window` 的 Promise。

 * `entity` 是机器人将打开的实体

#### bot.moveSlotItem(sourceSlot, destSlot)

此函数返回一个 `Promise`，完成时以 `void` 作为参数。

在当前窗口中将物品从 `sourceSlot` 移动到 `destSlot`。

#### bot.updateHeldItem()

更新 `bot.heldItem`。

#### bot.getEquipmentDestSlot(destination)

获取给定装备目标名称的物品栏装备槽位 ID。

可用目标包括：
* head（头部）
* torso（躯干）
* legs（腿部）
* feet（脚部）
* hand（手）
* off-hand（副手）

### bot.creative

这组 API 在创造模式下非常有用。
此处未实现检测和更改游戏模式的功能，
但假设并通常要求机器人在创造模式下才能使这些功能正常工作。

#### bot.creative.setInventorySlot(slot, item)

此函数返回一个 `Promise`，当服务器设置槽位时以 `void` 作为参数。

在指定的物品栏槽位中给机器人指定物品。

 * `slot` 位于物品栏窗口坐标中（其中 36 是第一个快捷栏槽位，依此类推）。
 * `item` 是一个 [prismarine-item](https://github.com/PrismarineJS/prismarine-item) 实例，可指定任意元数据、NBT 数据等。
    如果 `item` 为 `null`，则删除指定槽位中的物品。

如果此方法更改了任何内容，你可以通过 `bot.inventory.on("updateSlot")` 收到通知。

#### bot.creative.clearSlot(slot)

此函数返回一个 `Promise`，当服务器清除槽位时以 `void` 作为参数。

将给定槽位中的物品设置为 null。

 * `slot` 位于物品栏窗口坐标中（其中 36 是第一个快捷栏槽位，依此类推）。

#### bot.creative.clearInventory()

此函数返回一个 `Promise`，当服务器清除槽位时以 `void` 作为参数。

#### bot.creative.flyTo(destination)

此函数返回一个 `Promise`，当机器人到达目的地时以 `void` 作为参数。

调用 `startFlying()` 并以恒定速度沿直线穿过 3D 空间到达目的地。
`destination` 是一个 `Vec3`，通常 `x` 和 `z` 坐标会以 `.5` 结尾。
如果路径上有障碍物，此操作将不起作用，
因此建议每次飞行很短的距离。

此方法不尝试任何路径寻找。
预计路径寻找实现将使用此方法每次移动小于 2 个方块。

要恢复正常物理效果，请调用 `stopFlying()`。

#### bot.creative.startFlying()

将 `bot.physics.gravity` 设置为 `0`。
要恢复正常物理效果，请调用 `stopFlying()`。

如果你想在挖掘下方地面时悬停，此方法非常有用。
在调用 `flyTo()` 之前不必调用此函数。

注意，在飞行时， `bot.entity.velocity` 速度将不准确。

#### bot.creative.stopFlying()

将 `bot.physics.gravity` 恢复为其原始值。