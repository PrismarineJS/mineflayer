<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Mục lục**  *được tạo bằng [DocToc](https://github.com/thlorenz/doctoc)*

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
      - [bot.abilities](#botabilities)
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
      - [bot.settings.particleStatus - string](#botsettingsparticlestatus---string)
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
      - ["abilities" (abilities)](#abilities-abilities)
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
      - ["blockEntityData" (block)](#blockentitydata-block)
      - ["signOpen" (block)](#signopen-block)
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
      - [bot.dig(block, [forceLook], [digFace])](#botdigblock-forcelook-digface)
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

Các enum này được lưu trong dự án [minecraft-data](https://github.com/PrismarineJS/minecraft-data) (độc lập với ngôn ngữ),
 và được truy cập thông qua [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

### minecraft-data
Dữ liệu có sẵn trong module [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)

`require('minecraft-data')(bot.version)` cho phép bạn truy cập vào nó.

### mcdata.blocks
các khối, đánh chỉ mục theo id

### mcdata.items
các vật phẩm, đánh chỉ mục theo id

### mcdata.materials

Khóa là vật liệu. Giá trị là một đối tượng có khóa là id vật phẩm
của công cụ và giá trị là hệ số hiệu quả.

### mcdata.recipes
các công thức chế tạo, đánh chỉ mục theo id

### mcdata.instruments
các nhạc cụ, đánh chỉ mục theo id

### mcdata.biomes
các quần xã sinh vật, đánh chỉ mục theo id

### mcdata.entities
các thực thể, đánh chỉ mục theo id

## Classes

### vec3

Xem [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

Mọi điểm (tọa độ) trong mineflayer đều được cung cấp dưới dạng instance của lớp này.

 * x - hướng nam
 * y - hướng lên
 * z - hướng tây

Các hàm và phương thức yêu cầu đối số là một điểm đều chấp nhận instance `Vec3`,
một mảng gồm 3 giá trị, hoặc một đối tượng có các thuộc tính `x`, `y` và `z`.

### mineflayer.Location

### Entity

Thực thể (entity) đại diện cho người chơi, mob và các vật thể. Chúng được phát ra
trong nhiều sự kiện, và bạn có thể truy cập thực thể của chính bot qua `bot.entity`.
Xem [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

#### Player Skin Data

Dữ liệu skin được lưu trong thuộc tính `skinData` của đối tượng người chơi, nếu có.

```js
// player.skinData
{
  url: 'http://textures.minecraft.net/texture/...',
  model: 'slim', // or 'classic'
  capeUrl: 'http://textures.minecraft.net/texture/...' // only if the player has a cape
}
```

### Block

Xem [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

Ngoài ra `block.blockEntity` là một trường bổ sung chứa dữ liệu block entity dưới dạng `Object`. Dữ liệu trong đó khác nhau giữa các phiên bản.
```js
// sign.blockEntity example from 1.19
{
  GlowingText: 0, // 0 for false, 1 for true
  Color: 'black',
  Text1: '{"text":"1"}',
  Text2: '{"text":"2"}',
  Text3: '{"text":"3"}',
  Text4: '{"text":"4"}'
}
```

Lưu ý: nếu muốn lấy văn bản thuần của một tấm biển (sign), bạn có thể dùng [`block.getSignText()`](https://github.com/PrismarineJS/prismarine-block/blob/master/doc/API.md#sign) thay cho dữ liệu blockEntity không ổn định.
```java
> block = bot.blockAt(new Vec3(0, 60, 0)) // assuming a sign is here
> block.getSignText()
[ "Front text\nHello world", "Back text\nHello world" ]
```

### Biome

Xem [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

Xem [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

Xem [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

#### window.deposit(itemType, metadata, count, nbt)

Hàm này trả về một `Promise`, với đối số `void` khi đã cất đồ xong.

 * `itemType` - id vật phẩm dạng số
 * `metadata` - giá trị số. `null` nghĩa là khớp với mọi giá trị.
 * `count` - số lượng cần cất. `null` tương đương với 1.
 * `nbt` - khớp dữ liệu nbt. `null` nghĩa là không so khớp nbt.

#### window.withdraw(itemType, metadata, count, nbt)

Hàm này trả về một `Promise`, với đối số `void` khi đã lấy đồ ra xong. Ném ra lỗi nếu túi đồ của bot không còn chỗ trống.

 * `itemType` - id vật phẩm dạng số
 * `metadata` - giá trị số. `null` nghĩa là khớp với mọi giá trị.
 * `count` - số lượng cần lấy. `null` tương đương với 1.
 * `nbt` - khớp dữ liệu nbt. `null` nghĩa là không so khớp nbt.

#### window.close()

Đóng `window`; trả về `Promise` từ [bot.closeWindow(window)](#botclosewindowwindow).

### Recipe

Xem [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Container

Mở rộng windows.Window cho rương, máy phân phát, v.v...
Xem `bot.openContainer(chestBlock or minecartchestEntity)`.

### mineflayer.Furnace

Mở rộng windows.Window cho lò nung, lò luyện (smelter), v.v...
Xem `bot.openFurnace(furnaceBlock)`.

#### furnace "update"

Được kích hoạt khi `furnace.fuel` và/hoặc `furnace.progress` cập nhật.

#### furnace.takeInput()

Hàm này trả về một `Promise`, với đối số `item` khi hoàn tất.


#### furnace.takeFuel()

Hàm này trả về một `Promise`, với đối số `item` khi hoàn tất.


#### furnace.takeOutput()

Hàm này trả về một `Promise`, với đối số `item` khi hoàn tất.


#### furnace.putInput(itemType, metadata, count)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

#### furnace.putFuel(itemType, metadata, count)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

#### furnace.inputItem()

Trả về instance `Item` là nguyên liệu đầu vào.

#### furnace.fuelItem()

Trả về instance `Item` là nhiên liệu.

#### furnace.outputItem()

Trả về instance `Item` là sản phẩm đầu ra.

#### furnace.fuel

Lượng nhiên liệu còn lại, từ 0 đến 1.

#### furnace.progress

Mức độ nung chín của nguyên liệu đầu vào, từ 0 đến 1.

### mineflayer.EnchantmentTable

Mở rộng windows.Window cho bàn phù phép
Xem `bot.openEnchantmentTable(enchantmentTableBlock)`.

#### enchantmentTable "ready"

Được kích hoạt khi `enchantmentTable.enchantments` đã có đầy đủ dữ liệu và bạn
có thể chọn bằng cách gọi `enchantmentTable.enchant(choice)`.

#### enchantmentTable.targetItem()

Lấy vật phẩm mục tiêu. Đây vừa là đầu vào vừa là đầu ra của
bàn phù phép.

#### enchantmentTable.xpseed

xpseed 16 bit do server gửi.

#### enchantmentTable.enchantments

Mảng có độ dài 3, là 3 phù phép để lựa chọn.
`level` có thể là `-1` nếu server chưa gửi dữ liệu.

Trông như sau:

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

Hàm này trả về một `Promise`, với đối số `item` khi vật phẩm đã được phù phép.

 * `choice` - [0-2], chỉ số của phù phép bạn muốn chọn.

#### enchantmentTable.takeTargetItem()

Hàm này trả về một `Promise`, với đối số `item` khi hoàn tất.


#### enchantmentTable.putTargetItem(item)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.


#### enchantmentTable.putLapis(item)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.


### mineflayer.anvil

Mở rộng windows.Window cho đe
Xem `bot.openAnvil(anvilBlock)`.

#### anvil.combine(itemOne, itemTwo[, name])

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.


#### anvil.combine(item[, name])

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.


#### villager "ready"

Được kích hoạt khi `villager.trades` đã được tải.

#### villager.trades

Mảng các giao dịch.

Trông như sau:

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
Giống với [bot.trade(villagerInstance, tradeIndex, [times])](#bottradevillagerinstance-tradeindex-times)
### mineflayer.ScoreBoard

#### ScoreBoard.name

Tên của bảng điểm (scoreboard).

#### ScoreBoard.title

Tiêu đề của bảng điểm (không phải lúc nào cũng giống tên), dưới dạng `ChatMessage`.

#### ScoreBoard.itemsMap

Một đối tượng chứa tất cả các mục trong bảng điểm
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

Mỗi mục còn có một `displayName` (một `ChatMessage`): là component mà server gửi kèm điểm số
trên 1.20.3+, nếu không thì là tên của mục được định dạng theo đội (team) của nó.

#### ScoreBoard.items

Một mảng chứa tất cả các mục đã được sắp xếp trong bảng điểm
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.Team

#### Team.name

Tên của đội

#### Team.friendlyFire

#### Team.nameTagVisibility

Một trong các giá trị `always`, `hideForOtherTeams`, `hideForOwnTeam`

#### Team.collisionRule

Một trong các giá trị `always`, `pushOtherTeams`, `pushOwnTeam`

#### Team.color

Tên màu (hoặc định dạng) của đội, ví dụ `dark_green`, `red`, `underlined`

#### Team.prefix

Một chat component chứa tiền tố của đội

#### Team.suffix

Một chat component chứa hậu tố của đội

#### Team.members

Mảng các thành viên trong đội. Là username với người chơi và UUID với các thực thể khác.

### mineflayer.BossBar

#### BossBar.title

Tiêu đề của thanh máu boss, là instance của ChatMessage

#### BossBar.health

Phần trăm máu của boss, từ `0` đến `1`

#### BossBar.dividers

Số vạch chia của thanh máu boss, một trong các giá trị `0`, `6`, `10`, `12`, `20`

#### BossBar.entityUUID

uuid của thực thể sở hữu thanh máu boss

#### BossBar.shouldDarkenSky

Xác định có làm tối bầu trời hay không

#### BossBar.isDragonBar

Xác định thanh máu boss có phải là thanh máu của rồng hay không

#### BossBar.createFog

Xác định thanh máu boss có tạo sương mù hay không

#### BossBar.color

Xác định màu của thanh máu boss, một trong các giá trị `pink`, `blue`, `red`, `green`, `yellow`, `purple`, `white`

### mineflayer.Particle

#### Particle.id

ID của hạt (particle), như được định nghĩa trong [giao thức](https://minecraft.wiki/w/Protocol#Particle)

#### Particle.name

Tên của hạt, như được định nghĩa trong [giao thức](https://minecraft.wiki/w/Protocol#Particle)

#### Particle.position

Instance Vec3 chỉ vị trí hạt được tạo ra

#### Particle.offset

Instance Vec3 chỉ độ lệch (offset) của hạt

#### Particle.longDistanceRender

Xác định có ép hiển thị hạt bất kể cài đặt hạt của client hay không, đồng thời tăng khoảng cách nhìn tối đa từ 256 lên 65536

#### Particle.count

Số lượng hạt được tạo ra

#### Particle.movementSpeed

Tốc độ của hạt theo một hướng ngẫu nhiên

## Bot

### mineflayer.createBot(options)

Tạo và trả về một instance của lớp bot.
`options` là một đối tượng chứa các thuộc tính không bắt buộc sau:
 * username : mặc định là 'Player'
 * port : mặc định là 25565
 * password : có thể bỏ qua (nếu token cũng bị bỏ qua thì bot sẽ thử kết nối ở chế độ offline)
 * host : mặc định là localhost
 * version : mặc định sẽ tự động đoán phiên bản của server. Ví dụ giá trị: "1.12.2"
 * auth : mặc định là 'mojang', cũng có thể là 'microsoft'
 * clientToken : được tạo ra nếu có cung cấp password
 * accessToken : được tạo ra nếu có cung cấp password
 * logErrors : mặc định là true, bắt lỗi và ghi log chúng
 * hideErrors : mặc định là true, không ghi log lỗi (kể cả khi logErrors là true)
 * keepAlive : gửi gói tin keep alive : mặc định là true
 * checkTimeoutInterval : mặc định là `30*1000` (30 giây), kiểm tra xem có nhận được keepalive trong khoảng thời gian đó không, nếu không thì ngắt kết nối.
 * loadInternalPlugins : mặc định là true
 * storageBuilder : một hàm không bắt buộc, nhận đối số là version và worldName, trả về một instance có API giống prismarine-provider-anvil. Sẽ được dùng để lưu thế giới.
 * client : một instance của node-minecraft-protocol, nếu không chỉ định, mineflayer sẽ tự tạo client riêng. Có thể dùng để sử dụng mineflayer thông qua một proxy gồm nhiều client, hoặc một client vanilla cùng một client mineflayer.
 * brand : tên thương hiệu (brand) mà client sử dụng. Mặc định là vanilla. Có thể dùng để giả lập client tùy biến cho các server yêu cầu điều đó.
 * respawn : khi đặt là false sẽ tắt việc bot tự động hồi sinh, mặc định là true.
 * plugins : object : mặc định là {}
   - pluginName : false : không nạp plugin nội bộ có tên đã cho, tức `pluginName`
   - pluginName : true : nạp plugin nội bộ có tên đã cho, tức `pluginName`, kể cả khi loadInternalplugins được đặt là false
   - pluginName : hàm inject của plugin bên ngoài : nạp plugin bên ngoài, ghi đè plugin nội bộ có tên đã cho, tức `pluginName`
 * physicsEnabled : mặc định là true, bot có chịu tác động của vật lý hay không? Có thể thay đổi sau qua bot.physicsEnabled
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * [enableTextFiltering](#bot.settings.enableTextFiltering)
 * [enableServerListing](#bot.settings.enableServerListing)
 * [particleStatus](#bot.settings.particleStatus)
 * chatLengthLimit : số ký tự tối đa có thể gửi trong một tin nhắn. Nếu không đặt, giá trị sẽ là 100 với phiên bản < 1.11 và 256 với phiên bản >= 1.11.
 * defaultChatPatterns: mặc định là true, đặt là false để không thêm các pattern như chat và whisper

### Properties

#### bot.registry

Instance minecraft-data được bot sử dụng. Truyền nó cho các constructor cần một instance của minecraft-data, chẳng hạn prismarine-block.

#### bot.world

Một biểu diễn đồng bộ của thế giới. Xem tài liệu tại http://github.com/PrismarineJS/prismarine-world

##### world "blockUpdate" (oldBlock, newBlock)

Được kích hoạt khi một khối được cập nhật. Cả `oldBlock` và `newBlock` đều được cung cấp để
so sánh.
`oldBlock` có thể là `null` với các cập nhật khối thông thường.

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Được kích hoạt cho một điểm cụ thể. Cả `oldBlock` và `newBlock` đều được cung cấp để
so sánh. Mọi listener sẽ nhận null cho `oldBlock` và `newBlock` và tự động bị gỡ bỏ khi thế giới bị dỡ (unload).
`oldBlock` có thể là `null` với các cập nhật khối thông thường.


#### bot.entity

Thực thể của chính bot. Xem `Entity`.

#### bot.entities

Tất cả các thực thể ở gần. Đối tượng này là một map từ entityId tới thực thể.

#### bot.username

Dùng thuộc tính này để biết tên của chính bot.

#### bot.spawnPoint

Tọa độ của điểm hồi sinh chính, nơi mọi la bàn đều chỉ về.

#### bot.heldItem

Vật phẩm trên tay bot, được biểu diễn dưới dạng instance [prismarine-item](https://github.com/PrismarineJS/prismarine-item) với metadata, nbtdata tùy ý, v.v.

#### bot.usingHeldItem

Bot có đang sử dụng vật phẩm đang cầm hay không, ví dụ đang ăn hoặc đang dùng khiên.

#### bot.game.levelType

#### bot.game.dimension

Chiều không gian (dimension) hiện tại của bot, chẳng hạn `overworld`, `the_end` hoặc `the_nether`.

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

#### bot.game.serverBrand

#### bot.game.minY

y nhỏ nhất của thế giới

#### bot.game.height

chiều cao của thế giới

#### bot.abilities

Những gì server cho phép người chơi trong gói tin abilities gần nhất.

```js
{
  invulnerable: false,
  // the server has the player in flight; physics stops applying gravity
  flying: false,
  // the player is allowed to start flying
  mayFly: false,
  instantBuild: false,
  flyingSpeed: 0.05,
  walkingSpeed: 0.1
}
```

#### bot.physicsEnabled

Bật vật lý, mặc định là true. Khi giá trị này là false, gói tin nhắc vị trí vẫn được gửi đi mỗi giây và mang theo `bot.entity.onGround` như lúc nó được để lại: việc dịch chuyển tức thời (teleport) không làm thay đổi nó, và không có gì mô phỏng nó.

#### bot.player

Đối tượng người chơi của bot
```js
{
  username: 'player',
  displayName: { toString: Function }, // ChatMessage object.
  gamemode: 0,
  ping: 28,
  entity: entity // null if you are too far away
}
```

Ping của người chơi bắt đầu từ 0, bạn có thể phải đợi một lúc để server gửi ping thực tế.

#### bot.players

Map từ username tới những người đang chơi.

#### bot.tablist

Đối tượng tablist của bot có hai khóa, `header` và `footer`.

```js
{
  header: { toString: Function }, // ChatMessage object.
  footer: { toString: Function } // ChatMessage object.
}
```

#### bot.isRaining

#### bot.rainState

Một số cho biết mức độ mưa hiện tại. Khi trời không mưa, giá trị này
bằng 0. Khi trời bắt đầu mưa, giá trị này sẽ tăng dần
lên tới 1. Khi tạnh mưa, giá trị này giảm dần về 0.

Mỗi khi `bot.rainState` thay đổi, sự kiện "weatherUpdate" sẽ được phát ra.

#### bot.thunderState

Một số cho biết mức độ sấm sét hiện tại. Khi không có giông bão, giá trị này
bằng 0. Khi giông bão bắt đầu, giá trị này sẽ tăng dần
lên tới 1. Khi giông bão kết thúc, giá trị này giảm dần về 0.

Mỗi khi `bot.thunderState` thay đổi, sự kiện "weatherUpdate" sẽ được phát ra.

Giống với `bot.rainState`, nhưng dành cho giông bão.
Khi có giông bão, cả `bot.rainState` và `bot.thunderState` đều thay đổi.

#### bot.chatPatterns

Đây là một mảng các đối tượng pattern, có định dạng sau:
{ /regex/, "chattype", "description")
 * /regex/ - một mẫu biểu thức chính quy, nên có ít nhất hai nhóm bắt (capture group)
 * 'chattype' - loại chat mà pattern khớp, ví dụ "chat" hoặc "whisper", nhưng có thể là bất cứ gì.
 * 'description' - mô tả pattern dùng để làm gì, không bắt buộc.

#### bot.settings.chat

Các lựa chọn:

 * `enabled` (mặc định)
 * `commandsOnly`
 * `disabled`

#### bot.settings.colorsEnabled

Mặc định là true, bạn có nhận mã màu trong chat từ server hay không.

#### bot.settings.viewDistance

Có thể là một chuỗi trong danh sách dưới đây hoặc một số dương.
Các lựa chọn:
 * `far` (mặc định)
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

Giống như trong server.properties.

#### bot.settings.skinParts

Các cài đặt boolean này điều khiển việc các chi tiết phụ trên skin của chính người chơi có được hiển thị hay không

##### bot.settings.skinParts.showCape - boolean

Nếu bạn có áo choàng (cape), bạn có thể tắt nó bằng cách đặt giá trị này là false.

##### bot.settings.skinParts.showJacket - boolean

##### bot.settings.skinParts.showLeftSleeve - boolean

##### bot.settings.skinParts.showRightSleeve - boolean

##### bot.settings.skinParts.showLeftPants - boolean

##### bot.settings.skinParts.showRightPants - boolean

##### bot.settings.skinParts.showHat - boolean

#### bot.settings.enableTextFiltering - boolean
Không được sử dụng, mặc định là false trong client Notchian (Vanilla).
#### bot.settings.enableServerListing - boolean
Cài đặt này được gửi tới server để xác định người chơi có xuất hiện trong danh sách server hay không
#### bot.settings.particleStatus - string
Trạng thái hạt gửi tới server (1.21.3+): `all`, `decreased` hoặc `minimal`. Mặc định là `all`.
#### bot.experience.level

#### bot.experience.points

Tổng số điểm kinh nghiệm.

#### bot.experience.progress

Từ 0 đến 1 - lượng kinh nghiệm cần để lên cấp tiếp theo.

#### bot.health

Số trong khoảng [0, 20], biểu thị số nửa trái tim.

#### bot.food

Số trong khoảng [0, 20], biểu thị số nửa đùi gà.

#### bot.foodSaturation

Độ bão hòa thức ăn (saturation) đóng vai trò như phần thức ăn "dư thừa". Giá trị thức ăn sẽ không giảm
khi độ bão hòa còn lớn hơn 0. Người chơi khi đăng nhập sẽ tự động có
độ bão hòa là 5.0. Ăn thức ăn sẽ làm tăng cả độ bão hòa lẫn thanh thức ăn.

#### bot.oxygenLevel

Số trong khoảng [0, 20], biểu thị số biểu tượng bong bóng nước, còn gọi là mức oxy.

#### bot.physics

Chỉnh các số này để thay đổi trọng lực, tốc độ nhảy, vận tốc tối đa, v.v.
Bạn tự chịu rủi ro khi làm điều này.

#### bot.fireworkRocketDuration

Số tick vật lý còn lại của lực đẩy từ pháo hoa (firework rocket).

#### bot.simpleClick.leftMouse (slot)

lớp trừu tượng bọc quanh `bot.clickWindow(slot, 0, 0)`

#### bot.simpleClick.rightMouse (slot)

lớp trừu tượng bọc quanh `bot.clickWindow(slot, 1, 0)`

#### bot.time.doDaylightCycle

Gamerule doDaylightCycle là true hay false.

#### bot.time.bigTime

Tổng số tick kể từ ngày 0.

Giá trị này có kiểu BigInt và chính xác kể cả với giá trị rất lớn. (lớn hơn 2^51 - 1 tick)

#### bot.time.time

Tổng số tick kể từ ngày 0.

Vì giới hạn của kiểu Number trong Javascript là 2^51 - 1, bot.time.time sẽ không còn chính xác khi vượt quá giới hạn này và bạn nên dùng bot.time.bigTime.
Tuy nhiên trên thực tế, có lẽ bạn sẽ chẳng bao giờ cần dùng bot.time.bigTime vì nó chỉ đạt tới 2^51 - 1 tick một cách tự nhiên sau khoảng 14280821 năm thực.

#### bot.time.timeOfDay

Thời gian trong ngày, tính bằng tick.

Thời gian dựa trên tick, mỗi giây có 20 tick. Một ngày có 24000
tick, khiến mỗi ngày trong Minecraft dài đúng 20 phút.

Thời gian trong ngày được tính bằng timestamp chia lấy dư cho 24000. 0 là bình minh, 6000
là giữa trưa, 12000 là hoàng hôn, và 18000 là nửa đêm.

#### bot.time.day

Ngày của thế giới.

#### bot.time.isDay

Hiện có phải ban ngày hay không.

Dựa trên việc thời gian hiện tại trong ngày có nằm trong khoảng 0 đến 13000 tick (ban ngày + hoàng hôn) hay không.

#### bot.time.moonPhase

Pha mặt trăng.

Từ 0-7, trong đó 0 là trăng tròn.

#### bot.time.bigAge

Tuổi của thế giới, tính bằng tick.

Giá trị này có kiểu BigInt và chính xác kể cả với giá trị rất lớn. (lớn hơn 2^51 - 1 tick)

#### bot.time.age

Tuổi của thế giới, tính bằng tick.

Vì giới hạn của kiểu Number trong Javascript là 2^51 - 1, bot.time.age sẽ không còn chính xác khi vượt quá giới hạn này và bạn nên dùng bot.time.bigAge.
Tuy nhiên trên thực tế, có lẽ bạn sẽ chẳng bao giờ cần dùng bot.time.bigAge vì nó chỉ đạt tới 2^51 - 1 tick một cách tự nhiên sau khoảng 14280821 năm thực.

#### bot.quickBarSlot

Ô nào trên thanh công cụ nhanh (quick bar) đang được chọn (0 - 8).

#### bot.inventory

Một instance [`Window`](https://github.com/PrismarineJS/prismarine-windows#windowswindow-base-class) đại diện cho túi đồ của bạn.

#### bot.targetDigBlock

`block` mà bạn đang đào, hoặc `null`.

#### bot.isSleeping

Boolean, bạn có đang nằm trên giường hay không.

#### bot.scoreboards

Tất cả các bảng điểm mà bot biết, trong một đối tượng tên bảng điểm -> bảng điểm.

Được đặt lại mỗi lần đăng nhập (mỗi lần chuyển server trong mạng proxy); đối tượng vẫn được giữ nguyên còn các mục của nó bị xóa mà không phát sự kiện `scoreboardDeleted`.

#### bot.scoreboard

Tất cả các bảng điểm mà bot biết, trong một đối tượng displaySlot của bảng điểm -> bảng điểm.

Được đặt lại mỗi lần đăng nhập; đối tượng vẫn được giữ nguyên còn các slot của nó bị xóa.

 * `belowName` - bảng điểm đặt ở belowName
 * `sidebar` - bảng điểm đặt ở sidebar
 * `list` - bảng điểm đặt ở list
 * `0-18` - các slot được định nghĩa trong [giao thức](https://minecraft.wiki/w/Protocol#Display_Scoreboard)

Chỉ những slot đang hiển thị một objective mới có thể duyệt qua được (enumerable), vì vậy `Object.values(bot.scoreboard)` không bao giờ chứa `undefined`. Các slot có tên là bí danh không thể duyệt qua (non-enumerable) của `0`, `1` và `2`.

#### bot.teams

Tất cả các đội mà bot biết

Được đặt lại mỗi lần đăng nhập (mỗi lần chuyển server trong mạng proxy); đối tượng vẫn được giữ nguyên còn các mục của nó bị xóa mà không phát sự kiện `teamRemoved`.

#### bot.teamMap

Ánh xạ từ thành viên tới đội. Dùng username cho người chơi và UUID cho thực thể.

Được đặt lại mỗi lần đăng nhập; đối tượng vẫn được giữ nguyên còn các mục của nó bị xóa.

#### bot.controlState

Một đối tượng có các khóa là các trạng thái điều khiển chính: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'].

Gán giá trị cho đối tượng này sẽ gọi nội bộ [bot.setControlState](#botsetcontrolstatecontrol-state).

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

Chỉ được phát ra khi một người chơi chat công khai.

 * `username` - người gửi tin nhắn (so sánh với `bot.username` để bỏ qua tin nhắn của chính bot)
 * `message` - đã được loại bỏ mọi ký tự màu và ký tự điều khiển
 * `translate` - loại tin nhắn chat. Là null với hầu hết tin nhắn chat của bukkit
 * `jsonMsg` - tin nhắn JSON nguyên bản từ server
 * `matches` - mảng các kết quả khớp trả về từ biểu thức chính quy. Có thể là null

#### "whisper" (username, message, translate, jsonMsg, matches)

Chỉ được phát ra khi một người chơi nhắn riêng cho bạn.

 * `username` - người gửi tin nhắn
 * `message` - đã được loại bỏ mọi ký tự màu và ký tự điều khiển
 * `translate` - loại tin nhắn chat. Là null với hầu hết tin nhắn chat của bukkit
 * `jsonMsg` - tin nhắn JSON nguyên bản từ server
 * `matches` - mảng các kết quả khớp trả về từ biểu thức chính quy. Có thể là null

#### "actionBar" (jsonMsg, verified)

Được phát ra với mọi tin nhắn từ server xuất hiện trên Action Bar.

 * `jsonMsg` - tin nhắn JSON nguyên bản từ server
 * `verified` -> null nếu không được ký, true nếu được ký và hợp lệ, false nếu được ký nhưng không hợp lệ

#### "message" (jsonMsg, position, sender, verified)

Được phát ra với mọi tin nhắn từ server, kể cả tin nhắn chat.

 * `jsonMsg` - đối tượng [ChatMessage](https://github.com/PrismarineJS/prismarine-chat) chứa tin nhắn chat đã được định dạng. Có thể có thêm các thuộc tính sau:
   * unsigned - Đối tượng ChatMessage không được ký. Chỉ có từ 1.19.2+, và chỉ khi server cho phép chat không an toàn (insecure chat) và server đã sửa tin nhắn mà không có chữ ký của người dùng

 * `position` - (>= 1.8.1): vị trí của tin nhắn chat có thể là
   * chat
   * system
   * game_info

 * `sender` - UUID của người gửi nếu biết (1.16+), nếu không thì là null

 * `verified` -> null nếu không được ký, true nếu được ký và hợp lệ, false nếu được ký nhưng không hợp lệ

#### "messagestr" (message, messagePosition, jsonMsg, sender, verified)

Bí danh của sự kiện "message" nhưng gọi .toString() trên đối tượng prismarine-message để lấy chuỗi tin nhắn trước khi phát ra.

 * `sender` - UUID của người gửi nếu biết (1.16+), nếu không thì là null

 * `verified` -> null nếu không được ký, true nếu được ký và hợp lệ, false nếu được ký nhưng không hợp lệ

#### "inject_allowed"
Được kích hoạt khi file index đã được tải, bạn có thể nạp mcData và plugin ở đây nhưng tốt hơn nên đợi sự kiện "spawn".

#### "login"

Được kích hoạt sau khi bạn đăng nhập thành công vào server.
Tuy nhiên có lẽ bạn nên đợi sự kiện `spawn`
trước khi làm bất cứ điều gì.

#### "spawn"

Được phát ra một lần sau khi bạn đăng nhập và xuất hiện lần đầu tiên,
và sau đó được phát ra mỗi khi bạn hồi sinh sau khi chết.

Đây thường là sự kiện bạn nên lắng nghe
trước khi làm bất cứ điều gì trên server.

#### "respawn"

Được phát ra khi bạn chuyển chiều không gian và ngay trước khi bạn xuất hiện.
Thông thường bạn nên bỏ qua sự kiện này và đợi sự kiện "spawn"
thay vào đó.

#### "game"

Được phát ra khi server thay đổi bất kỳ thuộc tính nào của trò chơi.

#### "resourcePack" (url, hash)

Được phát ra khi server gửi một gói tài nguyên (resource pack).

#### "title" (title, type)

Được phát ra khi server gửi một tiêu đề (title)

* `title` - nội dung của tiêu đề
* `type` - loại tiêu đề "subtitle", "title"

#### "title_times" (fadeIn, stay, fadeOut)

Được phát ra khi server gửi gói tin title times (tức là khi thời gian hiện dần, thời gian hiển thị và thời gian mờ dần của tiêu đề được đặt hoặc cập nhật).

 * `fadeIn` - thời gian hiện dần, tính bằng tick (number)
 * `stay` - thời gian hiển thị, tính bằng tick (number)
 * `fadeOut` - thời gian mờ dần, tính bằng tick (number)

Ví dụ:

```js
bot.on('title_times', (fadeIn, stay, fadeOut) => {
  console.log(`Title times: fadeIn=${fadeIn}, stay=${stay}, fadeOut=${fadeOut}`)
})
```

#### "title_clear"

Được phát ra khi server xóa tất cả tiêu đề.

#### "rain"

Được phát ra khi trời bắt đầu hoặc tạnh mưa. Nếu bạn vào một
server khi trời đang mưa, sự kiện này sẽ được kích hoạt.

#### "weatherUpdate"

Được phát ra khi `bot.thunderState` hoặc `bot.rainState` thay đổi.
Nếu bạn vào một server khi trời đang mưa, sự kiện này sẽ được kích hoạt.

#### "time"

Được phát ra khi server gửi cập nhật thời gian. Xem `bot.time`.

#### "kicked" (reason, loggedIn)

Được phát ra khi bot bị kick khỏi server. `reason`
là một tin nhắn chat giải thích lý do bạn bị kick. `loggedIn`
là `true` nếu client bị kick sau khi đã đăng nhập thành công,
hoặc `false` nếu bị kick trong giai đoạn đăng nhập.

#### "end" (reason)

Được phát ra khi bạn không còn kết nối với server.
`reason` là một chuỗi giải thích lý do client bị ngắt kết nối. (mặc định là 'socketClosed')

#### "error" (err)

Được phát ra khi có lỗi xảy ra.

#### "spawnReset"

Được kích hoạt khi bạn không thể hồi sinh tại giường và điểm hồi sinh của bạn bị đặt lại.

#### "death"

Được kích hoạt khi bạn chết.

#### "health"

Được kích hoạt khi máu hoặc thức ăn của bạn thay đổi.

#### "breath"

Được kích hoạt khi mức oxy của bạn thay đổi.

#### "abilities" (abilities)

Được kích hoạt khi server gửi gói tin abilities, kèm theo [bot.abilities](#botabilities) mới.

#### "entityAttributes" (entity)

Được kích hoạt khi một thuộc tính (attribute) của thực thể thay đổi.

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

Một thực thể bắt đầu bay bằng cánh cứng (elytra).

#### "itemDrop" (entity)
#### "playerCollect" (collector, collected)

Một thực thể đã nhặt một vật phẩm.

 * `collector` - thực thể đã nhặt vật phẩm.
 * `collected` - thực thể là vật phẩm nằm trên mặt đất.

#### "entityGone" (entity)
#### "entityMoved" (entity)
#### "entityDetach" (entity, vehicle)
#### "entityAttach" (entity, vehicle)

Một thực thể được gắn vào một phương tiện, chẳng hạn xe goòng (minecart)
hoặc thuyền.

 * `entity` - thực thể đang ngồi trên phương tiện
 * `vehicle` - thực thể là phương tiện

#### "entityUpdate" (entity)
#### "entityEffect" (entity, effect)
#### "entityEffectEnd" (entity, effect)
#### "playerJoined" (player)
#### "playerUpdated" (player)
#### "playerLeft" (player)

#### "blockUpdate" (oldBlock, newBlock)

(Tốt hơn nên dùng sự kiện này từ bot.world thay vì trực tiếp từ bot) Được kích hoạt khi một khối được cập nhật. Cả `oldBlock` và `newBlock` đều được cung cấp để
so sánh.

Lưu ý rằng `oldBlock` có thể là `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(Tốt hơn nên dùng sự kiện này từ bot.world thay vì trực tiếp từ bot) Được kích hoạt cho một điểm cụ thể. Cả `oldBlock` và `newBlock` đều được cung cấp để
so sánh.

Lưu ý rằng `oldBlock` có thể là `null`.

#### "blockEntityData" (block)

Được kích hoạt khi server gửi dữ liệu block entity mới cho một khối, ví dụ khi chữ trên một tấm biển được cập nhật. `block` là khối tại vị trí đó với dữ liệu mới (có thể là `null` nếu khối không còn được tải).

#### "signOpen" (block)

Được kích hoạt khi server mở trình chỉnh sửa biển, ngay sau khi bot đặt một tấm biển. `block` là tấm biển vừa đặt (có thể là `null` nếu nó chưa được tải). Phản hồi bằng [bot.updateSign](#botupdatesignblock-text-back--false).

#### "blockPlaced" (oldBlock, newBlock)

Được kích hoạt khi bot đặt khối. Cả `oldBlock` và `newBlock` đều được cung cấp để
so sánh.

Lưu ý rằng `oldBlock` có thể là `null`.

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

Được kích hoạt khi một chunk được cập nhật. `point` là tọa độ của góc
chunk có các giá trị x, y và z nhỏ nhất.

#### "soundEffectHeard" (soundName, position, volume, pitch)

Được kích hoạt khi client nghe thấy một hiệu ứng âm thanh có tên.

 * `soundName`: tên của hiệu ứng âm thanh
 * `position`: một instance Vec3 chỉ nơi phát ra âm thanh
 * `volume`: âm lượng dạng số thực, 1.0 là 100%
 * `pitch`: cao độ dạng số nguyên, 63 là 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

  Được kích hoạt khi client nghe thấy một hiệu ứng âm thanh được mã hóa cứng (hardcoded).

   * `soundId`: id của hiệu ứng âm thanh
   * `soundCategory`: danh mục của hiệu ứng âm thanh
   * `position`: một instance Vec3 chỉ nơi phát ra âm thanh
   * `volume`: âm lượng dạng số thực, 1.0 là 100%
   * `pitch`: cao độ dạng số nguyên, 63 là 100%

#### "noteHeard" (block, instrument, pitch)

Được kích hoạt khi một khối nhạc (note block) phát ra âm thanh ở đâu đó.

 * `block`: một instance Block, là khối đã phát ra âm thanh
 * `instrument`:
   - `id`: id dạng số nguyên
   - `name`: một trong các giá trị [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`].
 * `pitch`: Cao độ của nốt nhạc (từ 0-24, tính cả hai đầu, trong đó 0 là
   thấp nhất và 24 là cao nhất). Thông tin thêm về cách các giá trị cao độ
   tương ứng với nốt nhạc ngoài đời thực có trên
   [wiki Minecraft chính thức](http://minecraft.wiki/w/Note_Block).

#### "pistonMove" (block, isPulling, direction)

#### "chestLidMove" (block, isOpen, block2)
* `block`: một instance Block, là khối có nắp được mở. Là khối bên phải nếu đó là rương đôi
* `isOpen`: số người chơi đang mở rương. Là 0 nếu rương đang đóng
* `block2`: một instance Block, là nửa còn lại của khối có nắp được mở. Là null nếu không phải rương đôi

#### "blockBreakProgressObserved" (block, destroyStage, entity)

Được kích hoạt khi client quan sát thấy một khối đang trong quá trình bị phá.

 * `block`: một instance Block, là khối đang bị phá
 * `destroyStage`: số nguyên tương ứng với tiến độ phá (0-9)
 * `entity`: thực thể đang phá khối.

#### "blockBreakProgressEnd" (block, entity)

Được kích hoạt khi client quan sát thấy một khối ngừng bị phá.
Điều này xảy ra dù quá trình phá đã hoàn tất hay bị hủy.

 * `block`: một instance Block, là khối không còn bị phá nữa
 * `entity`: thực thể đã ngừng phá khối

#### "diggingCompleted" (block)

 * `block` - khối không còn tồn tại

#### "diggingAborted" (block)

 * `block` - khối vẫn còn tồn tại

#### "usedFirework" (fireworkEntityId)

Được kích hoạt khi bot dùng pháo hoa trong lúc bay bằng elytra.

 * `fireworkEntityId` - id thực thể của pháo hoa.

#### "move"

Được kích hoạt khi bot di chuyển. Nếu bạn muốn biết vị trí hiện tại, hãy dùng
`bot.entity.position`, và với các lần di chuyển thông thường, nếu muốn biết vị trí trước đó, hãy dùng
`bot.entity.position.minus(bot.entity.velocity)`.

#### "forcedMove"

Được kích hoạt khi bot bị server ép di chuyển (dịch chuyển tức thời, hồi sinh, ...). Nếu bạn muốn biết vị trí hiện tại, hãy dùng
`bot.entity.position`.

#### "mount"

Được kích hoạt khi bạn cưỡi lên một thực thể như xe goòng. Để truy cập
thực thể đó, dùng `bot.vehicle`.

Để cưỡi một thực thể, dùng `mount`.

#### "dismount" (vehicle)

Được kích hoạt khi bạn rời khỏi một thực thể đang cưỡi.

#### "windowOpen" (window)

Được kích hoạt khi bạn bắt đầu sử dụng bàn chế tạo, rương, giá pha thuốc, v.v.

#### "windowClose" (window)

Được kích hoạt khi bạn không còn có thể làm việc với bàn chế tạo, rương, v.v.

#### "sleep"

Được kích hoạt khi bạn ngủ.

#### "wake"

Được kích hoạt khi bạn thức dậy.

#### "experience"

Được kích hoạt khi `bot.experience.*` được cập nhật.

#### "scoreboardCreated" (scoreboard)

Được kích hoạt khi một bảng điểm được thêm vào.

#### "scoreboardDeleted" (scoreboard)

Được kích hoạt khi một bảng điểm bị xóa. Không được kích hoạt với các bảng điểm bị xóa do đăng nhập.

#### "scoreboardTitleChanged" (scoreboard)

Được kích hoạt khi tiêu đề của một bảng điểm được cập nhật.

#### "scoreUpdated" (scoreboard, item)

Được kích hoạt khi điểm của một mục trong bảng điểm được cập nhật.

#### "scoreRemoved" (scoreboard, item)

Được kích hoạt khi điểm của một mục trong bảng điểm bị xóa.

#### "scoreboardPosition" (position, scoreboard)

Được kích hoạt khi vị trí của một bảng điểm được cập nhật.

#### "teamCreated" (team)

Được kích hoạt khi một đội được thêm vào.

#### "teamRemoved" (team)

Được kích hoạt khi một đội bị xóa. Không được kích hoạt với các đội bị xóa do đăng nhập.

#### "teamUpdated" (team)

Được kích hoạt khi một đội được cập nhật.

#### "teamMemberAdded" (team)

Được kích hoạt khi một hoặc nhiều thành viên được thêm vào một đội.

#### "teamMemberRemoved" (team)

Được kích hoạt khi một hoặc nhiều thành viên bị xóa khỏi một đội.

#### "bossBarCreated" (bossBar)

Được kích hoạt khi một thanh máu boss mới được tạo.

#### "bossBarDeleted" (bossBar)

Được kích hoạt khi một thanh máu boss bị xóa.

#### "bossBarUpdated" (bossBar)

Được kích hoạt khi một thanh máu boss được cập nhật.

#### "heldItemChanged" (heldItem)

Được kích hoạt khi vật phẩm đang cầm thay đổi.

#### "physicsTick" ()

Được kích hoạt mỗi tick nếu bot.physicsEnabled được đặt là true.

#### "chat:name" (matches)

Được kích hoạt khi tất cả regex của một chat pattern đều có kết quả khớp

#### "particle"

Được kích hoạt khi một hạt được tạo ra

### Functions

#### bot.blockAt(point, extraInfos=true)

Trả về khối tại `point`, hoặc `null` nếu điểm đó chưa được tải. Nếu `extraInfos` được đặt là true, sẽ trả về thêm thông tin về biển, tranh và block entity (chậm hơn).
Xem `Block`.

#### bot.waitForChunksToLoad()

Hàm này trả về một `Promise`, với đối số `void` khi nhiều chunk đã được tải.

#### bot.blockInSight(maxSteps, vectorLength)

Đã lỗi thời (deprecated), hãy dùng `blockAtCursor` thay thế.

Trả về khối mà bot đang nhìn vào hoặc `null`
 * `maxSteps` - Số bước dò tia (raytrace), mặc định là 256.
 * `vectorLength` - Độ dài của vector dò tia, mặc định là `5/16`.

#### bot.blockAtCursor(maxDistance=256)

Trả về khối mà bot đang nhìn vào hoặc `null`
 * `maxDistance` - Khoảng cách tối đa từ mắt tới khối, mặc định là 256.

#### bot.entityAtCursor(maxDistance=3.5)

Trả về thực thể mà bot đang nhìn vào hoặc `null`
 * `maxDistance` - Khoảng cách tối đa từ mắt tới thực thể, mặc định là 3.5.

#### bot.blockAtEntityCursor(entity=bot.entity, maxDistance=256)

Trả về khối mà một thực thể cụ thể đang nhìn vào hoặc `null`
 * `entity` - Dữ liệu thực thể dưới dạng `Object`
 * `maxDistance` - Khoảng cách tối đa từ mắt tới khối, mặc định là 256.

#### bot.canSeeBlock(block)

Trả về true hoặc false tùy thuộc vào việc bot có nhìn thấy `block` được chỉ định hay không.

#### bot.findBlocks(options)

Tìm các khối gần nhất tính từ điểm đã cho.
 * `options` - Các tùy chọn tìm kiếm:
   - `point` - Vị trí bắt đầu tìm kiếm (tâm). Mặc định là vị trí của bot.
   - `matching` - Một hàm trả về true nếu khối đã cho là khớp. Cũng hỗ trợ giá trị này là một id khối hoặc mảng các id khối.
   - `useExtraInfo` - Để giữ tương thích ngược, có thể cho ra hai hành vi tùy thuộc vào kiểu dữ liệu
      - **boolean** - Cung cấp thêm dữ liệu cho hàm `matching` - cách này chậm hơn đáng kể
      - **function** - Tạo ra so khớp hai giai đoạn, nếu khối vượt qua hàm `matching` nó sẽ được chuyển tiếp tới `useExtraInfo` kèm thông tin bổ sung
   - `maxDistance` - Khoảng cách xa nhất để tìm kiếm, mặc định là 16.
   - `count` - Số khối cần tìm trước khi trả về kết quả. Mặc định là 1. Có thể trả về ít hơn nếu không tìm đủ khối sau khi đã duyệt toàn bộ khu vực.

Trả về một mảng (có thể rỗng) chứa tọa độ các khối tìm được (không phải bản thân các khối). Mảng được sắp xếp (gần nhất đứng trước)

#### bot.findBlock(options)

Bí danh của `bot.blockAt(bot.findBlocks(options)[0])`. Trả về một khối duy nhất hoặc `null`.

#### bot.canDigBlock(block)

Trả về việc `block` có thể đào được và nằm trong tầm với hay không.

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

Trả về danh sách các instance `Recipe` mà bạn có thể dùng để chế tạo `itemType`
với `metadata`.

 * `itemType` - id vật phẩm dạng số của thứ bạn muốn chế tạo
 * `metadata` - giá trị metadata dạng số của vật phẩm bạn muốn chế tạo
   `null` khớp với mọi metadata.
 * `minResultCount` - dựa trên túi đồ hiện tại của bạn, mọi công thức trong
   danh sách trả về sẽ có thể tạo ra ít nhất bấy nhiêu vật phẩm. `null` tương
   đương với `1`.
 * `craftingTable` - một instance `Block`. Nếu là `null`, chỉ những công thức có thể
   thực hiện trong cửa sổ túi đồ mới được đưa vào danh sách.

#### bot.recipesAll(itemType, metadata, craftingTable)

Giống bot.recipesFor ngoại trừ việc nó không kiểm tra bot có đủ nguyên liệu cho công thức hay không.

#### bot.nearestEntity(match = (entity) => { return true })

Trả về thực thể gần bot nhất thỏa mãn hàm so khớp (mặc định là mọi thực thể). Trả về null nếu không tìm thấy thực thể nào.

Ví dụ:
```js
const cow = bot.nearestEntity(entity => entity.name.toLowerCase() === 'cow') // we use .toLowercase() because in 1.8 cow was capitalized, for newer versions that can be omitted
```

### Methods

#### bot.end(reason)

Kết thúc kết nối với server.
* `reason` - Chuỗi không bắt buộc, nêu lý do kết thúc.

#### bot.quit(reason)

Ngắt kết nối khỏi server một cách êm đẹp với lý do đã cho (mặc định là 'disconnect.quitting').

#### bot.tabComplete(str, [assumeCommand], [sendBlockInSight], [timeout])

Hàm này trả về một `Promise`, với đối số `matches` khi hoàn tất.

Yêu cầu server gợi ý hoàn thành chat (tab complete).
 * `str` - Chuỗi cần hoàn thành.
 * `assumeCommand` - Trường gửi tới server, mặc định là false.
 * `sendBlockInSight` - Trường gửi tới server, mặc định là true. Đặt tùy chọn này là false nếu bạn muốn hiệu năng tốt hơn.
 * `timeout` - Thời gian chờ tính bằng mili giây, sau đó hàm sẽ trả về một mảng rỗng, mặc định là 5000.

#### bot.chat(message)

Gửi một tin nhắn chat công khai. Tự động chia tin nhắn dài thành nhiều tin nhắn chat khi cần.

Ném ra lỗi nếu được gọi trước sự kiện `login`, hoặc sau một lần ngắt kết nối xảy ra trước sự kiện đó: server chỉ chấp nhận chat khi client đã ở trạng thái chơi (play state).

#### bot.whisper(username, message)

Lối tắt cho "/tell <username>". Mọi tin nhắn bị chia nhỏ đều sẽ được nhắn riêng cho username.

#### bot.chatAddPattern(pattern, chatType, description)

Đã lỗi thời (deprecated), hãy dùng `addChatPattern` thay thế.

Thêm một mẫu regex vào bộ so khớp chat của bot. Hữu ích cho các server bukkit, nơi định dạng chat thay đổi rất nhiều.
 * `pattern` - biểu thức chính quy để khớp với chat
 * `chatType` - sự kiện mà bot phát ra khi pattern khớp. Vd: "chat" hoặc "whisper"
 * 'description ' - Không bắt buộc, mô tả pattern dùng để làm gì

#### bot.addChatPattern(name, pattern, chatPatternOptions)

**Lưu ý:** đây là bí danh của `bot.addChatPatternSet(name, [pattern], chatPatternOptions)`

tạo một sự kiện được gọi mỗi khi pattern khớp với một tin nhắn,
sự kiện sẽ có tên `"chat:name"`, với name là tên được truyền vào
* `name` - tên dùng để lắng nghe sự kiện
* `pattern` - biểu thức chính quy để khớp với các tin nhắn nhận được
* `chatPatternOptions` - object
  * `repeat` - mặc định là true, có tiếp tục lắng nghe sự kiện này sau lần khớp đầu tiên hay không
  * `parse` - thay vì trả về tin nhắn thực tế đã khớp, trả về các nhóm bắt (capture group) từ regex
  * `deprecated` - (**không ổn định**) được bot.chatAddPattern dùng để giữ tương thích, nhiều khả năng sẽ bị xóa

trả về một số có thể dùng với bot.removeChatPattern() để chỉ xóa pattern này

- :eyes: xem [examples/chat_parsing](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js#L17-L36)

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

tạo một sự kiện được gọi mỗi khi tất cả các pattern đều đã khớp với tin nhắn,
sự kiện sẽ có tên `"chat:name"`, với name là tên được truyền vào
* `name` - tên dùng để lắng nghe sự kiện
* `patterns` - mảng các biểu thức chính quy để khớp với các tin nhắn nhận được
* `chatPatternOptions` - object
  * `repeat` - mặc định là true, có tiếp tục lắng nghe sự kiện này sau lần khớp đầu tiên hay không
  * `parse` - thay vì trả về tin nhắn thực tế đã khớp, trả về các nhóm bắt (capture group) từ regex

trả về một số có thể dùng với bot.removeChatPattern() để chỉ xóa bộ pattern này

- :eyes: xem [examples/chat_parsing](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js#L17-L36)

#### bot.removeChatPattern(name)

xóa một (hoặc nhiều) chat pattern
* `name` : chuỗi hoặc số

nếu name là chuỗi, mọi pattern có tên đó sẽ bị xóa
còn nếu name là số, chỉ đúng pattern đó bị xóa

#### bot.awaitMessage(...args)

promise được resolve khi một trong các tin nhắn được truyền làm đối số xuất hiện

Ví dụ:

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

Xem thuộc tính `bot.settings`.

#### bot.loadPlugin(plugin)

Nạp (inject) một Plugin. Không làm gì nếu plugin đã được nạp.

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

Nạp nhiều plugin, xem `bot.loadPlugin`.
 * `plugins` - mảng các hàm

#### bot.hasPlugin(plugin)

Kiểm tra xem plugin đã cho đã được nạp (hoặc đã được lên lịch để nạp) trên bot này hay chưa.

#### bot.sleep(bedBlock)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Ngủ trên giường. `bedBlock` phải là một instance `Block` là một chiếc giường.

#### bot.isABed(bedBlock)

Trả về true nếu `bedBlock` là một chiếc giường

#### bot.wake()

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Rời khỏi giường.

#### bot.setControlState(control, state)

Đây là phương thức chính điều khiển chuyển động của bot. Nó hoạt động tương tự như việc nhấn phím trong minecraft.
Ví dụ, forward với state là true sẽ khiến bot đi về phía trước. Forward với state là false sẽ khiến bot dừng đi về phía trước.
Bạn có thể dùng kết hợp bot.lookAt với phương thức này để điều khiển chuyển động. Ví dụ jumper.js cho thấy cách sử dụng.

 * `control` - một trong các giá trị ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
 * `state` - `true` hoặc `false`

#### bot.getControlState(control)

Trả về true nếu một trạng thái điều khiển đang được bật.

* `control` - một trong các giá trị ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']

#### bot.clearControlStates()

Tắt tất cả các điều khiển.

#### bot.getExplosionDamages(entity, position, radius, [rawDamages])

Trả về lượng sát thương mà thực thể sẽ phải chịu trong bán kính quanh vị trí vụ nổ.
Hàm sẽ trả về `null` nếu thực thể không có giáp và rawDamages không được đặt là true, vì hàm không thể tính sát thương có giáp khi không có giáp.

* `entity` - instance Entity
* `position` - instance [Vec3](https://github.com/andrewrk/node-vec3)
* `radius` - bán kính vụ nổ dạng số
* `rawDamages` - không bắt buộc, nếu là true sẽ bỏ qua giáp khi tính toán

#### bot.lookAt(point, [force])

Hàm này trả về một `Promise`, với đối số `void` khi bạn đang nhìn vào `point`.

 * `point` instance [Vec3](https://github.com/andrewrk/node-vec3) - xoay đầu để nhìn thẳng vào điểm này.
 * `force` - Xem `force` trong `bot.look`

#### bot.look(yaw, pitch, [force])

Hàm này trả về một `Promise`, với đối số `void`, được gọi khi bạn đang nhìn theo `yaw` và `pitch`.

Đặt hướng nhìn của đầu.

 * `yaw` - Số radian xoay quanh trục thẳng đứng, bắt đầu
   từ hướng chính đông. Ngược chiều kim đồng hồ.
 * `pitch` - Số radian để ngẩng lên hoặc cúi xuống. 0 nghĩa là nhìn thẳng về phía trước.
   pi / 2 nghĩa là nhìn thẳng lên trên. -pi / 2 nghĩa là nhìn thẳng xuống dưới.
 * `force` - Nếu có và là true, bỏ qua việc chuyển hướng mượt mà phía server.
   Đặt giá trị này là true nếu bạn cần server biết chính xác bạn đang
   nhìn vào đâu, chẳng hạn khi vứt vật phẩm hoặc bắn tên. Không cần thiết
   với các tính toán phía client như hướng đi bộ.

#### bot.updateSign(block, text, back = false)

Thay đổi chữ trên tấm biển. Từ Minecraft 1.20 trở lên, `back` mang giá trị truthy sẽ thử đặt chữ ở mặt sau của tấm biển (chỉ nhìn thấy được nếu biển không gắn vào tường).

#### bot.equip(item, destination)

Hàm này trả về một `Promise`, với đối số `void` khi bạn đã trang bị vật phẩm thành công hoặc khi biết rằng việc trang bị đã thất bại.

Trang bị một vật phẩm từ túi đồ. Nếu đối số `item` là instance `Item`, equip sẽ trang bị đúng vật phẩm đó từ ô (slot) của nó trong cửa sổ. Nếu đối số `item` có kiểu `number`, equip sẽ trang bị vật phẩm đầu tiên tìm thấy có id đó, tìm theo thứ tự id ô tăng dần (Thanh công cụ nhanh được tìm cuối cùng. Các ô giáp, ô chế tạo, ô kết quả chế tạo và ô tay phụ bị loại trừ).

 * `item` - instance `Item` hoặc `number` là id vật phẩm. Xem `window.items()`.
 * `destination`
   - `"hand"` - `null` tương đương với giá trị này
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
   - `"off-hand"` - khi có hỗ trợ

#### bot.unequip(destination)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Tháo một món trang bị.

#### bot.tossStack(item)

Hàm này trả về một `Promise`, với đối số `void` khi đã vứt xong.

 * `item` - chồng (stack) vật phẩm bạn muốn vứt
   (nếu kết quả là truthy, nghĩa là bạn đã không thể vứt thành công.)

#### bot.toss(itemType, metadata, count)

Hàm này trả về một `Promise`, với đối số `void` khi việc vứt đã hoàn tất.

 * `itemType` - id dạng số của vật phẩm bạn muốn vứt
 * `metadata` - metadata của vật phẩm bạn muốn vứt. Dùng `null`
   để khớp với mọi metadata
 * `count` - số lượng bạn muốn vứt. `null` tương đương với `1`.

#### bot.elytraFly()

Hàm này trả về một `Promise`, với đối số `void` khi việc kích hoạt
bay bằng elytra đã hoàn tất. Hàm sẽ ném ra Error nếu thất bại.

#### bot.dig(block, [forceLook], [digFace])

Hàm này trả về một `Promise`, với đối số `void` khi khối đã bị phá hoặc khi bạn bị gián đoạn.

Bắt đầu đào `block` bằng vật phẩm đang được trang bị.
Xem thêm các sự kiện "diggingCompleted" và "diggingAborted".

Lưu ý rằng khi bạn đã bắt đầu đào một khối, bạn không thể
đào khối nào khác cho đến khi khối đó bị phá, hoặc bạn gọi
`bot.stopDigging()`.

 * `block` - khối cần bắt đầu đào
 * `forceLook` - (không bắt buộc) nếu là true, bot sẽ quay ngoắt đầu về phía khối và bắt đầu đào ngay lập tức. Nếu là false hoặc bỏ qua, bot sẽ quay đầu về phía khối với tốc độ nhìn bình thường và đợi quay xong rồi mới đào. Cũng có thể gán 'ignore' để bot hoàn toàn không cử động đầu.
 * `digFace` - (không bắt buộc) Mặc định là 'auto', nhìn vào tâm khối và đào mặt trên. Cũng có thể là một vector vec3
 chỉ mặt mà bot nên nhìn vào khi đào khối. Ví dụ: ```vec3(0, 1, 0)``` khi đào mặt trên. Cũng có thể là 'raycast', khi đó bot sẽ dò tia (raycast) để kiểm tra có mặt nào bot nhìn thấy được không và đào mặt đó. Hữu ích cho các server có anti cheat.

Nếu bạn gọi bot.dig hai lần trước khi lần đào đầu tiên kết thúc, bạn sẽ gặp lỗi nghiêm trọng 'diggingAborted'.

#### bot.stopDigging()

#### bot.digTime(block)

Cho biết sẽ mất bao lâu để đào khối, tính bằng mili giây.

#### bot.acceptResourcePack()

Chấp nhận gói tài nguyên.

#### bot.denyResourcePack()

Từ chối gói tài nguyên.

#### bot.placeBlock(referenceBlock, faceVector)

Hàm này trả về một `Promise`, với đối số `void` khi server xác nhận khối đã thực sự được đặt.
Promise bị reject ngay khi server từ chối việc đặt khối (ví dụ vì có thực thể cản đường).

 * `referenceBlock` - khối mà bạn muốn đặt khối mới bên cạnh
 * `faceVector` - một trong sáu hướng chính, chẳng hạn `new Vec3(0, 1, 0)` cho mặt trên,
   chỉ ra mặt nào của `referenceBlock` để đặt khối áp vào.

Khối mới sẽ được đặt tại `referenceBlock.position.plus(faceVector)`.

#### bot.placeEntity(referenceBlock, faceVector)

Hàm này trả về một `Promise`, với đối số `Entity` khi hoàn tất.

 * `referenceBlock` - khối mà bạn muốn đặt thực thể bên cạnh
 * `faceVector` - một trong sáu hướng chính, chẳng hạn `new Vec3(0, 1, 0)` cho mặt trên,
   chỉ ra mặt nào của `referenceBlock` để đặt áp vào.

Thực thể mới sẽ được đặt tại `referenceBlock.position.plus(faceVector)`.

#### bot.activateBlock(block, direction?: Vec3, cursorPos?: Vec3)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Gõ vào khối nhạc, mở cửa, v.v.

 * `block` - khối cần kích hoạt
 * `direction` Không bắt buộc, mặc định là `new Vec3(0, 1, 0)` (hướng lên). Một vector chỉ hướng tương tác với khối chứa đồ (container). Không có tác dụng khi mục tiêu là thực thể chứa đồ.
 * `cursorPos` Không bắt buộc, mặc định là `new Vec3(0.5, 0.5, 0.5)` (tâm khối). Vị trí con trỏ khi mở instance khối. Giá trị này được gửi kèm gói tin activate block. Không có tác dụng khi mục tiêu là thực thể chứa đồ.

#### bot.activateEntity(entity)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Kích hoạt (tương tác với) một thực thể, ví dụ hữu ích với dân làng.

 * `entity` - thực thể cần kích hoạt

#### bot.activateEntityAt(entity, position)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Kích hoạt một thực thể tại vị trí đã cho, hữu ích với giá treo giáp (armor stand).

 * `entity` - thực thể cần kích hoạt
 * `position` - vị trí trong thế giới để bấm vào

#### bot.consume()

Hàm này trả về một `Promise`, với đối số `void` khi việc ăn/uống kết thúc.

Ăn / uống vật phẩm đang cầm


#### bot.fish()

Hàm này trả về một `Promise`, với đối số `void` khi việc câu cá kết thúc.

Dùng cần câu


#### bot.activateItem(offHand=false)

Kích hoạt vật phẩm đang cầm. Đây là cách để ăn, bắn cung, ném
trứng, kích hoạt pháo hoa, v.v.

Tham số không bắt buộc là `false` cho tay chính và `true` cho tay phụ.

#### bot.deactivateItem()

Ngừng kích hoạt vật phẩm đang cầm. Đây là cách để thả mũi tên, ngừng ăn, v.v.

#### bot.useOn(targetEntity)

Dùng vật phẩm đang cầm lên một instance `Entity`. Đây là cách để đặt yên ngựa và
dùng kéo.

#### bot.attack(entity, swing = true)

Tấn công một người chơi hoặc một mob.

 * `entity` là một loại thực thể. Để lấy một thực thể cụ thể, dùng [bot.nearestEntity()](#botnearestentitymatch--entity---return-true-) hoặc [bot.entities](#botentities).
 * `swing` Mặc định là `true`. Nếu là false, bot sẽ không vung tay khi tấn công.

#### bot.swingArm([hand], showHand)

Phát hoạt ảnh vung tay.

 * `hand` có thể nhận `left` hoặc `right`, là cánh tay được tạo hoạt ảnh. Mặc định: `right`
 * `showHand` là một boolean, có thêm tay vào gói tin hay không, Mặc định: `true`

#### bot.mount(entity)

Cưỡi lên một phương tiện. Để xuống, dùng `bot.dismount`.

#### bot.dismount()

Rời khỏi phương tiện bạn đang ngồi.

#### bot.moveVehicle(left,forward)

Di chuyển phương tiện:

 * left có thể nhận -1 hoặc 1 : -1 nghĩa là sang phải, 1 nghĩa là sang trái
 * forward có thể nhận -1 hoặc 1 : -1 nghĩa là lùi lại, 1 nghĩa là tiến lên

Mọi hướng đều tương đối so với hướng bot đang nhìn

#### bot.setQuickBarSlot(slot)

 * `slot` - 0-8, ô trên thanh công cụ nhanh cần chọn.

#### bot.craft(recipe, count, craftingTable)

Hàm này trả về một `Promise`, với đối số `void` khi việc chế tạo hoàn tất và túi đồ của bạn đã được cập nhật.

 * `recipe` - Một instance `Recipe`. Xem `bot.recipesFor`.
 * `count` - Số lần bạn muốn thực hiện thao tác.
   Nếu muốn chế tạo ván gỗ thành `8` que, bạn đặt
   `count` là `2`. `null` tương đương với `1`.
 * `craftingTable` - Một instance `Block`, là bàn chế tạo bạn muốn
   sử dụng. Nếu công thức không cần bàn chế tạo, bạn có thể dùng
   `null` cho đối số này.

#### bot.writeBook(slot, pages)

Hàm này trả về một `Promise`, với đối số `void` khi việc viết thành công hoặc khi có lỗi xảy ra.

 * `slot` tính theo tọa độ cửa sổ túi đồ (trong đó 36 là ô đầu tiên của thanh công cụ nhanh, v.v.).
 * `pages` là một mảng các chuỗi đại diện cho các trang.

#### bot.openContainer(containerBlock or containerEntity, direction?, cursorPos?)
Mở một khối hoặc thực thể chứa đồ.

 * `containerBlock` hoặc `containerEntity` Instance khối cần mở hoặc thực thể cần mở.
 * `direction` Không bắt buộc, mặc định là `new Vec3(0, 1, 0)` (hướng lên). Một vector chỉ hướng tương tác với khối chứa đồ. Không có tác dụng khi mục tiêu là thực thể chứa đồ.
 * `cursorPos` Không bắt buộc, mặc định là `new Vec3(0.5, 0.5, 0.5)` (tâm khối). Vị trí con trỏ khi mở instance khối. Giá trị này được gửi kèm gói tin activate block. Không có tác dụng khi mục tiêu là thực thể chứa đồ.

Trả về một promise của instance `Container` đại diện cho vật chứa bạn đang mở.

#### bot.openChest(chestBlock or minecartchestEntity, direction?, cursorPos?)

Đã lỗi thời (deprecated). Giống `openContainer`

#### bot.openFurnace(furnaceBlock)

Trả về một promise của instance `Furnace` đại diện cho lò nung bạn đang mở.

#### bot.openDispenser(dispenserBlock)

Đã lỗi thời (deprecated). Giống `openContainer`

#### bot.openEnchantmentTable(enchantmentTableBlock)

Trả về một promise của instance `EnchantmentTable` đại diện cho bàn phù phép
bạn đang mở.

#### bot.openAnvil(anvilBlock)

Trả về một promise của instance `anvil` đại diện cho cái đe bạn đang mở.

#### bot.openVillager(villagerEntity)

Trả về một promise của instance `Villager` đại diện cho cửa sổ giao dịch bạn đang mở.
Bạn có thể lắng nghe sự kiện `ready` trên `Villager` này để biết khi nào nó sẵn sàng

#### bot.trade(villagerInstance, tradeIndex, [times])

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Dùng `villagerInstance` đang mở để giao dịch.

#### bot.setCommandBlock(pos, command, [options])

Đặt các thuộc tính của khối lệnh (command block) tại `pos`.
Ví dụ đối số `options`:
```js
{
  mode: 2,
  trackOutput: true,
  conditional: false,
  alwaysActive: true
}
```
options.mode có thể nhận 3 giá trị: 0 (SEQUENCE), 1 (AUTO), 2 (REDSTONE)
Mọi thuộc tính trong options mặc định là false, ngoại trừ mode mặc định là 2 (để giống với khối lệnh mặc định trong Minecraft).

#### bot.supportFeature(name)

Có thể dùng để kiểm tra một tính năng cụ thể có khả dụng trong phiên bản Minecraft hiện tại hay không. Thông thường chỉ cần khi xử lý các chức năng đặc thù theo phiên bản.

Danh sách các tính năng khả dụng có trong file [features.json](https://github.com/PrismarineJS/minecraft-data/blob/master/data/pc/common/features.json).

#### bot.waitForTicks(ticks)

Đây là một hàm dựa trên promise, chờ một số tick trong game trôi qua rồi mới tiếp tục. Hữu ích cho các bộ đếm thời gian ngắn cần hoạt động theo nhịp chính xác, bất kể tốc độ tick vật lý của bot. Hàm này tương tự hàm setTimeout tiêu chuẩn của Javascript, nhưng chạy riêng theo bộ đếm vật lý của bot.

#### bot.respawn()

Khi tùy chọn `respawn` bị tắt, bạn có thể gọi phương thức này thủ công để hồi sinh.

### Lower level inventory methods

Đây là các phương thức túi đồ ở mức thấp hơn, đôi khi chúng có thể hữu ích nhưng nếu có thể, hãy ưu tiên các phương thức túi đồ được trình bày ở trên.

#### bot.clickWindow(slot, mouseButton, mode)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

các mode được hỗ trợ:
  - ổn định:
    - nhấp chuột (0)

  - thử nghiệm:
    - nhấp kèm shift (1)
    - nhấp phím số (2)
    - nhấp chuột giữa (3)
    - nhấp để vứt (4)

  - chưa được cài đặt:
    - nhấp kéo (5)
    - nhấp đúp (6)

Nhấp vào cửa sổ hiện tại. Xem chi tiết tại https://minecraft.wiki/w/Protocol#Click_Container

Nên ưu tiên dùng bot.simpleClick.*

#### bot.putSelectedItemRange(start, end, window, slot)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Đặt vật phẩm ở `slot` vào khoảng ô đã chỉ định.

#### bot.putAway(slot)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Cất vật phẩm ở `slot` vào túi đồ.

#### bot.closeWindow(window)

Hàm này trả về một `Promise`, với đối số `void` khi server đã xác nhận việc đóng cửa sổ.

Đóng `window`. Ở phiên bản 1.16.5 trở xuống, server chỉ biết cửa sổ đã thay đổi những ô nào trong túi đồ vào tick tiếp theo của nó, vì vậy hãy await phương thức này trước khi bất cứ thứ gì khác (một lệnh, một người chơi khác) đụng tới các ô đó.

#### bot.transfer(options)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Chuyển một loại vật phẩm từ khoảng ô này sang khoảng ô khác. `options` là một đối tượng chứa:

 * `window` : Không bắt buộc. cửa sổ nơi vật phẩm sẽ được di chuyển
 * `itemType` : loại của các vật phẩm được di chuyển
 * `metadata` : Không bắt buộc. metadata của các vật phẩm được di chuyển
 * `sourceStart` và `sourceEnd` : khoảng ô nguồn. `sourceEnd` không bắt buộc và mặc định là `sourceStart` + 1
 * `destStart` và `destEnd` : khoảng ô đích. `destEnd` không bắt buộc và mặc định là `destStart` + 1
 * `count` : số lượng vật phẩm cần chuyển. Mặc định: `1`
 * `nbt` : dữ liệu nbt của vật phẩm cần chuyển. Mặc định: `nullish` (bỏ qua nbt)

#### bot.openBlock(block, direction?: Vec3, cursorPos?: Vec3)

Mở một khối, ví dụ một cái rương, trả về một promise của `Window` đang được mở.

 * `block` là khối mà bot sẽ mở.
 * `direction` Không bắt buộc, mặc định là `new Vec3(0, 1, 0)` (hướng lên). Một vector chỉ hướng tương tác với khối chứa đồ. Không có tác dụng khi mục tiêu là thực thể chứa đồ.
 * `cursorPos` Không bắt buộc, mặc định là `new Vec3(0.5, 0.5, 0.5)` (tâm khối). Vị trí con trỏ khi mở instance khối. Giá trị này được gửi kèm gói tin activate block. Không có tác dụng khi mục tiêu là thực thể chứa đồ.

#### bot.openEntity(entity)

Mở một thực thể có túi đồ, ví dụ một dân làng, trả về một promise của `Window` đang được mở.

 * `entity` là thực thể mà bot sẽ mở

#### bot.moveSlotItem(sourceSlot, destSlot)

Hàm này trả về một `Promise`, với đối số `void` khi hoàn tất.

Di chuyển một vật phẩm từ `sourceSlot` sang `destSlot` trong cửa sổ hiện tại.

#### bot.updateHeldItem()

Cập nhật `bot.heldItem`.

#### bot.getEquipmentDestSlot(destination)

Lấy id ô trang bị trong túi đồ ứng với tên vị trí trang bị đã cho.

Các vị trí khả dụng là:
* head
* torso
* legs
* feet
* hand
* off-hand

### bot.creative

Bộ api này hữu ích trong chế độ sáng tạo (creative).
Việc phát hiện và thay đổi chế độ chơi không được cài đặt ở đây,
nhưng các tính năng này giả định và thường yêu cầu bot phải ở chế độ sáng tạo để hoạt động.

#### bot.creative.setInventorySlot(slot, item)

Hàm này trả về một `Promise`, với đối số `void`, được kích hoạt khi server đặt xong ô.

Đưa cho bot vật phẩm đã chỉ định ở ô đã chỉ định trong túi đồ.

 * `slot` tính theo tọa độ cửa sổ túi đồ (trong đó 36 là ô đầu tiên của thanh công cụ nhanh, v.v.).
 * `item` là một instance [prismarine-item](https://github.com/PrismarineJS/prismarine-item) với metadata, nbtdata tùy ý, v.v.
    Nếu `item` là `null`, vật phẩm ở ô đã chỉ định sẽ bị xóa.

Nếu phương thức này thay đổi bất cứ điều gì, bạn có thể nhận thông báo qua `bot.inventory.on("updateSlot")`.

#### bot.creative.clearSlot(slot)

Hàm này trả về một `Promise`, với đối số `void`, được kích hoạt khi server xóa xong ô.

Đặt vật phẩm ở ô đã cho thành null.

 * `slot` tính theo tọa độ cửa sổ túi đồ (trong đó 36 là ô đầu tiên của thanh công cụ nhanh, v.v.).

#### bot.creative.clearInventory()

Hàm này trả về một `Promise`, với đối số `void`, được kích hoạt khi server xóa xong các ô.

#### bot.creative.flyTo(destination)

Hàm này trả về một `Promise`, với đối số `void` khi bot đã đến đích.

Gọi `startFlying()` rồi di chuyển với tốc độ không đổi trong không gian 3 chiều theo đường thẳng tới đích.
`destination` là một `Vec3`, và thường thì tọa độ `x` và `z` sẽ kết thúc bằng `.5`.
Thao tác này sẽ không hoạt động nếu có vật cản trên đường đi,
vì vậy bạn nên bay từng quãng rất ngắn một.

Phương thức này không thực hiện bất kỳ việc tìm đường nào.
Một cài đặt tìm đường được kỳ vọng sẽ dùng phương thức này để di chuyển < 2 khối mỗi lần.

Để trở lại vật lý bình thường, gọi `stopFlying()`.

#### bot.creative.startFlying()

Đặt `bot.physics.gravity` thành `0`.
Để trở lại vật lý bình thường, gọi `stopFlying()`.

Phương thức này hữu ích nếu bạn muốn lơ lửng trong khi đào phần đất bên dưới.
Không cần gọi hàm này trước khi gọi `flyTo()`.

Lưu ý rằng trong khi bay, `bot.entity.velocity` sẽ không chính xác.

#### bot.creative.stopFlying()

Khôi phục `bot.physics.gravity` về giá trị ban đầu.
