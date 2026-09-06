<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**สารบัญ**  *สร้างด้วย [DocToc](https://github.com/thlorenz/doctoc)*

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

Enum เหล่านี้ถูกเก็บไว้ในโปรเจกต์ [minecraft-data](https://github.com/PrismarineJS/minecraft-data) ที่ไม่ขึ้นกับภาษา
 และเข้าถึงได้ผ่าน [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)

### minecraft-data
ข้อมูลนี้มีอยู่ในโมดูล [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)

`require('minecraft-data')(bot.version)` ช่วยให้คุณเข้าถึงข้อมูลนี้ได้

### mcdata.blocks
บล็อกที่จัดทำดัชนีตาม id

### mcdata.items
ไอเทมที่จัดทำดัชนีตาม id

### mcdata.materials

key คือวัสดุ (material) ส่วน value เป็นอ็อบเจกต์ (object) ที่มี key เป็น item id
ของเครื่องมือ และ value เป็นตัวคูณประสิทธิภาพ (efficiency multiplier)

### mcdata.recipes
สูตรคราฟต์ (recipe) ที่จัดทำดัชนีตาม id

### mcdata.instruments
เครื่องดนตรีที่จัดทำดัชนีตาม id

### mcdata.biomes
ไบโอม (biome) ที่จัดทำดัชนีตาม id

### mcdata.entities
เอนทิตี (entity) ที่จัดทำดัชนีตาม id

## Classes

### vec3

ดู [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

จุดทั้งหมดใน mineflayer ถูกส่งมาเป็นอินสแตนซ์ของคลาสนี้

 * x - ใต้
 * y - ขึ้น
 * z - ตะวันตก

ฟังก์ชันและเมธอด (method) ที่ต้องการอาร์กิวเมนต์เป็นจุด รับได้ทั้งอินสแตนซ์ `Vec3`
รวมถึงอาเรย์ (array) ที่มีค่า 3 ค่า และอ็อบเจกต์ที่มีพร็อพเพอร์ตี (property) `x`, `y`, และ `z`

### mineflayer.Location

### Entity

เอนทิตีแทนผู้เล่น (player), ม็อบ (mob), และวัตถุต่าง ๆ มันถูกส่งออกมา
ในหลายอีเวนต์ (event) และคุณเข้าถึงเอนทิตีของตัวเองได้ด้วย `bot.entity`
ดู [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

#### Player Skin Data

ข้อมูลสกินถูกเก็บไว้ในพร็อพเพอร์ตี `skinData` ของอ็อบเจกต์ player หากมีอยู่

```js
// player.skinData
{
  url: 'http://textures.minecraft.net/texture/...',
  model: 'slim' // หรือ 'classic'
}
```

### Block

ดู [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

นอกจากนี้ `block.blockEntity` เป็นฟิลด์เพิ่มเติมที่มีข้อมูล block entity เป็น `Object` ข้อมูลในนี้แตกต่างกันไปในแต่ละเวอร์ชัน
```js
// ตัวอย่าง sign.blockEntity จาก 1.19
{
  GlowingText: 0, // 0 คือ false, 1 คือ true
  Color: 'black',
  Text1: '{"text":"1"}',
  Text2: '{"text":"2"}',
  Text3: '{"text":"3"}',
  Text4: '{"text":"4"}'
}
```

หมายเหตุ หากคุณต้องการดึงข้อความล้วน ๆ ของป้าย คุณสามารถใช้ [`block.getSignText()`](https://github.com/PrismarineJS/prismarine-block/blob/master/doc/API.md#sign) แทนการใช้ข้อมูล blockEntity ที่ไม่เสถียรได้
```java
> block = bot.blockAt(new Vec3(0, 60, 0)) // สมมติว่ามีป้ายอยู่ตรงนี้
> block.getSignText()
[ "Front text\nHello world", "Back text\nHello world" ]
```

### Biome

ดู [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

ดู [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

ดู [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

#### window.deposit(itemType, metadata, count, nbt)

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อฝากเสร็จ

 * `itemType` - item id ที่เป็นตัวเลข
 * `metadata` - ค่าตัวเลข `null` หมายถึงตรงกับอะไรก็ได้
 * `count` - จะฝากเท่าใด `null` เป็นชื่ออื่นของ 1
 * `nbt` - ให้ตรงกับข้อมูล nbt `null` คือไม่ต้องตรวจสอบ nbt

#### window.withdraw(itemType, metadata, count, nbt)

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อถอนเสร็จ จะ throw ข้อผิดพลาดหากบอท (bot) ไม่มีที่ว่างในช่องเก็บของ (inventory)

 * `itemType` - item id ที่เป็นตัวเลข
 * `metadata` - ค่าตัวเลข `null` หมายถึงตรงกับอะไรก็ได้
 * `count` - จะถอนเท่าใด `null` เป็นชื่ออื่นของ 1
 * `nbt` - ให้ตรงกับข้อมูล nbt `null` คือไม่ต้องตรวจสอบ nbt

#### window.close()

### Recipe

ดู [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Container

ขยาย windows.Window สำหรับหีบ (chest), ตู้แจกของ (dispenser), ฯลฯ...
ดู `bot.openContainer(chestBlock or minecartchestEntity)`

### mineflayer.Furnace

ขยาย windows.Window สำหรับเตาหลอม (furnace), เตาถลุง (smelter), ฯลฯ...
ดู `bot.openFurnace(furnaceBlock)`

#### furnace "update"

ทำงานเมื่อ `furnace.fuel` และ/หรือ `furnace.progress` อัปเดต

#### furnace.takeInput()

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `item` เมื่อเสร็จสมบูรณ์


#### furnace.takeFuel()

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `item` เมื่อเสร็จสมบูรณ์


#### furnace.takeOutput()

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `item` เมื่อเสร็จสมบูรณ์


#### furnace.putInput(itemType, metadata, count)

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อเสร็จสมบูรณ์

#### furnace.putFuel(itemType, metadata, count)

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อเสร็จสมบูรณ์

#### furnace.inputItem()

คืนค่าอินสแตนซ์ `Item` ซึ่งเป็นอินพุต

#### furnace.fuelItem()

คืนค่าอินสแตนซ์ `Item` ซึ่งเป็นเชื้อเพลิง

#### furnace.outputItem()

คืนค่าอินสแตนซ์ `Item` ซึ่งเป็นเอาต์พุต

#### furnace.fuel

เชื้อเพลิงที่เหลืออยู่เท่าใด ระหว่าง 0 ถึง 1

#### furnace.progress

อินพุตถูกหลอมไปแล้วเท่าใด ระหว่าง 0 ถึง 1

### mineflayer.EnchantmentTable

ขยาย windows.Window สำหรับโต๊ะร่ายมนตร์ (enchantment table)
ดู `bot.openEnchantmentTable(enchantmentTableBlock)`

#### enchantmentTable "ready"

ทำงานเมื่อ `enchantmentTable.enchantments` ถูกเติมข้อมูลครบถ้วน และคุณ
สามารถเลือกได้โดยเรียก `enchantmentTable.enchant(choice)`

#### enchantmentTable.targetItem()

ดึงไอเทมเป้าหมาย นี่คือทั้งอินพุตและเอาต์พุตของ
โต๊ะร่ายมนตร์

#### enchantmentTable.xpseed

ค่า xpseed ขนาด 16 บิตที่ส่งมาโดยเซิร์ฟเวอร์ (server)

#### enchantmentTable.enchantments

อาเรย์ความยาว 3 ซึ่งเป็นมนตร์ 3 อย่างให้เลือก
`level` อาจเป็น `-1` ได้หากเซิร์ฟเวอร์ยังไม่ได้ส่งข้อมูลมา

มีลักษณะดังนี้:

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

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `item` เมื่อไอเทมถูกร่ายมนตร์แล้ว

 * `choice` - [0-2], ดัชนีของมนตร์ที่คุณต้องการเลือก

#### enchantmentTable.takeTargetItem()

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `item` เมื่อเสร็จสมบูรณ์


#### enchantmentTable.putTargetItem(item)

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อเสร็จสมบูรณ์


#### enchantmentTable.putLapis(item)

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อเสร็จสมบูรณ์


### mineflayer.anvil

ขยาย windows.Window สำหรับทั่ง (anvil)
ดู `bot.openAnvil(anvilBlock)`

#### anvil.combine(itemOne, itemTwo[, name])

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อเสร็จสมบูรณ์


#### anvil.combine(item[, name])

ฟังก์ชันนี้คืนค่า `Promise` โดยมีอาร์กิวเมนต์เป็น `void` เมื่อเสร็จสมบูรณ์


#### villager "ready"

ทำงานเมื่อ `villager.trades` ถูกโหลดแล้ว

#### villager.trades

อาเรย์ของการแลกเปลี่ยน (trade)

มีลักษณะดังนี้:

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
เหมือนกับ [bot.trade(villagerInstance, tradeIndex, [times])](#bottradevillagerinstance-tradeindex-times)

### mineflayer.ScoreBoard

#### ScoreBoard.name

ชื่อของสกอร์บอร์ด (scoreboard)

#### ScoreBoard.title

ชื่อเรื่องของสกอร์บอร์ด (ไม่จำเป็นต้องเท่ากับ name เสมอไป)

#### ScoreBoard.itemsMap

อ็อบเจกต์ที่มีไอเทมทั้งหมดในสกอร์บอร์ดอยู่ในนั้น
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

อาเรย์ที่มีไอเทมทั้งหมดในสกอร์บอร์ดเรียงลำดับไว้แล้วอยู่ในนั้น
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.Team

#### Team.name

ชื่อของทีม

#### Team.friendlyFire

#### Team.nameTagVisibility

หนึ่งใน `always`, `hideForOtherTeams`, `hideForOwnTeam`

#### Team.collisionRule

หนึ่งใน `always`, `pushOtherTeams`, `pushOwnTeam`

#### Team.color

ชื่อสี (หรือการจัดรูปแบบ) ของทีม เช่น `dark_green`, `red`, `underlined`

#### Team.prefix

คอมโพเนนต์แชท (chat) ที่มีคำนำหน้าของทีม

#### Team.suffix

คอมโพเนนต์แชทที่มีคำต่อท้ายของทีม

#### Team.members

อาเรย์ของสมาชิกทีม เป็น Username สำหรับผู้เล่น และ UUID สำหรับเอนทิตีอื่น ๆ

### mineflayer.BossBar

#### BossBar.title

ชื่อเรื่องของบอสบาร์ เป็นอินสแตนซ์ของ ChatMessage

#### BossBar.health

เปอร์เซ็นต์พลังชีวิต (health) ของบอส ตั้งแต่ `0` ถึง `1`

#### BossBar.dividers

จำนวนเส้นแบ่งของบอสบาร์ หนึ่งใน `0`, `6`, `10`, `12`, `20`

#### BossBar.entityUUID

uuid ของเอนทิตีบอสบาร์

#### BossBar.shouldDarkenSky

กำหนดว่าจะทำให้ท้องฟ้ามืดลงหรือไม่

#### BossBar.isDragonBar

กำหนดว่าบอสบาร์เป็นบาร์ของมังกรหรือไม่

#### BossBar.createFog

กำหนดว่าบอสบาร์สร้างหมอกหรือไม่

#### BossBar.color

กำหนดว่าสีของบอสบาร์เป็นสีอะไร หนึ่งใน `pink`, `blue`, `red`, `green`, `yellow`, `purple`, `white`

### mineflayer.Particle

#### Particle.id

ID ของอนุภาค (particle) ตามที่กำหนดไว้ใน [protocol](https://minecraft.wiki/w/Protocol#Particle)

#### Particle.name

ชื่อของอนุภาค ตามที่กำหนดไว้ใน [protocol](https://minecraft.wiki/w/Protocol#Particle)

#### Particle.position

อินสแตนซ์ Vec3 ของตำแหน่งที่อนุภาคถูกสร้างขึ้น

#### Particle.offset

อินสแตนซ์ Vec3 ของออฟเซ็ตของอนุภาค

#### Particle.longDistanceRender

กำหนดว่าจะบังคับให้เรนเดอร์อนุภาคหรือไม่ แม้จะมีการตั้งค่าอนุภาคของไคลเอนต์ (client) อยู่ และเพิ่มระยะการมองเห็นสูงสุดจาก 256 เป็น 65536

#### Particle.count

จำนวนอนุภาคที่ถูกสร้างขึ้น

#### Particle.movementSpeed

ความเร็วของอนุภาคในทิศทางแบบสุ่ม
## Bot

### mineflayer.createBot(options)

สร้างและคืนค่าอินสแตนซ์ของคลาส bot
`options` คืออ็อบเจกต์ (object) ที่มีพร็อพเพอร์ตี (property) ทางเลือกต่าง ๆ ดังนี้ :
 * username : ค่าเริ่มต้นเป็น 'Player'
 * port : ค่าเริ่มต้นเป็น 25565
 * password : สามารถละเว้นได้ (ถ้าละเว้น token ด้วย ก็จะพยายามเชื่อมต่อในโหมดออฟไลน์)
 * host : ค่าเริ่มต้นเป็น localhost
 * version : ค่าเริ่มต้นจะเดาเวอร์ชันของเซิร์ฟเวอร์ (server) ให้อัตโนมัติ ตัวอย่างค่า : "1.12.2"
 * auth : ค่าเริ่มต้นเป็น 'mojang' สามารถเป็น 'microsoft' ได้ด้วย
 * clientToken : สร้างให้เมื่อมีการระบุ password
 * accessToken : สร้างให้เมื่อมีการระบุ password
 * logErrors : ค่าเริ่มต้นเป็น true จะดักจับ error และบันทึก log ไว้
 * hideErrors : ค่าเริ่มต้นเป็น true จะไม่บันทึก log ของ error (แม้ว่า logErrors จะเป็น true ก็ตาม)
 * keepAlive : ส่งแพ็กเก็ต keep alive : ค่าเริ่มต้นเป็น true
 * checkTimeoutInterval : ค่าเริ่มต้นเป็น `30*1000` (30 วินาที) ตรวจสอบว่าได้รับ keepalive ในช่วงเวลานั้นหรือไม่ ถ้าไม่ได้รับจะตัดการเชื่อมต่อ
 * loadInternalPlugins : ค่าเริ่มต้นเป็น true
 * storageBuilder : ฟังก์ชันทางเลือก รับอาร์กิวเมนต์เป็น version และ worldName แล้วคืนค่าอินสแตนซ์ของบางสิ่งที่มี API เหมือนกับ prismarine-provider-anvil ใช้สำหรับบันทึกโลก (world)
 * client : อินสแตนซ์ของ node-minecraft-protocol ถ้าไม่ระบุ mineflayer จะสร้าง client ของตัวเอง สามารถใช้สิ่งนี้เพื่อให้ mineflayer ทำงานผ่าน proxy ของไคลเอนต์ (client) หลายตัว หรือไคลเอนต์ vanilla หนึ่งตัวคู่กับไคลเอนต์ mineflayer ได้
 * brand : ชื่อ brand ที่ให้ไคลเอนต์ใช้ ค่าเริ่มต้นเป็น vanilla สามารถใช้จำลองไคลเอนต์ที่กำหนดเองสำหรับเซิร์ฟเวอร์ที่ต้องการได้
 * respawn : เมื่อตั้งเป็น false จะปิดไม่ให้บอท (bot) สปอว์น (spawn) ใหม่อัตโนมัติ ค่าเริ่มต้นเป็น true
 * plugins : object : ค่าเริ่มต้นเป็น {}
   - pluginName : false : ไม่โหลดปลั๊กอิน (plugin) ภายในที่มีชื่อตามที่ระบุ เช่น `pluginName`
   - pluginName : true : โหลดปลั๊กอินภายในที่มีชื่อตามที่ระบุ เช่น `pluginName` แม้ว่า loadInternalplugins จะถูกตั้งเป็น false ก็ตาม
   - pluginName : ฟังก์ชัน inject ของปลั๊กอินภายนอก : โหลดปลั๊กอินภายนอก โดยทับปลั๊กอินภายในที่มีชื่อตามที่ระบุ เช่น `pluginName`
 * physicsEnabled : ค่าเริ่มต้นเป็น true บอทควรได้รับผลกระทบจากฟิสิกส์หรือไม่? สามารถแก้ไขภายหลังได้ผ่าน bot.physicsEnabled
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * [enableTextFiltering](#bot.settings.enableTextFiltering)
 * [enableServerListing](#bot.settings.enableServerListing)
 * chatLengthLimit : จำนวนตัวอักษรสูงสุดที่สามารถส่งได้ในข้อความเดียว ถ้าไม่ได้ตั้งค่านี้ จะเป็น 100 ในเวอร์ชัน < 1.11 และ 256 ในเวอร์ชัน >= 1.11
 * defaultChatPatterns: ค่าเริ่มต้นเป็น true ตั้งเป็น false เพื่อไม่เพิ่มรูปแบบ (pattern) เช่น chat และ whisper

### Properties

#### bot.registry

อินสแตนซ์ของ minecraft-data ที่บอทใช้ ส่งสิ่งนี้ให้ constructor ที่ต้องการอินสแตนซ์ของ minecraft-data เช่น prismarine-block

#### bot.world

ตัวแทนแบบ sync ของโลก ดูเอกสารได้ที่ http://github.com/PrismarineJS/prismarine-world

##### world "blockUpdate" (oldBlock, newBlock)

เกิดขึ้นเมื่อบล็อก (block) มีการอัปเดต โดยให้ทั้ง `oldBlock` และ `newBlock` มาเพื่อ
เปรียบเทียบ
`oldBlock` อาจเป็น `null` ในการอัปเดตบล็อกปกติ

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

เกิดขึ้นสำหรับจุดที่ระบุ โดยให้ทั้ง `oldBlock` และ `newBlock` มาเพื่อ
เปรียบเทียบ ตัวรับฟัง (listener) ทุกตัวจะได้รับ null สำหรับ `oldBlock` และ `newBlock` และจะถูกลบออกอัตโนมัติเมื่อโลกถูก unload
`oldBlock` อาจเป็น `null` ในการอัปเดตบล็อกปกติ


#### bot.entity

เอนทิตี (entity) ของคุณเอง ดู `Entity`

#### bot.entities

เอนทิตีทั้งหมดที่อยู่ใกล้ ๆ อ็อบเจกต์นี้เป็น map จาก entityId ไปยัง entity

#### bot.username

ใช้สิ่งนี้เพื่อหาชื่อของคุณเอง

#### bot.spawnPoint

พิกัดของจุดสปอว์นหลัก ซึ่งเข็มทิศทุกอันจะชี้ไปที่จุดนั้น

#### bot.heldItem

ไอเทมที่อยู่ในมือของบอท แสดงเป็นอินสแตนซ์ของ [prismarine-item](https://github.com/PrismarineJS/prismarine-item) ที่ระบุพร้อม metadata, nbtdata และอื่น ๆ ตามต้องการ

#### bot.usingHeldItem

บอทกำลังใช้ไอเทมที่ถืออยู่หรือไม่ เช่น การกินอาหารหรือการใช้โล่

#### bot.game.levelType

#### bot.game.dimension

มิติปัจจุบันของบอท เช่น `overworld`, `the_end` หรือ `the_nether`

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

#### bot.game.serverBrand

#### bot.game.minY

ค่า y ต่ำสุดของโลก

#### bot.game.height

ความสูงของโลก

#### bot.physicsEnabled

เปิดใช้งานฟิสิกส์ ค่าเริ่มต้นเป็น true

#### bot.player

อ็อบเจกต์ player ของบอท
```js
{
  username: 'player',
  displayName: { toString: Function }, // อ็อบเจกต์ ChatMessage
  gamemode: 0,
  ping: 28,
  entity: entity // null ถ้าคุณอยู่ไกลเกินไป
}
```

ค่า ping ของผู้เล่น (player) จะเริ่มต้นที่ 0 คุณอาจต้องรอสักครู่ให้เซิร์ฟเวอร์ส่งค่า ping จริงมา

#### bot.players

map จาก username ไปยังผู้คนที่กำลังเล่นเกม

#### bot.tablist

อ็อบเจกต์ tablist ของบอทมีสอง key คือ `header` และ `footer`

```js
{
  header: { toString: Function }, // อ็อบเจกต์ ChatMessage
  footer: { toString: Function } // อ็อบเจกต์ ChatMessage
}
```

#### bot.isRaining

#### bot.rainState

ตัวเลขที่บ่งบอกระดับฝนปัจจุบัน เมื่อไม่มีฝนตก ค่านี้
จะเท่ากับ 0 เมื่อเริ่มมีฝนตก ค่านี้จะเพิ่มขึ้น
ทีละน้อยจนถึง 1 เมื่อฝนหยุดตก ค่านี้จะค่อย ๆ ลดลงกลับไปที่ 0

ทุกครั้งที่ `bot.rainState` เปลี่ยนแปลง จะมีการ emit อีเวนต์ (event) "weatherUpdate"

#### bot.thunderState

ตัวเลขที่บ่งบอกระดับฟ้าร้องปัจจุบัน เมื่อไม่มีพายุฝนฟ้าคะนอง ค่านี้
จะเท่ากับ 0 เมื่อพายุฝนฟ้าคะนองเริ่มขึ้น ค่านี้จะเพิ่มขึ้น
ทีละน้อยจนถึง 1 เมื่อพายุฝนฟ้าคะนองหยุด ค่านี้จะค่อย ๆ ลดลงกลับไปที่ 0

ทุกครั้งที่ `bot.thunderState` เปลี่ยนแปลง จะมีการ emit อีเวนต์ "weatherUpdate"

ค่านี้เหมือนกับ `bot.rainState` แต่ใช้กับพายุฝนฟ้าคะนอง
สำหรับพายุฝนฟ้าคะนอง ทั้ง `bot.rainState` และ `bot.thunderState` จะเปลี่ยนแปลง

#### bot.chatPatterns

นี่คืออาเรย์ (array) ของอ็อบเจกต์ pattern ในรูปแบบต่อไปนี้:
{ /regex/, "chattype", "description")
 * /regex/ - รูปแบบ regular expression ที่ควรมีกลุ่มจับ (capture group) อย่างน้อยสองกลุ่ม
 * 'chattype' - ประเภทของแชท (chat) ที่ pattern จับคู่ เช่น "chat" หรือ "whisper" แต่จะเป็นอะไรก็ได้
 * 'description' - คำอธิบายว่า pattern นี้ใช้ทำอะไร เป็นทางเลือก

#### bot.settings.chat

ตัวเลือก:

 * `enabled` (ค่าเริ่มต้น)
 * `commandsOnly`
 * `disabled`

#### bot.settings.colorsEnabled

ค่าเริ่มต้นเป็น true ว่าคุณจะได้รับรหัสสี (color code) ในแชทจากเซิร์ฟเวอร์หรือไม่

#### bot.settings.viewDistance

เป็น string ที่ระบุไว้ด้านล่างหรือเป็นตัวเลขบวกก็ได้
ตัวเลือก:
 * `far` (ค่าเริ่มต้น)
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

เหมือนกับใน server.properties

#### bot.settings.skinParts

การตั้งค่าแบบ boolean เหล่านี้ควบคุมว่ารายละเอียดสกินเสริมบนสกินของผู้เล่นตัวเองควรมองเห็นได้หรือไม่

##### bot.settings.skinParts.showCape - boolean

ถ้าคุณมีผ้าคลุม คุณสามารถปิดได้โดยตั้งค่านี้เป็น false

##### bot.settings.skinParts.showJacket - boolean

##### bot.settings.skinParts.showLeftSleeve - boolean

##### bot.settings.skinParts.showRightSleeve - boolean

##### bot.settings.skinParts.showLeftPants - boolean

##### bot.settings.skinParts.showRightPants - boolean

##### bot.settings.skinParts.showHat - boolean

#### bot.settings.enableTextFiltering - boolean
ไม่ได้ใช้งาน ค่าเริ่มต้นเป็น false ในไคลเอนต์ Notchian (Vanilla)
#### bot.settings.enableServerListing - boolean
การตั้งค่านี้จะถูกส่งไปยังเซิร์ฟเวอร์เพื่อกำหนดว่าผู้เล่นควรปรากฏในรายการเซิร์ฟเวอร์หรือไม่
#### bot.experience.level

#### bot.experience.points

แต้มประสบการณ์ทั้งหมด

#### bot.experience.progress

ค่าระหว่าง 0 ถึง 1 - ปริมาณที่ต้องการเพื่อไปยังเลเวลถัดไป

#### bot.health

ตัวเลขในช่วง [0, 20] แทนจำนวนครึ่งหัวใจ

#### bot.food

ตัวเลขในช่วง [0, 20] แทนจำนวนครึ่งขาไก่งวง

#### bot.foodSaturation

ค่าความอิ่ม (food saturation) ทำหน้าที่เป็น "พลังอาหารส่วนเกิน" ค่าอาหารจะไม่ลดลง
ขณะที่ค่าความอิ่มมากกว่าศูนย์ ผู้เล่นที่ล็อกอินเข้ามาจะได้รับ
ค่าความอิ่มเริ่มต้น 5.0 อัตโนมัติ การกินอาหารจะเพิ่มทั้งค่าความอิ่มและแถบอาหาร

#### bot.oxygenLevel

ตัวเลขในช่วง [0, 20] แทนจำนวนไอคอนน้ำที่เรียกว่าระดับออกซิเจน

#### bot.physics

แก้ไขตัวเลขเหล่านี้เพื่อปรับแรงโน้มถ่วง ความเร็วการกระโดด ความเร็วสูงสุด และอื่น ๆ
ทำสิ่งนี้ด้วยความเสี่ยงของคุณเอง

#### bot.fireworkRocketDuration

เหลือ physics tick กี่ tick ของแรงดันจากจรวดดอกไม้ไฟ

#### bot.simpleClick.leftMouse (slot)

นามธรรม (abstraction) ของ `bot.clickWindow(slot, 0, 0)`

#### bot.simpleClick.rightMouse (slot)

นามธรรมของ `bot.clickWindow(slot, 1, 0)`

#### bot.time.doDaylightCycle

gamerule doDaylightCycle เป็น true หรือ false

#### bot.time.bigTime

จำนวน tick ทั้งหมดนับตั้งแต่วันที่ 0

ค่านี้เป็นชนิด BigInt และมีความแม่นยำแม้กับค่าที่ใหญ่มาก (มากกว่า 2^51 - 1 tick)

#### bot.time.time

จำนวน tick ทั้งหมดนับตั้งแต่วันที่ 0

เนื่องจากขีดจำกัด Number ของ Javascript อยู่ที่ 2^51 - 1 ค่า bot.time.time จึงไม่แม่นยำเมื่อสูงเกินขีดจำกัดนี้ และแนะนำให้ใช้ bot.time.bigTime
อย่างไรก็ตามในความเป็นจริงคุณอาจไม่จำเป็นต้องใช้ bot.time.bigTime เลย เพราะมันจะถึง 2^51 - 1 tick ตามธรรมชาติหลังจากผ่านไปประมาณ 14280821 ปีจริงเท่านั้น

#### bot.time.timeOfDay

เวลาของวัน หน่วยเป็น tick

เวลาอิงตาม tick โดยมี 20 tick เกิดขึ้นทุกวินาที ใน 1 วันมี 24000
tick ทำให้วันใน Minecraft ยาวพอดี 20 นาที

เวลาของวันอิงตาม timestamp modulo 24000 โดย 0 คือพระอาทิตย์ขึ้น 6000
คือเที่ยงวัน 12000 คือพระอาทิตย์ตก และ 18000 คือเที่ยงคืน

#### bot.time.day

วันของโลก

#### bot.time.isDay

เป็นกลางวันหรือไม่

อิงตามว่าเวลาของวันปัจจุบันอยู่ระหว่าง 0 ถึง 13000 tick หรือไม่ (กลางวัน + พระอาทิตย์ตก)

#### bot.time.moonPhase

ข้างขึ้นข้างแรมของดวงจันทร์

0-7 โดย 0 คือพระจันทร์เต็มดวง

#### bot.time.bigAge

อายุของโลก หน่วยเป็น tick

ค่านี้เป็นชนิด BigInt และมีความแม่นยำแม้กับค่าที่ใหญ่มาก (มากกว่า 2^51 - 1 tick)

#### bot.time.age

อายุของโลก หน่วยเป็น tick

เนื่องจากขีดจำกัด Number ของ Javascript อยู่ที่ 2^51 - 1 ค่า bot.time.age จึงไม่แม่นยำเมื่อสูงเกินขีดจำกัดนี้ และแนะนำให้ใช้ bot.time.bigAge
อย่างไรก็ตามในความเป็นจริงคุณอาจไม่จำเป็นต้องใช้ bot.time.bigAge เลย เพราะมันจะถึง 2^51 - 1 tick ตามธรรมชาติหลังจากผ่านไปประมาณ 14280821 ปีจริงเท่านั้น

#### bot.quickBarSlot

ช่อง quick bar ใดที่ถูกเลือก (0 - 8)

#### bot.inventory

อินสแตนซ์ [`Window`](https://github.com/PrismarineJS/prismarine-windows#windowswindow-base-class) ที่แทนช่องเก็บของ (inventory) ของคุณ

#### bot.targetDigBlock

`block` ที่คุณกำลังขุด (dig) อยู่ หรือ `null`

#### bot.isSleeping

Boolean ว่าคุณอยู่บนเตียงหรือไม่

#### bot.scoreboards

scoreboard ทั้งหมดที่บอทรู้จัก ในรูปอ็อบเจกต์จากชื่อ scoreboard -> scoreboard

#### bot.scoreboard

scoreboard ทั้งหมดที่บอทรู้จัก ในรูปอ็อบเจกต์จาก displaySlot ของ scoreboard -> scoreboard

 * `belowName` - scoreboard ที่วางใน belowName
 * `sidebar` - scoreboard ที่วางใน sidebar
 * `list` - scoreboard ที่วางใน list
 * `0-18` - ช่องที่กำหนดไว้ใน [protocol](https://minecraft.wiki/w/Protocol#Display_Scoreboard)

#### bot.teams

ทีมทั้งหมดที่บอทรู้จัก

#### bot.teamMap

การ map สมาชิกไปยังทีม ใช้ username สำหรับผู้เล่น และ UUID สำหรับเอนทิตี

#### bot.controlState

อ็อบเจกต์ที่มี key เป็นสถานะการควบคุมหลัก: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']

การตั้งค่าให้อ็อบเจกต์นี้จะเรียก [bot.setControlState](#botsetcontrolstatecontrol-state) ภายในให้เอง
### Events

#### "chat" (username, message, translate, jsonMsg, matches)

จะถูก emit เฉพาะเมื่อผู้เล่นแชทแบบสาธารณะเท่านั้น

 * `username` - ใครเป็นคนพูดข้อความนี้ (เทียบกับ `bot.username` เพื่อเพิกเฉยแชทของตัวเอง)
 * `message` - ตัดสีและอักขระควบคุมออกทั้งหมดแล้ว
 * `translate` - ชนิดของข้อความแชท เป็น Null สำหรับข้อความแชทของ bukkit ส่วนใหญ่
 * `jsonMsg` - ข้อความ JSON จากเซิร์ฟเวอร์ (server) แบบไม่ดัดแปลง
 * `matches` - อาเรย์ (array) ของผลลัพธ์ที่ match ได้จาก regular expression อาจเป็น null

#### "whisper" (username, message, translate, jsonMsg, matches)

จะถูก emit เฉพาะเมื่อผู้เล่นแชทกับคุณแบบส่วนตัวเท่านั้น

 * `username` - ใครเป็นคนพูดข้อความนี้
 * `message` - ตัดสีและอักขระควบคุมออกทั้งหมดแล้ว
 * `translate` - ชนิดของข้อความแชท เป็น Null สำหรับข้อความแชทของ bukkit ส่วนใหญ่
 * `jsonMsg` - ข้อความ JSON จากเซิร์ฟเวอร์แบบไม่ดัดแปลง
 * `matches` - อาเรย์ของผลลัพธ์ที่ match ได้จาก regular expression อาจเป็น null

#### "actionBar" (jsonMsg, verified)

ถูก emit สำหรับทุกข้อความจากเซิร์ฟเวอร์ที่ปรากฏบน Action Bar

 * `jsonMsg` - ข้อความ JSON จากเซิร์ฟเวอร์แบบไม่ดัดแปลง
 * `verified` -> null ถ้าไม่ได้เซ็น, true ถ้าเซ็นและถูกต้อง, false ถ้าเซ็นและไม่ถูกต้อง

#### "message" (jsonMsg, position, sender, verified)

ถูก emit สำหรับทุกข้อความจากเซิร์ฟเวอร์ รวมถึงข้อความแชทด้วย

 * `jsonMsg` - อ็อบเจกต์ (object) [ChatMessage](https://github.com/PrismarineJS/prismarine-chat) ที่บรรจุข้อความแชทที่จัดรูปแบบแล้ว อาจมีพร็อพเพอร์ตี (property) เพิ่มเติมดังนี้:
   * unsigned - อ็อบเจกต์ ChatMessage ที่ไม่ได้เซ็น มีเฉพาะใน 1.19.2+ และเฉพาะเมื่อเซิร์ฟเวอร์อนุญาตแชทแบบไม่ปลอดภัยและเซิร์ฟเวอร์ดัดแปลงข้อความแชทโดยไม่มีลายเซ็นของผู้ใช้

 * `position` - (>= 1.8.1): ตำแหน่งของข้อความแชทอาจเป็น
   * chat
   * system
   * game_info

 * `sender` - UUID ของผู้ส่งหากทราบ (1.16+) มิฉะนั้นเป็น null

 * `verified` -> null ถ้าไม่ได้เซ็น, true ถ้าเซ็นและถูกต้อง, false ถ้าเซ็นและไม่ถูกต้อง

#### "messagestr" (message, messagePosition, jsonMsg, sender, verified)

เป็น alias ของอีเวนต์ (event) "message" แต่จะเรียก .toString() บนอ็อบเจกต์ prismarine-message เพื่อให้ได้ string ของข้อความก่อนที่จะ emit

 * `sender` - UUID ของผู้ส่งหากทราบ (1.16+) มิฉะนั้นเป็น null

 * `verified` -> null ถ้าไม่ได้เซ็น, true ถ้าเซ็นและถูกต้อง, false ถ้าเซ็นและไม่ถูกต้อง

#### "inject_allowed"
จะ fire เมื่อไฟล์ index ถูกโหลดแล้ว คุณสามารถโหลด mcData และปลั๊กอิน (plugin) ได้ที่นี่ แต่ควรรออีเวนต์ "spawn" จะดีกว่า

#### "login"

จะ fire หลังจากคุณ login เข้าสู่เซิร์ฟเวอร์สำเร็จ
คุณน่าจะอยากรออีเวนต์ `spawn`
ก่อนที่จะทำอะไรก็ตาม

#### "spawn"

ถูก emit หนึ่งครั้งหลังจากที่คุณ login และสปอว์น (spawn) เป็นครั้งแรก
และจากนั้นจะถูก emit เมื่อคุณ respawn หลังจากตาย

โดยปกติแล้วนี่คืออีเวนต์ที่คุณต้องการรอฟัง
ก่อนที่จะทำอะไรก็ตามบนเซิร์ฟเวอร์

#### "respawn"

ถูก emit เมื่อคุณเปลี่ยนมิติและก่อนที่คุณจะสปอว์นเล็กน้อย
โดยปกติคุณจะอยากเพิกเฉยอีเวนต์นี้และรอจนกว่าอีเวนต์ "spawn"
แทน

#### "game"

ถูก emit เมื่อเซิร์ฟเวอร์เปลี่ยนพร็อพเพอร์ตีใด ๆ ของเกม

#### "resourcePack" (url, hash)

ถูก emit เมื่อเซิร์ฟเวอร์ส่ง resource pack มา

#### "title" (title, type)

ถูก emit เมื่อเซิร์ฟเวอร์ส่ง title มา

* `title` - ข้อความของ title
* `type` - ชนิดของ title "subtitle", "title"

#### "title_times" (fadeIn, stay, fadeOut)

ถูก emit เมื่อเซิร์ฟเวอร์ส่งแพ็กเก็ต title times มา (เช่น เมื่อมีการตั้งค่าหรืออัปเดตเวลา fade-in, stay และ fade-out สำหรับ title)

 * `fadeIn` - เวลา fade-in เป็น tick (number)
 * `stay` - เวลา stay เป็น tick (number)
 * `fadeOut` - เวลา fade-out เป็น tick (number)

ตัวอย่าง:

```js
bot.on('title_times', (fadeIn, stay, fadeOut) => {
  console.log(`Title times: fadeIn=${fadeIn}, stay=${stay}, fadeOut=${fadeOut}`)
})
```

#### "title_clear"

ถูก emit เมื่อเซิร์ฟเวอร์เคลียร์ title ทั้งหมด

#### "rain"

ถูก emit เมื่อฝนเริ่มตกหรือหยุดตก ถ้าคุณเข้าร่วม
เซิร์ฟเวอร์ที่ฝนกำลังตกอยู่แล้ว อีเวนต์นี้จะ fire

#### "weatherUpdate"

ถูก emit เมื่อ `bot.thunderState` หรือ `bot.rainState` เปลี่ยนแปลง
ถ้าคุณเข้าร่วมเซิร์ฟเวอร์ที่ฝนกำลังตกอยู่แล้ว อีเวนต์นี้จะ fire

#### "time"

ถูก emit เมื่อเซิร์ฟเวอร์ส่งการอัปเดตเวลา ดูที่ `bot.time`

#### "kicked" (reason, loggedIn)

ถูก emit เมื่อบอท (bot) ถูกเตะออกจากเซิร์ฟเวอร์ `reason`
คือข้อความแชทที่อธิบายว่าทำไมคุณถึงถูกเตะ `loggedIn`
เป็น `true` ถ้าไคลเอนต์ (client) ถูกเตะหลังจาก login สำเร็จ
หรือ `false` ถ้าการเตะเกิดขึ้นในช่วง login

#### "end" (reason)

ถูก emit เมื่อคุณไม่ได้เชื่อมต่อกับเซิร์ฟเวอร์อีกต่อไป
`reason` เป็น string ที่อธิบายว่าทำไมไคลเอนต์ถึงถูกตัดการเชื่อมต่อ (ค่าเริ่มต้นคือ 'socketClosed')

#### "error" (err)

ถูก emit เมื่อเกิดข้อผิดพลาด

#### "spawnReset"

จะ fire เมื่อคุณไม่สามารถสปอว์นในเตียงของคุณได้และจุดสปอว์นของคุณถูกรีเซ็ต

#### "death"

จะ fire เมื่อคุณตาย

#### "health"

จะ fire เมื่อ hp หรือค่าอาหารของคุณเปลี่ยนแปลง

#### "breath"

จะ fire เมื่อระดับออกซิเจนของคุณเปลี่ยนแปลง

#### "entityAttributes" (entity)

จะ fire เมื่อ attribute ของเอนทิตี (entity) เปลี่ยนแปลง

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

เอนทิตีเริ่มบินด้วยอีลิทรา (elytra)

#### "itemDrop" (entity)
#### "playerCollect" (collector, collected)

เอนทิตีเก็บไอเทมขึ้นมา

 * `collector` - เอนทิตีที่เก็บไอเทมขึ้นมา
 * `collected` - เอนทิตีที่เป็นไอเทมบนพื้น

#### "entityGone" (entity)
#### "entityMoved" (entity)
#### "entityDetach" (entity, vehicle)
#### "entityAttach" (entity, vehicle)

เอนทิตีถูกผูกติดกับยานพาหนะ เช่น รถราง (mine cart)
หรือเรือ

 * `entity` - เอนทิตีที่กำลังโดยสารไปด้วย
 * `vehicle` - เอนทิตีที่เป็นยานพาหนะ

#### "entityUpdate" (entity)
#### "entityEffect" (entity, effect)
#### "entityEffectEnd" (entity, effect)
#### "playerJoined" (player)
#### "playerUpdated" (player)
#### "playerLeft" (player)

#### "blockUpdate" (oldBlock, newBlock)

(ควรใช้อีเวนต์นี้จาก bot.world แทนการใช้จาก bot โดยตรง) จะ fire เมื่อบล็อก (block) อัปเดต โดยให้ทั้ง `oldBlock` และ `newBlock` มาเพื่อ
เปรียบเทียบ

โปรดทราบว่า `oldBlock` อาจเป็น `null`

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(ควรใช้อีเวนต์นี้จาก bot.world แทนการใช้จาก bot โดยตรง) จะ fire สำหรับจุดที่ระบุเฉพาะเจาะจง โดยให้ทั้ง `oldBlock` และ `newBlock` มาเพื่อ
เปรียบเทียบ

โปรดทราบว่า `oldBlock` อาจเป็น `null`

#### "blockPlaced" (oldBlock, newBlock)

จะ fire เมื่อบอทวางบล็อก โดยให้ทั้ง `oldBlock` และ `newBlock` มาเพื่อ
เปรียบเทียบ

โปรดทราบว่า `oldBlock` อาจเป็น `null`

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

จะ fire เมื่อชังก์ (chunk) มีการอัปเดต `point` คือพิกัดของมุม
ของชังก์ที่มีค่า x, y และ z น้อยที่สุด

#### "soundEffectHeard" (soundName, position, volume, pitch)

จะ fire เมื่อไคลเอนต์ได้ยินเสียงเอฟเฟกต์ที่มีชื่อ

 * `soundName`: ชื่อของเสียงเอฟเฟกต์
 * `position`: instance ของ Vec3 ที่เป็นจุดกำเนิดของเสียง
 * `volume`: ระดับความดังแบบ floating point, 1.0 คือ 100%
 * `pitch`: ระดับเสียง (pitch) แบบ integer, 63 คือ 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

  จะ fire เมื่อไคลเอนต์ได้ยินเสียงเอฟเฟกต์แบบ hardcoded

   * `soundId`: id ของเสียงเอฟเฟกต์
   * `soundCategory`: หมวดหมู่ของเสียงเอฟเฟกต์
   * `position`: instance ของ Vec3 ที่เป็นจุดกำเนิดของเสียง
   * `volume`: ระดับความดังแบบ floating point, 1.0 คือ 100%
   * `pitch`: ระดับเสียง (pitch) แบบ integer, 63 คือ 100%

#### "noteHeard" (block, instrument, pitch)

จะ fire เมื่อ note block ดังขึ้นที่ใดที่หนึ่ง

 * `block`: instance ของ Block ซึ่งเป็นบล็อกที่เปล่งเสียงออกมา
 * `instrument`:
   - `id`: id แบบ integer
   - `name`: หนึ่งใน [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`]
 * `pitch`: ระดับเสียงของโน้ต (อยู่ระหว่าง 0-24 รวมค่าปลาย โดย 0 คือ
   ต่ำสุดและ 24 คือสูงสุด) ข้อมูลเพิ่มเติมเกี่ยวกับวิธีที่ค่า pitch
   สัมพันธ์กับโน้ตในชีวิตจริงมีอยู่ใน
   [วิกิ Minecraft อย่างเป็นทางการ](http://minecraft.wiki/w/Note_Block)

#### "pistonMove" (block, isPulling, direction)

#### "chestLidMove" (block, isOpen, block2)
* `block`: instance ของ Block ซึ่งเป็นบล็อกที่ฝาเปิด เป็นบล็อกฝั่งขวาถ้าเป็นหีบคู่ (double chest)
* `isOpen`: จำนวนผู้เล่นที่เปิดหีบ (chest) อยู่ เป็น 0 ถ้าปิดอยู่
* `block2`: instance ของ Block ซึ่งเป็นอีกครึ่งหนึ่งของบล็อกที่ฝาเปิด เป็น null ถ้าไม่ใช่หีบคู่

#### "blockBreakProgressObserved" (block, destroyStage, entity)

จะ fire เมื่อไคลเอนต์สังเกตเห็นบล็อกที่กำลังอยู่ในกระบวนการถูกทำลาย

 * `block`: instance ของ Block ซึ่งเป็นบล็อกที่กำลังถูกทำลาย
 * `destroyStage`: integer ที่สอดคล้องกับความคืบหน้าของการทำลาย (0-9)
 * `entity`: เอนทิตีที่กำลังทำลายบล็อก

#### "blockBreakProgressEnd" (block, entity)

จะ fire เมื่อไคลเอนต์สังเกตเห็นบล็อกหยุดถูกทำลาย
สิ่งนี้เกิดขึ้นไม่ว่ากระบวนการจะเสร็จสมบูรณ์หรือถูกยกเลิก

 * `block`: instance ของ Block ซึ่งเป็นบล็อกที่ไม่ได้ถูกทำลายอีกต่อไป
 * `entity`: เอนทิตีที่หยุดทำลายบล็อก

#### "diggingCompleted" (block)

 * `block` - บล็อกที่ไม่มีอยู่อีกต่อไปแล้ว

#### "diggingAborted" (block)

 * `block` - บล็อกที่ยังคงมีอยู่

#### "usedFirework" (fireworkEntityId)

จะ fire เมื่อบอทใช้พลุขณะบินด้วยอีลิทรา

 * `fireworkEntityId` - entity id ของพลุ

#### "move"

จะ fire เมื่อบอทเคลื่อนที่ ถ้าคุณต้องการตำแหน่งปัจจุบัน ให้ใช้
`bot.entity.position` และสำหรับการเคลื่อนที่ปกติ ถ้าคุณต้องการตำแหน่งก่อนหน้า ให้ใช้
`bot.entity.position.minus(bot.entity.velocity)`

#### "forcedMove"

จะ fire เมื่อบอทถูกบังคับให้เคลื่อนที่โดยเซิร์ฟเวอร์ (เทเลพอร์ต, สปอว์น, ...) ถ้าคุณต้องการตำแหน่งปัจจุบัน ให้ใช้
`bot.entity.position`

#### "mount"

จะ fire เมื่อคุณขึ้นขี่เอนทิตี เช่น รถราง หากต้องการเข้าถึง
เอนทิตีนั้น ให้ใช้ `bot.vehicle`

หากต้องการขึ้นขี่เอนทิตี ให้ใช้ `mount`

#### "dismount" (vehicle)

จะ fire เมื่อคุณลงจากเอนทิตี

#### "windowOpen" (window)

จะ fire เมื่อคุณเริ่มใช้โต๊ะทำงาน (workbench), หีบ, แท่นต้มยา ฯลฯ

#### "windowClose" (window)

จะ fire เมื่อคุณไม่สามารถทำงานกับโต๊ะทำงาน, หีบ ฯลฯ ได้อีกต่อไป

#### "sleep"

จะ fire เมื่อคุณนอนหลับ

#### "wake"

จะ fire เมื่อคุณตื่นนอน

#### "experience"

จะ fire เมื่อ `bot.experience.*` มีการอัปเดต

#### "scoreboardCreated" (scoreboard)

จะ fire เมื่อมีการเพิ่ม scoreboard

#### "scoreboardDeleted" (scoreboard)

จะ fire เมื่อมีการลบ scoreboard

#### "scoreboardTitleChanged" (scoreboard)

จะ fire เมื่อ title ของ scoreboard ถูกอัปเดต

#### "scoreUpdated" (scoreboard, item)

จะ fire เมื่อคะแนนของ item ใน scoreboard ถูกอัปเดต

#### "scoreRemoved" (scoreboard, item)

จะ fire เมื่อคะแนนของ item ใน scoreboard ถูกลบ

#### "scoreboardPosition" (position, scoreboard)

จะ fire เมื่อตำแหน่งของ scoreboard ถูกอัปเดต

#### "teamCreated" (team)

จะ fire เมื่อมีการเพิ่มทีม

#### "teamRemoved" (team)

จะ fire เมื่อมีการลบทีม

#### "teamUpdated" (team)

จะ fire เมื่อทีมถูกอัปเดต

#### "teamMemberAdded" (team)

จะ fire เมื่อมีการเพิ่มสมาชิกทีมหนึ่งคนหรือหลายคนเข้าไปในทีม

#### "teamMemberRemoved" (team)

จะ fire เมื่อมีการลบสมาชิกทีมหนึ่งคนหรือหลายคนออกจากทีม

#### "bossBarCreated" (bossBar)

จะ fire เมื่อมีการสร้าง boss bar ใหม่

#### "bossBarDeleted" (bossBar)

จะ fire เมื่อ boss bar ใหม่ถูกลบ

#### "bossBarUpdated" (bossBar)

จะ fire เมื่อ boss bar ใหม่ถูกอัปเดต

#### "heldItemChanged" (heldItem)

จะ fire เมื่อไอเทมที่ถืออยู่ถูกเปลี่ยน

#### "physicsTick" ()

จะ fire ทุก tick ถ้า bot.physicsEnabled ถูกตั้งค่าเป็น true

#### "chat:name" (matches)

จะ fire เมื่อ regex ทั้งหมดของ chat pattern หนึ่ง ๆ มี match

#### "particle"

จะ fire เมื่อมีการสร้างพาร์ติเคิล
### Functions

#### bot.blockAt(point, extraInfos=true)

คืนค่าบล็อก ณ ตำแหน่ง `point` หรือ `null` ถ้าตำแหน่งนั้นยังไม่ถูกโหลด ถ้าตั้งค่า `extraInfos` เป็น true จะคืนข้อมูลเกี่ยวกับป้าย ภาพวาด และ block entity ด้วย (ช้ากว่า)
ดู `Block`

#### bot.waitForChunksToLoad()

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อชังก์ (chunk) จำนวนมากถูกโหลดแล้ว

#### bot.blockInSight(maxSteps, vectorLength)

เลิกใช้แล้ว ให้ใช้ `blockAtCursor` แทน

คืนค่าบล็อกที่บอทกำลังมองอยู่ หรือ `null`
 * `maxSteps` - จำนวนสเต็ปในการ raytrace ค่าเริ่มต้นคือ 256
 * `vectorLength` - ความยาวของเวกเตอร์ raytracing ค่าเริ่มต้นคือ `5/16`

#### bot.blockAtCursor(maxDistance=256)

คืนค่าบล็อกที่บอทกำลังมองอยู่ หรือ `null`
 * `maxDistance` - ระยะทางสูงสุดที่บล็อกสามารถอยู่ห่างจากดวงตาได้ ค่าเริ่มต้นคือ 256

#### bot.entityAtCursor(maxDistance=3.5)

คืนค่าเอนทิตี (entity) ที่บอทกำลังมองอยู่ หรือ `null`
 * `maxDistance` - ระยะทางสูงสุดที่เอนทิตีสามารถอยู่ห่างจากดวงตาได้ ค่าเริ่มต้นคือ 3.5

#### bot.blockAtEntityCursor(entity=bot.entity, maxDistance=256)

คืนค่าบล็อกที่เอนทิตีที่ระบุกำลังมองอยู่ หรือ `null`
 * `entity` - ข้อมูลเอนทิตีในรูปแบบ `Object`
 * `maxDistance` - ระยะทางสูงสุดที่บล็อกสามารถอยู่ห่างจากดวงตาได้ ค่าเริ่มต้นคือ 256

#### bot.canSeeBlock(block)

คืนค่า true หรือ false ขึ้นอยู่กับว่าบอทสามารถมองเห็นบล็อก `block` ที่ระบุได้หรือไม่

#### bot.findBlocks(options)

ค้นหาบล็อกที่ใกล้ที่สุดจากจุดที่กำหนด
 * `options` - ตัวเลือกสำหรับการค้นหา:
   - `point` - ตำแหน่งเริ่มต้นของการค้นหา (จุดศูนย์กลาง) ค่าเริ่มต้นคือตำแหน่งของบอท
   - `matching` - ฟังก์ชันที่คืนค่า true ถ้าบล็อกที่กำหนดตรงตามเงื่อนไข รองรับการให้ค่านี้เป็น block id หรืออาเรย์ (array) ของ block id ได้ด้วย
   - `useExtraInfo` - เพื่อรักษาความเข้ากันได้แบบย้อนหลัง สามารถให้พฤติกรรมได้สองแบบขึ้นอยู่กับชนิดข้อมูล
      - **boolean** - ให้ข้อมูลแก่ฟังก์ชัน `matching` ของคุณมากขึ้น - แนวทางที่ช้าลงอย่างเห็นได้ชัด
      - **function** - สร้างการจับคู่แบบสองขั้น ถ้าบล็อกผ่านฟังก์ชัน `matching` จะถูกส่งต่อไปยัง `useExtraInfo` พร้อมข้อมูลเพิ่มเติม
   - `maxDistance` - ระยะทางที่ไกลที่สุดสำหรับการค้นหา ค่าเริ่มต้นคือ 16
   - `count` - จำนวนบล็อกที่จะค้นหาก่อนคืนผลการค้นหา ค่าเริ่มต้นคือ 1 อาจคืนค่าได้น้อยกว่านี้ถ้าค้นหาทั้งพื้นที่แล้วพบบล็อกไม่เพียงพอ

คืนค่าเป็นอาเรย์ (อาจเป็นอาเรย์ว่าง) ที่มีพิกัดของบล็อกที่พบ (ไม่ใช่ตัวบล็อก) อาเรย์จะถูกเรียงลำดับ (ใกล้ที่สุดก่อน)

#### bot.findBlock(options)

ชื่อย่อของ `bot.blockAt(bot.findBlocks(options)[0])` คืนค่าบล็อกเดียวหรือ `null`

#### bot.canDigBlock(block)

คืนค่าว่าบล็อก `block` สามารถขุดได้และอยู่ในระยะหรือไม่

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

คืนค่ารายการของอินสแตนซ์ `Recipe` ที่คุณสามารถใช้คราฟต์ `itemType`
ด้วย `metadata` ได้

 * `itemType` - item id ที่เป็นตัวเลขของสิ่งที่คุณต้องการคราฟต์
 * `metadata` - ค่า metadata ที่เป็นตัวเลขของไอเทมที่คุณต้องการคราฟต์
   `null` จะตรงกับ metadata ใด ๆ ก็ได้
 * `minResultCount` - จากช่องเก็บของ (inventory) ปัจจุบันของคุณ สูตรคราฟต์ (recipe) ใด ๆ จาก
   รายการที่คืนมาจะสามารถผลิตไอเทมได้จำนวนเท่านี้ `null` เป็น
   ชื่อย่อของ `1`
 * `craftingTable` - อินสแตนซ์ `Block` ถ้าเป็น `null` จะรวมเฉพาะสูตรคราฟต์ที่สามารถ
   ทำได้ในหน้าต่างช่องเก็บของของคุณเท่านั้นในรายการ

#### bot.recipesAll(itemType, metadata, craftingTable)

เหมือนกับ bot.recipesFor ทุกประการ ยกเว้นว่าจะไม่ตรวจสอบว่าบอทมีวัสดุเพียงพอสำหรับสูตรคราฟต์หรือไม่

#### bot.nearestEntity(match = (entity) => { return true })

คืนค่าเอนทิตีที่ใกล้ที่สุดกับบอทที่ตรงตามฟังก์ชัน (ค่าเริ่มต้นคือเอนทิตีทั้งหมด) คืนค่า null ถ้าไม่พบเอนทิตี

ตัวอย่าง:
```js
const cow = bot.nearestEntity(entity => entity.name.toLowerCase() === 'cow') // เราใช้ .toLowercase() เพราะใน 1.8 cow ขึ้นต้นด้วยตัวพิมพ์ใหญ่ สำหรับเวอร์ชันใหม่กว่าสามารถละไว้ได้
```

### Methods

#### bot.end(reason)

ปิดการเชื่อมต่อกับเซิร์ฟเวอร์
* `reason` - string ที่ระบุเหตุผลของการสิ้นสุด (ไม่บังคับ)

#### bot.quit(reason)

ตัดการเชื่อมต่อจากเซิร์ฟเวอร์อย่างนุ่มนวลด้วยเหตุผลที่กำหนด (ค่าเริ่มต้นคือ 'disconnect.quitting')

#### bot.tabComplete(str, [assumeCommand], [sendBlockInSight], [timeout])

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `matches` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

ร้องขอการเติมข้อความแชท (chat) ให้สมบูรณ์จากเซิร์ฟเวอร์
 * `str` - String ที่จะเติมให้สมบูรณ์
 * `assumeCommand` - ฟิลด์ที่ส่งไปยังเซิร์ฟเวอร์ ค่าเริ่มต้นคือ false
 * `sendBlockInSight` - ฟิลด์ที่ส่งไปยังเซิร์ฟเวอร์ ค่าเริ่มต้นคือ true ตั้งค่าตัวเลือกนี้เป็น false ถ้าคุณต้องการประสิทธิภาพที่ดีขึ้น
 * `timeout` - Timeout เป็นมิลลิวินาที หลังจากนั้นฟังก์ชันจะคืนค่าอาเรย์ว่าง ค่าเริ่มต้นคือ 5000

#### bot.chat(message)

ส่งข้อความแชทแบบกระจายสาธารณะ แบ่งข้อความขนาดใหญ่ออกเป็นหลายข้อความแชทตามความจำเป็น

#### bot.whisper(username, message)

ชื่อย่อของ "/tell <username>" ข้อความที่ถูกแบ่งทั้งหมดจะถูกกระซิบไปยัง username

#### bot.chatAddPattern(pattern, chatType, description)

เลิกใช้แล้ว ให้ใช้ `addChatPattern` แทน

เพิ่มรูปแบบ regex เข้าไปในการจับคู่แชทของบอท มีประโยชน์สำหรับเซิร์ฟเวอร์ bukkit ที่รูปแบบแชทเปลี่ยนแปลงบ่อย
 * `pattern` - regular expression ที่จะจับคู่กับแชท
 * `chatType` - อีเวนต์ (event) ที่บอทส่งออกมาเมื่อรูปแบบตรงกัน เช่น "chat" หรือ "whisper"
 * 'description ' - ไม่บังคับ อธิบายว่ารูปแบบนี้มีไว้เพื่ออะไร

#### bot.addChatPattern(name, pattern, chatPatternOptions)

** นี่เป็นชื่อย่อของ `bot.addChatPatternSet(name, [pattern], chatPatternOptions)`

สร้างอีเวนต์ที่ถูกเรียกทุกครั้งที่รูปแบบตรงกับข้อความ
อีเวนต์จะถูกเรียกว่า `"chat:name"` โดย name คือชื่อที่ส่งเข้ามา
* `name` - ชื่อที่ใช้สำหรับฟังอีเวนต์
* `pattern` - regular expression ที่จะจับคู่กับข้อความที่ได้รับ
* `chatPatternOptions` - object
  * `repeat` - ค่าเริ่มต้นคือ true ว่าจะฟังอีเวนต์นี้ต่อหลังจากการจับคู่ครั้งแรกหรือไม่
  * `parse` - แทนที่จะคืนค่าข้อความจริงที่ถูกจับคู่ ให้คืนค่า capture group จาก regex
  * `deprecated` - (**ไม่เสถียร**) ใช้โดย bot.chatAddPattern เพื่อรักษาความเข้ากันได้ มีแนวโน้มว่าจะถูกลบออก

คืนค่าเป็นตัวเลขที่สามารถใช้กับ bot.removeChatPattern() เพื่อลบเฉพาะรูปแบบนี้ได้

- :eyes: cf. [examples/chat_parsing](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js#L17-L36)

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

สร้างอีเวนต์ที่ถูกเรียกทุกครั้งที่ทุกรูปแบบถูกจับคู่กับข้อความแล้ว
อีเวนต์จะถูกเรียกว่า `"chat:name"` โดย name คือชื่อที่ส่งเข้ามา
* `name` - ชื่อที่ใช้สำหรับฟังอีเวนต์
* `patterns` - อาเรย์ของ regular expression ที่จะจับคู่กับข้อความที่ได้รับ
* `chatPatternOptions` - object
  * `repeat` - ค่าเริ่มต้นคือ true ว่าจะฟังอีเวนต์นี้ต่อหลังจากการจับคู่ครั้งแรกหรือไม่
  * `parse` - แทนที่จะคืนค่าข้อความจริงที่ถูกจับคู่ ให้คืนค่า capture group จาก regex

คืนค่าเป็นตัวเลขที่สามารถใช้กับ bot.removeChatPattern() เพื่อลบเฉพาะ patternset นี้ได้

- :eyes: cf. [examples/chat_parsing](https://github.com/PrismarineJS/mineflayer/blob/master/examples/chat_parsing.js#L17-L36)

#### bot.removeChatPattern(name)

ลบรูปแบบแชท
* `name` : string หรือ number

ถ้า name เป็น string รูปแบบทั้งหมดที่มีชื่อนั้นจะถูกลบ
มิฉะนั้นถ้า name เป็น number จะลบเฉพาะรูปแบบนั้นเท่านั้น

#### bot.awaitMessage(...args)

Promise ที่ถูก resolve เมื่อข้อความใดข้อความหนึ่งที่ส่งเข้ามาเป็นอาร์กิวเมนต์ถูก resolve

ตัวอย่าง:

```js
async function wait () {
  await bot.awaitMessage('<flatbot> hello world') // resolve เมื่อมี "hello world" ในแชทโดย flatbot
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world']) // resolve เมื่อมี "hello" หรือ "world" ในแชทโดย flatbot
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world'], ['<flatbot> im', '<flatbot> batman']) // resolve เมื่อมี "hello" หรือ "world" หรือ "im" หรือ "batman" ในแชทโดย flatbot
  await bot.awaitMessage('<flatbot> hello', '<flatbot> world') // resolve เมื่อมี "hello" หรือ "world" ในแชทโดย flatbot
  await bot.awaitMessage(/<flatbot> (.+)/) // resolve เมื่อพบข้อความแรกที่ตรงกับ regex
}
```

#### bot.setSettings(options)

ดูพร็อพเพอร์ตี (property) `bot.settings`

#### bot.loadPlugin(plugin)

แทรกปลั๊กอิน (plugin) ไม่ทำอะไรเลยถ้าปลั๊กอินถูกโหลดไปแล้ว

 * `plugin` - function

```js
function somePlugin (bot, options) {
  function someFunction () {
    bot.chat('Yay!')
  }

  bot.myPlugin = {} // เป็นแนวทางที่ดีที่จะใส่ API ของปลั๊กอินไว้ใน namespace
  bot.myPlugin.someFunction = someFunction
}

const bot = mineflayer.createBot({})
bot.loadPlugin(somePlugin)
bot.once('login', function () {
  bot.myPlugin.someFunction() // Yay!
})
```

#### bot.loadPlugins(plugins)

แทรกปลั๊กอินหลายตัว ดู `bot.loadPlugin`
 * `plugins` - อาเรย์ของฟังก์ชัน

#### bot.hasPlugin(plugin)

ตรวจสอบว่าปลั๊กอินที่กำหนดถูกโหลด (หรือกำหนดให้โหลด) บนบอทนี้หรือไม่

#### bot.sleep(bedBlock)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

นอนบนเตียง `bedBlock` ควรเป็นอินสแตนซ์ `Block` ที่เป็นเตียง

#### bot.isABed(bedBlock)

คืนค่า true ถ้า `bedBlock` เป็นเตียง

#### bot.wake()

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

ลุกออกจากเตียง

#### bot.setControlState(control, state)

นี่คือเมธอด (method) หลักในการควบคุมการเคลื่อนไหวของบอท ทำงานคล้ายกับการกดปุ่มใน minecraft
ตัวอย่างเช่น forward ที่มี state เป็น true จะทำให้บอทเดินไปข้างหน้า ส่วน forward ที่มี state เป็น false จะทำให้บอทหยุดเดินไปข้างหน้า
คุณอาจใช้ bot.lookAt ร่วมกับสิ่งนี้เพื่อควบคุมการเคลื่อนไหว ตัวอย่าง jumper.js แสดงวิธีใช้

 * `control` - หนึ่งใน ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
 * `state` - `true` หรือ `false`

#### bot.getControlState(control)

คืนค่า true ถ้า control state ถูกเปิดใช้งานอยู่

* `control` - หนึ่งใน ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']

#### bot.clearControlStates()

ตั้งค่า control ทั้งหมดเป็นปิด

#### bot.getExplosionDamages(entity, position, radius, [rawDamages])

คืนค่าว่าจะเกิดความเสียหายเท่าใดต่อเอนทิตีในรัศมีรอบตำแหน่งของการระเบิด
จะคืนค่า `null` ถ้าเอนทิตีไม่มีเกราะและไม่ได้ตั้งค่า rawDamages เป็น true เนื่องจากฟังก์ชันไม่สามารถคำนวณความเสียหายกับเกราะได้ถ้าไม่มีเกราะ

* `entity` - อินสแตนซ์ Entity
* `position` - อินสแตนซ์ [Vec3](https://github.com/andrewrk/node-vec3)
* `radius` - รัศมีการระเบิดเป็นตัวเลข
* `rawDamages` - ไม่บังคับ ถ้าเป็น true จะไม่นำเกราะมาคำนวณ

#### bot.lookAt(point, [force])

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อคุณกำลังมองที่ `point`

 * `point` อินสแตนซ์ [Vec3](https://github.com/andrewrk/node-vec3) - เอียงหัวของคุณให้หันหน้าตรงไปยังจุดนี้
 * `force` - ดู `force` ใน `bot.look`

#### bot.look(yaw, pitch, [force])

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์ที่ถูกเรียกเมื่อคุณกำลังมองที่ `yaw` และ `pitch`

ตั้งทิศทางที่หัวของคุณหันไป

 * `yaw` - จำนวนเรเดียนที่จะหมุนรอบแกนตั้ง โดยเริ่ม
   จากทิศตะวันออกพอดี ทวนเข็มนาฬิกา
 * `pitch` - จำนวนเรเดียนที่จะชี้ขึ้นหรือลง 0 หมายถึงตรงไปข้างหน้า
   pi / 2 หมายถึงตรงขึ้น -pi / 2 หมายถึงตรงลง
 * `force` - ถ้ามีและเป็น true จะข้ามการเปลี่ยนผ่านแบบนุ่มนวลฝั่งเซิร์ฟเวอร์
   ระบุค่านี้เป็น true ถ้าคุณต้องการให้เซิร์ฟเวอร์รู้แน่ชัดว่าคุณ
   กำลังมองที่ไหน เช่น สำหรับการทิ้งไอเทมหรือยิงธนู สิ่งนี้ไม่
   จำเป็นสำหรับการคำนวณฝั่งไคลเอนต์ (client) เช่น ทิศทางการเดิน

#### bot.updateSign(block, text, back = false)

เปลี่ยนข้อความบนป้าย บน Minecraft 1.20 ขึ้นไป ค่า `back` ที่เป็น truthy จะพยายามตั้งข้อความบนด้านหลังของป้าย (มองเห็นได้เฉพาะเมื่อไม่ได้ติดกับผนัง)

#### bot.equip(item, destination)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อคุณสวมใส่ไอเทมสำเร็จ หรือเมื่อคุณทราบว่าสวมใส่ไอเทมไม่สำเร็จ

สวมใส่ไอเทมจากช่องเก็บของของคุณ ถ้าอาร์กิวเมนต์ `item` เป็นอินสแตนซ์ของ `Item` equip จะสวมใส่ไอเทมเฉพาะตัวนี้จากช่องในหน้าต่างของมัน ถ้าอาร์กิวเมนต์ `item` เป็นชนิด `number` equip จะสวมใส่ไอเทมตัวแรกที่พบที่มี id นั้นโดยค้นหาตามลำดับ slot id ที่เพิ่มขึ้น (Hotbar ถูกค้นหาเป็นลำดับสุดท้าย ช่องเกราะ คราฟต์ ผลลัพธ์คราฟต์ และมือข้างที่ไม่ถนัดถูกยกเว้น)

 * `item` - อินสแตนซ์ `Item` หรือ `number` สำหรับ item id ดู `window.items()`
 * `destination`
   - `"hand"` - `null` เป็นชื่อย่อของค่านี้
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
   - `"off-hand"` - เมื่อมีให้ใช้งาน

#### bot.unequip(destination)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

ถอดอุปกรณ์ออกหนึ่งชิ้น

#### bot.tossStack(item)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการทิ้งเสร็จสิ้น

 * `item` - สแต็กของไอเทมที่คุณต้องการทิ้ง
   truthy แสดงว่าคุณไม่สามารถทิ้งให้เสร็จสมบูรณ์ได้

#### bot.toss(itemType, metadata, count)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการทิ้งเสร็จสิ้น

 * `itemType` - id ที่เป็นตัวเลขของไอเทมที่คุณต้องการทิ้ง
 * `metadata` - metadata ของไอเทมที่คุณต้องการทิ้ง ใช้ `null`
   เพื่อตรงกับ metadata ใด ๆ
 * `count` - จำนวนที่คุณต้องการทิ้ง `null` เป็นชื่อย่อของ `1`

#### bot.elytraFly()

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการเปิดใช้งาน
การบินด้วยอิลีตรา (elytra) เสร็จสิ้น จะ throw Error ถ้าล้มเหลว

#### bot.dig(block, [forceLook], [digFace])

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อบล็อกถูกทำลายหรือคุณถูกขัดจังหวะ

เริ่มขุดเข้าไปในบล็อก `block` ด้วยไอเทมที่ถืออยู่ในปัจจุบัน
ดูอีเวนต์ "diggingCompleted" และ "diggingAborted" ด้วย

โปรดทราบว่าเมื่อคุณเริ่มขุดเข้าไปในบล็อกแล้ว คุณจะไม่สามารถ
ขุดบล็อกอื่นได้จนกว่าบล็อกนั้นจะถูกทำลาย หรือคุณเรียก
`bot.stopDigging()`

 * `block` - บล็อกที่จะเริ่มขุดเข้าไป
 * `forceLook` - (ไม่บังคับ) ถ้าเป็น true บอทจะหันหัวไปที่บล็อกทันทีและเริ่มขุดทันที ถ้าเป็น false หรือไม่ระบุ บอทจะหันหัวไปที่บล็อกตามอัตราการมองปกติและรอจนการหันเสร็จก่อนจึงเริ่มขุด สามารถกำหนดเป็น 'ignore' เพื่อป้องกันไม่ให้บอทขยับหัวเลยได้ด้วย
 * `digFace` - (ไม่บังคับ) ค่าเริ่มต้นคือ 'auto' มองที่จุดศูนย์กลางของบล็อกและขุดหน้าด้านบน สามารถเป็นเวกเตอร์ vec3
 ของหน้าที่บอทควรมองเมื่อขุดบล็อกได้ด้วย เช่น ```vec3(0, 1, 0)``` เมื่อขุดด้านบน สามารถเป็น 'raycast' ได้ด้วย ซึ่ง raycast จะตรวจสอบว่ามีหน้าที่บอทมองเห็นได้หรือไม่และขุดหน้านั้น มีประโยชน์สำหรับเซิร์ฟเวอร์ที่มีระบบ anti cheat

ถ้าคุณเรียก bot.dig สองครั้งก่อนที่การขุดครั้งแรกจะเสร็จ คุณจะได้รับ error 'diggingAborted' ที่ร้ายแรง

#### bot.stopDigging()

#### bot.digTime(block)

บอกคุณว่าจะใช้เวลาขุดบล็อกนานเท่าใด เป็นมิลลิวินาที

#### bot.acceptResourcePack()

ยอมรับ resource pack

#### bot.denyResourcePack()

ปฏิเสธ resource pack

#### bot.placeBlock(referenceBlock, faceVector)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเซิร์ฟเวอร์ยืนยันว่าบล็อกถูกวางจริงแล้ว

 * `referenceBlock` - บล็อกที่คุณต้องการวางบล็อกใหม่ไว้ข้าง ๆ
 * `faceVector` - หนึ่งในหกทิศหลัก เช่น `new Vec3(0, 1, 0)` สำหรับหน้าด้านบน
   ระบุว่าจะวางบล็อกชิดกับหน้าใดของ `referenceBlock`

บล็อกใหม่จะถูกวางที่ `referenceBlock.position.plus(faceVector)`

#### bot.placeEntity(referenceBlock, faceVector)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `Entity` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

 * `referenceBlock` - บล็อกที่คุณต้องการวางเอนทิตีไว้ข้าง ๆ
 * `faceVector` - หนึ่งในหกทิศหลัก เช่น `new Vec3(0, 1, 0)` สำหรับหน้าด้านบน
   ระบุว่าจะวางบล็อกชิดกับหน้าใดของ `referenceBlock`

บล็อกใหม่จะถูกวางที่ `referenceBlock.position.plus(faceVector)`

#### bot.activateBlock(block, direction?: Vec3, cursorPos?: Vec3)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

ต่อยโน้ตบล็อก เปิดประตู ฯลฯ

 * `block` - บล็อกที่จะเปิดใช้งาน
 * `direction` ไม่บังคับ ค่าเริ่มต้นคือ `new Vec3(0, 1, 0)` (ขึ้น) เวกเตอร์ของทิศทางที่ควรโต้ตอบกับบล็อกคอนเทนเนอร์ ไม่ทำอะไรเลยเมื่อเป้าหมายเป็นเอนทิตีคอนเทนเนอร์
 * `cursorPos` ไม่บังคับ ค่าเริ่มต้นคือ `new Vec3(0.5, 0.5, 0.5)` (จุดศูนย์กลางบล็อก) ตำแหน่งเคอร์เซอร์เมื่อเปิดอินสแตนซ์บล็อก ค่านี้ถูกส่งไปพร้อมกับ activate block packet ไม่ทำอะไรเลยเมื่อเป้าหมายเป็นเอนทิตีคอนเทนเนอร์

#### bot.activateEntity(entity)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

เปิดใช้งานเอนทิตี มีประโยชน์สำหรับชาวบ้านเป็นต้น

 * `entity` - เอนทิตีที่จะเปิดใช้งาน

#### bot.activateEntityAt(entity, position)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

เปิดใช้งานเอนทิตี ณ ตำแหน่งที่กำหนด มีประโยชน์สำหรับขาตั้งเกราะ

 * `entity` - เอนทิตีที่จะเปิดใช้งาน
 * `position` - ตำแหน่งในโลก (world) ที่จะคลิก

#### bot.consume()

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการบริโภคสิ้นสุด

กิน / ดื่มไอเทมที่ถืออยู่ในปัจจุบัน


#### bot.fish()

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการตกปลาสิ้นสุด

ใช้เบ็ดตกปลา


#### bot.activateItem(offHand=false)

เปิดใช้งานไอเทมที่ถืออยู่ในปัจจุบัน นี่คือวิธีที่คุณกิน ยิงธนู ขว้าง
ไข่ จุดพลุดอกไม้ไฟ ฯลฯ

พารามิเตอร์ที่ไม่บังคับคือ `false` สำหรับมือหลักและ `true` สำหรับมือข้างที่ไม่ถนัด

#### bot.deactivateItem()

ปิดใช้งานไอเทมที่ถืออยู่ในปัจจุบัน นี่คือวิธีที่คุณปล่อยลูกธนู หยุดกิน ฯลฯ

#### bot.useOn(targetEntity)

ใช้ไอเทมที่ถืออยู่ในปัจจุบันกับอินสแตนซ์ `Entity` นี่คือวิธีที่คุณใส่อานม้าและ
ใช้กรรไกร

#### bot.attack(entity, swing = true)

โจมตีผู้เล่นหรือม็อบ (mob)

 * `entity` คือชนิดของเอนทิตี เพื่อให้ได้เอนทิตีที่เจาะจง ใช้ [bot.nearestEntity()](#botnearestentitymatch--entity---return-true-) หรือ [bot.entities](#botentities)
 * `swing` ค่าเริ่มต้นคือ `true` ถ้าเป็น false บอทจะไม่เหวี่ยงแขนเมื่อโจมตี

#### bot.swingArm([hand], showHand)

เล่นอนิเมชันการเหวี่ยงแขน

 * `hand` สามารถรับ `left` หรือ `right` ซึ่งเป็นแขนที่ถูกทำอนิเมชัน ค่าเริ่มต้น: `right`
 * `showHand` เป็น boolean ว่าจะเพิ่มมือเข้าไปใน packet หรือไม่ ค่าเริ่มต้น: `true`

#### bot.mount(entity)

ขึ้นยานพาหนะ เพื่อลงมา ให้ใช้ `bot.dismount`

#### bot.dismount()

ลงจากยานพาหนะที่คุณอยู่

#### bot.moveVehicle(left,forward)

เคลื่อนยานพาหนะ :

 * left สามารถรับ -1 หรือ 1 : -1 หมายถึงขวา 1 หมายถึงซ้าย
 * forward สามารถรับ -1 หรือ 1 : -1 หมายถึงถอยหลัง 1 หมายถึงไปข้างหน้า

ทุกทิศทางสัมพันธ์กับที่ที่บอทกำลังมองอยู่

#### bot.setQuickBarSlot(slot)

 * `slot` - 0-8 ช่อง quick bar ที่จะเลือก

#### bot.craft(recipe, count, craftingTable)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการคราฟต์เสร็จสมบูรณ์และช่องเก็บของของคุณถูกอัปเดต

 * `recipe` - อินสแตนซ์ `Recipe` ดู `bot.recipesFor`
 * `count` - จำนวนครั้งที่คุณต้องการทำการคราฟต์
   ถ้าคุณต้องการคราฟต์ไม้กระดานเป็นไม้ `8` ชิ้น คุณจะตั้ง
   `count` เป็น `2` `null` เป็นชื่อย่อของ `1`
 * `craftingTable` - อินสแตนซ์ `Block` ซึ่งเป็นโต๊ะคราฟต์ที่คุณต้องการ
   ใช้ ถ้าสูตรคราฟต์ไม่ต้องใช้โต๊ะคราฟต์ คุณสามารถใช้
   `null` สำหรับอาร์กิวเมนต์นี้ได้

#### bot.writeBook(slot, pages)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อการเขียนสำเร็จหรือเกิด error ขึ้น

 * `slot` อยู่ในพิกัดหน้าต่างช่องเก็บของ (โดย 36 คือช่อง quickbar แรก เป็นต้น)
 * `pages` เป็นอาเรย์ของ string ที่แทนหน้าต่าง ๆ

#### bot.openContainer(containerBlock or containerEntity, direction?, cursorPos?)
เปิดบล็อกคอนเทนเนอร์หรือเอนทิตี

 * `containerBlock` หรือ `containerEntity` อินสแตนซ์บล็อกที่จะเปิดหรือเอนทิตีที่จะเปิด
 * `direction` ไม่บังคับ ค่าเริ่มต้นคือ `new Vec3(0, 1, 0)` (ขึ้น) เวกเตอร์ของทิศทางที่ควรโต้ตอบกับบล็อกคอนเทนเนอร์ ไม่ทำอะไรเลยเมื่อเป้าหมายเป็นเอนทิตีคอนเทนเนอร์
 * `cursorPos` ไม่บังคับ ค่าเริ่มต้นคือ `new Vec3(0.5, 0.5, 0.5)` (จุดศูนย์กลางบล็อก) ตำแหน่งเคอร์เซอร์เมื่อเปิดอินสแตนซ์บล็อก ค่านี้ถูกส่งไปพร้อมกับ activate block packet ไม่ทำอะไรเลยเมื่อเป้าหมายเป็นเอนทิตีคอนเทนเนอร์

คืนค่าเป็น promise ของอินสแตนซ์ `Container` ที่แทนคอนเทนเนอร์ที่คุณกำลังเปิด

#### bot.openChest(chestBlock or minecartchestEntity, direction?, cursorPos?)

เลิกใช้แล้ว เหมือนกับ `openContainer`

#### bot.openFurnace(furnaceBlock)

คืนค่าเป็น promise ของอินสแตนซ์ `Furnace` ที่แทนเตาหลอม (furnace) ที่คุณกำลังเปิด

#### bot.openDispenser(dispenserBlock)

เลิกใช้แล้ว เหมือนกับ `openContainer`

#### bot.openEnchantmentTable(enchantmentTableBlock)

คืนค่าเป็น promise ของอินสแตนซ์ `EnchantmentTable` ที่แทนโต๊ะร่ายมนตร์ (enchantment table)
ที่คุณกำลังเปิด

#### bot.openAnvil(anvilBlock)

คืนค่าเป็น promise ของอินสแตนซ์ `anvil` ที่แทนทั่งตีเหล็กที่คุณกำลังเปิด

#### bot.openVillager(villagerEntity)

คืนค่าเป็น promise ของอินสแตนซ์ `Villager` ที่แทนหน้าต่างการค้าขายที่คุณกำลังเปิด
คุณสามารถฟังอีเวนต์ `ready` บน `Villager` นี้เพื่อรู้ว่ามันพร้อมเมื่อใด

#### bot.trade(villagerInstance, tradeIndex, [times])

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อเสร็จสมบูรณ์

ใช้ `villagerInstance` ที่เปิดอยู่เพื่อค้าขาย

#### bot.setCommandBlock(pos, command, [options])

ตั้งค่าพร็อพเพอร์ตีของ command block ที่ `pos`
ตัวอย่างอาร์กิวเมนต์ `options`:
```js
{
  mode: 2,
  trackOutput: true,
  conditional: false,
  alwaysActive: true
}
```
options.mode สามารถมีได้ 3 ค่า: 0 (SEQUENCE), 1 (AUTO), 2 (REDSTONE)
แอตทริบิวต์ของ options ทั้งหมดมีค่าเริ่มต้นเป็น false ยกเว้น mode ซึ่งเป็น 2 (เพื่อจำลอง command block ตามค่าเริ่มต้นใน Minecraft)

#### bot.supportFeature(name)

สามารถใช้สิ่งนี้เพื่อตรวจสอบว่าฟีเจอร์เฉพาะมีให้ใช้งานใน Minecraft เวอร์ชันปัจจุบันหรือไม่ โดยปกติจำเป็นเฉพาะสำหรับการจัดการฟังก์ชันที่ขึ้นกับเวอร์ชันเท่านั้น

รายการฟีเจอร์ที่มีให้ใช้งานสามารถพบได้ภายในไฟล์ [./lib/features.json](https://github.com/PrismarineJS/mineflayer/blob/master/lib/features.json)

#### bot.waitForTicks(ticks)

นี่เป็นฟังก์ชันแบบ promise ที่รอให้ผ่านไปตามจำนวน tick ในเกมที่กำหนดก่อนดำเนินการต่อ มีประโยชน์สำหรับตัวจับเวลาเร็ว ๆ ที่ต้องทำงานด้วยจังหวะเวลาที่เฉพาะเจาะจง โดยไม่ขึ้นกับความเร็ว physics tick ของบอท สิ่งนี้คล้ายกับฟังก์ชัน setTimeout มาตรฐานของ Javascript แต่ทำงานบนตัวจับเวลา physics ของบอทโดยเฉพาะ

#### bot.respawn()

เมื่อตัวเลือก `respawn` ถูกปิดใช้งาน คุณสามารถเรียกเมธอดนี้ด้วยตนเองเพื่อสปอว์น (เกิด) ใหม่ได้
### Lower level inventory methods

เหล่านี้คือเมธอด (method) ระดับล่างสำหรับช่องเก็บของ (inventory) ซึ่งบางครั้งอาจมีประโยชน์ แต่ถ้าทำได้ ควรใช้เมธอดสำหรับช่องเก็บของที่นำเสนอไว้ด้านบนมากกว่า

#### bot.clickWindow(slot, mouseButton, mode)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อทำงานเสร็จ

mode ที่รองรับ:
  - stable:
    - mouse clicks (0)

  - experimental:
    - shift clicks (1)
    - number clicks (2)
    - middle clicks (3)
    - drop clicks (4)

  - unimplemented:
    - drag clicks (5)
    - double clicks (6)

คลิกบนหน้าต่าง (window) ปัจจุบัน ดูรายละเอียดได้ที่ https://minecraft.wiki/w/Protocol#Click_Container

ควรใช้ bot.simpleClick.* มากกว่า

#### bot.putSelectedItemRange(start, end, window, slot)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อทำงานเสร็จ

วางไอเทมที่ `slot` ในช่วงที่ระบุ

#### bot.putAway(slot)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อทำงานเสร็จ

วางไอเทมที่ `slot` ลงในช่องเก็บของ

#### bot.closeWindow(window)

ปิด `window`

#### bot.transfer(options)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อทำงานเสร็จ

ย้ายไอเทมบางประเภทจากช่วงหนึ่งไปยังอีกช่วงหนึ่ง `options` คืออ็อบเจกต์ (object) ที่ประกอบด้วย:

 * `window` : ไม่บังคับ หน้าต่างที่ไอเทมจะถูกย้าย
 * `itemType` : ชนิดของไอเทมที่ย้าย
 * `metadata` : ไม่บังคับ เมตาดาตาของไอเทมที่ย้าย
 * `sourceStart` และ `sourceEnd` : ช่วงต้นทาง `sourceEnd` ไม่บังคับ และมีค่าเริ่มต้นเป็น `sourceStart` + 1
 * `destStart` และ `destEnd` : ช่วงปลายทาง `destEnd` ไม่บังคับ และมีค่าเริ่มต้นเป็น `destStart` + 1
 * `count` : จำนวนไอเทมที่จะย้าย ค่าเริ่มต้น: `1`
 * `nbt` : ข้อมูล nbt ของไอเทมที่จะย้าย ค่าเริ่มต้น: `nullish` (ไม่สนใจ nbt)

#### bot.openBlock(block, direction?: Vec3, cursorPos?: Vec3)

เปิดบล็อก (block) เช่น หีบ (chest) คืนค่าเป็น promise บน `Window` ที่กำลังเปิด

 * `block` คือบล็อกที่บอท (bot) จะเปิด
 * `direction` ไม่บังคับ มีค่าเริ่มต้นเป็น `new Vec3(0, 1, 0)` (ขึ้น) เวกเตอร์ของทิศทางที่ควรโต้ตอบกับบล็อกภาชนะ ไม่มีผลเมื่อเป้าหมายเป็นเอนทิตี (entity) ภาชนะ
 * `cursorPos` ไม่บังคับ มีค่าเริ่มต้นเป็น `new Vec3(0.5, 0.5, 0.5)` (กึ่งกลางบล็อก) ตำแหน่งเคอร์เซอร์เมื่อเปิดอินสแตนซ์ของบล็อก ค่านี้จะถูกส่งไปพร้อมกับแพ็กเก็ต activate block ไม่มีผลเมื่อเป้าหมายเป็นเอนทิตีภาชนะ

#### bot.openEntity(entity)

เปิดเอนทิตีที่มีช่องเก็บของ เช่น ชาวบ้าน คืนค่าเป็น promise บน `Window` ที่กำลังเปิด

 * `entity` คือเอนทิตีที่บอทจะเปิด

#### bot.moveSlotItem(sourceSlot, destSlot)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อทำงานเสร็จ

ย้ายไอเทมจาก `sourceSlot` ไปยัง `destSlot` ในหน้าต่างปัจจุบัน

#### bot.updateHeldItem()

อัปเดต `bot.heldItem`

#### bot.getEquipmentDestSlot(destination)

ดึง id ของช่องสวมใส่อุปกรณ์ในช่องเก็บของสำหรับชื่อปลายทางของอุปกรณ์ที่กำหนด

ปลายทางที่ใช้ได้คือ:
* head
* torso
* legs
* feet
* hand
* off-hand

### bot.creative

ชุด api นี้มีประโยชน์ในโหมดสร้างสรรค์ (creative)
ที่นี่ไม่ได้ทำการตรวจจับและเปลี่ยนโหมดเกม
แต่สันนิษฐานและมักจำเป็นว่าบอทต้องอยู่ในโหมดสร้างสรรค์เพื่อให้ฟีเจอร์เหล่านี้ทำงานได้

#### bot.creative.setInventorySlot(slot, item)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์ ซึ่งจะถูกยิงเมื่อเซิร์ฟเวอร์ (server) ตั้งค่าช่อง

มอบไอเทมที่ระบุให้บอทในช่องเก็บของที่ระบุ

 * `slot` อยู่ในพิกัดของหน้าต่างช่องเก็บของ (โดยที่ 36 คือช่องแรกของแถบลัด เป็นต้น)
 * `item` คืออินสแตนซ์ของ [prismarine-item](https://github.com/PrismarineJS/prismarine-item) ที่ระบุด้วยเมตาดาตา, nbtdata ฯลฯ ตามต้องการ
    หาก `item` เป็น `null` ไอเทมในช่องที่ระบุจะถูกลบ

หากเมธอดนี้เปลี่ยนแปลงอะไรก็ตาม คุณจะได้รับการแจ้งเตือนผ่าน `bot.inventory.on("updateSlot")`

#### bot.creative.clearSlot(slot)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์ ซึ่งจะถูกยิงเมื่อเซิร์ฟเวอร์เคลียร์ช่อง

ตั้งค่าไอเทมในช่องที่กำหนดให้เป็น null

 * `slot` อยู่ในพิกัดของหน้าต่างช่องเก็บของ (โดยที่ 36 คือช่องแรกของแถบลัด เป็นต้น)

#### bot.creative.clearInventory()

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์ ซึ่งจะถูกยิงเมื่อเซิร์ฟเวอร์เคลียร์ช่อง

#### bot.creative.flyTo(destination)

ฟังก์ชันนี้คืนค่า `Promise` โดยมี `void` เป็นอาร์กิวเมนต์เมื่อบอทไปถึงจุดหมาย

เรียก `startFlying()` และเคลื่อนที่ด้วยความเร็วคงที่ผ่านปริภูมิ 3 มิติเป็นเส้นตรงไปยังจุดหมาย
`destination` คือ `Vec3` และบ่อยครั้งพิกัด `x` และ `z` จะลงท้ายด้วย `.5`
การทำงานนี้จะใช้ไม่ได้หากมีสิ่งกีดขวางขวางทาง
ดังนั้นจึงแนะนำให้บินในระยะทางสั้น ๆ ทีละครั้ง

เมธอดนี้ไม่พยายามทำการหาเส้นทาง (pathfinding) ใด ๆ
คาดว่าการนำการหาเส้นทางไปใช้งานจะใช้เมธอดนี้เพื่อเคลื่อนที่ทีละ < 2 บล็อก

หากต้องการกลับสู่ฟิสิกส์ปกติ ให้เรียก `stopFlying()`

#### bot.creative.startFlying()

ตั้งค่า `bot.physics.gravity` เป็น `0`
หากต้องการกลับสู่ฟิสิกส์ปกติ ให้เรียก `stopFlying()`

เมธอดนี้มีประโยชน์หากคุณต้องการลอยอยู่กับที่ขณะขุด (dig) พื้นที่อยู่ใต้ตัวคุณ
ไม่จำเป็นต้องเรียกฟังก์ชันนี้ก่อนเรียก `flyTo()`

โปรดทราบว่าขณะบินอยู่ `bot.entity.velocity` จะไม่แม่นยำ

#### bot.creative.stopFlying()

คืนค่า `bot.physics.gravity` กลับสู่ค่าเดิม
