<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Tabla de contenidos**  *generado con [DocToc](https://github.com/thlorenz/doctoc)*

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
  - [Clases](#clases)
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
      - ["end"](#end)
      - ["error" (err)](#error-err)
      - ["spawnReset"](#spawnreset)
      - ["death"](#death)
      - ["health"](#health)
      - ["breath"](#breath)
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
      - [bot.attack(entity)](#botattackentity)
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

Estos enums están guardados en un proyecto independiente del lenguaje [minecraft-data](https://github.com/PrismarineJS/minecraft-data),
 y accedidos por [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

### minecraft-data
Los datos están disponibles en el módulo [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)

`require('minecraft-data')(bot.version)` te da acceso a él.

### mcdata.blocks
bloques ordenados por id

### mcdata.items
items ordenados por id

### mcdata.materials

El key es el material. El valor es un objeto con key como el id de la herramienta y el valor es el multiplicador de eficiencia.

### mcdata.recipes
recetas ordenadas por id

### mcdata.instruments
herramientas ordenadas por id

### mcdata.biomes
biomas ordenados por id

### mcdata.entities
entidades ordenadas por id

## Clases

### vec3

Mira [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

Todos los puntos en mineflayer son instancias de esta clase.

 * x - south
 * y - up
 * z - west

Las funciones y los métodos que necesitan un punto aceptan instancias `Vec3`, un array con 3 valores, y un objeto con las propiedades `x`, `y`, y `z`.

### mineflayer.Location

### Entity

Las entidades representan jugadores, mobs, y objetos. Se emiten en muchos eventos, pero puedes acceder a tu propia entidad con `bot.entity`.
Mira [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

### Block

Mira [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

También, `block.blockEntity` es un campo adicional con los datos de la entidad del bloque como `Object`
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

Mira [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

Mira [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

Mira [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

#### window.deposit(itemType, metadata, count, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `itemType` - id numérico del item
 * `metadata` - valor numérico. `null` significa que conicide cualquiera.
 * `count` - cuantos items hay que depositar. `null` es un alias de 1.
 * `callback(err)` - (opcional) - ejecutado al finalizar

#### window.withdraw(itemType, metadata, count, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `itemType` - id numérico del item
 * `metadata` - valor numérico. `null` significa que coincide cualquiera.
 * `count` - cuantos items hay que retirar. `null` es un alias de 1.
 * `callback(err)` - (opcional) - ejecutado al finalizar

#### window.close()

Cierra la interfaz/ventana

### Recipe

Mira [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Container

Extiende windows.Window para cofres, dispensadores, etc...
Mira `bot.openChest(chestBlock o minecartchestEntity)`.

### mineflayer.Furnace

Extiende windows.Window para hornos, fundidores, etc...
Mira `bot.openFurnace(funaceBlock)`.

#### furnace "update"

Se emite cuando `furnace.fuel` y/o `furnace.progress` se actualizan.

#### furnace.takeInput([callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err, item)`

#### furnace.takeFuel([callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err, item)`

#### furnace.takeOutput([callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err, item)`

#### furnace.putInput(itemType, metadata, count, [cb])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

#### furnace.putFuel(itemType, metadata, count, [cb])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

#### furnace.inputItem()

Devuelve una instancia `Item` que es el item de entrada.

#### furnace.fuelItem()

Devuelve una instancia `Item` que es el combustible

#### furnace.outputItem()

Devuelve una instancia `Item` que es el item de salida.

#### furnace.fuel

Cuanto combustible queda del 0 al 1

#### furnace.progress

Cuanto esta hecho el item del 0 al 1

### mineflayer.EnchantmentTable

Extiende windows.Window para mesas de encantamiento
Mira `bot.openEnchantmentTable(enchantmentTableBlock)`.

#### enchantmentTable "ready"

Se emite cuando `enchantmentTable.enchantments` está completo y puedes elegir un encantamiento ejecutando `enchantmentTable.enchant(choice)`.

#### enchantmentTable.targetItem()

Devuelve los items de entrada y de salida

#### enchantmentTable.xpseed

La semilla de XP de 16 bits mandada por el servidor

#### enchantmentTable.enchantments

Array de longitud 3 donde están 3 encantamientos que puedes elegir.
`level` puede ser `-1` si el servidor no ha mandado los datos todavía

Se parece a:

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

Esta función también devueve un `Promise`, con `item` como argumento al finalizar.

 * `choice` - [0-2], el índice del encantamiento que quieres escoger.
 * `callback(err, item)` - (opcional) ejecutado al finalizar

#### enchantmentTable.takeTargetItem([callback])

Esta función también devueve un `Promise`, con `item` como argumento al finalizar.

 * `callback(err, item)`

#### enchantmentTable.putTargetItem(item, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err)`

#### enchantmentTable.putLapis(item, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err)`

### mineflayer.anvil

Extiende windows.Window para yunques
Mira `bot.openAnvil(anvilBlock)`.

#### anvil.combine(itemOne, itemTwo[, name, callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err)` - para poder usar el callback, el nombre tiene que estar vacío ('')

#### anvil.combine(item[, name, callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `callback(err)`

#### villager "ready"

Se emite cuando `villager.trades` se ha cargado.

#### villager.trades

Array de tradeos

Se parece a:

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
Es el mismo que [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)

### mineflayer.ScoreBoard

#### ScoreBoard.name

Nombre del scoreboard.

#### ScoreBoard.title

El título del scoreboard (no es siempre igual al nombre)

#### ScoreBoard.itemsMap

Un object con todos los items del scoreboard en él
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

Un array con todos los items en el scoreboard en él
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.BossBar

#### BossBar.title

Título de la barra de vida del jefe, instancia de ChatMessage

#### BossBar.health

Porcentaje de la vida del jefe, del `0` al `1`

#### BossBar.dividers

Número de separadores en la barra, puede ser `0`, `6`, `10`, `12` o `20`

#### BossBar.entityUUID

UUID de la entidad del jefe

#### BossBar.shouldDarkenSky

Determina si el cielo debería oscurecerse o no

#### BossBar.isDragonBar

Determina si la barra es la barra de vida del dragón

#### BossBar.createFog

Determina si la barra crea niebla o no

#### BossBar.color

Determina el color de la barra entre `pink`, `blue`, `red`, `green`, `yellow`, `purple` y `white` (`rosa`, `azul`, `rojo`, `verde`, `amarillo`, `morado` y `blanco`)

## Bot

### mineflayer.createBot(options)

Crea y devuelve una instancia de la clase Bot.
`options` es un object que contiene las propiedades opcionales :
 * username : (usuario) el valor predeterminado es 'Player'
 * port : (puerto) el valor predeterminado es 25565
 * password : (contraseña) se puede omitir (si los tokens también son omitidos intentará conectarse en modo offline)
 * host : (ip) el valor predeterminado es localhost
 * version : si se omite intentará averiguar automáticamente la versión. Por ejemplo : "1.12.2"
 * auth : (autentificación) el valor predeterminado es 'mojang', también puede ser 'microsoft'
 * clientToken : generado si se proporciona una contraseña
 * accessToken : generado si se proporciona una contraseña
 * logErrors : el valor predeterminado es true, retiene errores y los imprime
 * hideErrors : el valor predeterminado es true, para ocultar errores (incluso si logErrors es true)
 * keepAlive : manda paquetes keepAlive : el valor predeterminado es true
 * checkTimeoutInterval : el valor predeterminado es `30*1000` (30s), comprueba si el paquete keepAlive ha sido recibido en ese periodo, desconectar el bot si no ha sido recibido.
 * loadInternalPlugins : (cargarPluginsInternos) el valor predeterminado es true
 * storageBuilder : una función opcional, toma como argumentos la versión y el nombre del mundo (worldName) y devuelve una instancia de algo con la misma API que prismarine-provider-anvil. Se usará para guardar el mundo.
 * client : una instancia de node-minecraft-protocol, si no se especifíca, mineflayer creará su propio cliente. Esto sirve para usar mineflayer a través de un proxy de muchos clientes o para un cliente vanilla y un cliente mineflayer.
 * plugins : object : el valor predeterminado es {}
   - pluginName : false : no cargar el plugin interno con ese nombre ej. `pluginName`
   - pluginName : true : carga el plugin interno con ese nombre ej. `pluginName` incluso si loadInternalPlugins está en false
   - pluginName : función para introducir : carga un plugin de terceros (externo), anula el plugin interno con el mismo nombre ej. `pluginName`
 * physicsEnabled : el valor predeterminado es true, si el bot debería ser afectado por las físicas, puede modificarse mediante bot.physicsEnabled
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * chatLengthLimit : el valor máximo de carácteres que se pueden mandar con un solo mensaje. Si no se especifíca, será 100 en versiones anteriores a la 1.11 y 256 en la 1.11 a las posteriores de la 1.11

### Properties

#### bot.world

Una representación sincronizada del mundo. Mira su documentación en http://github.com/PrismarineJS/prismarine-world

##### world "blockUpdate" (oldBlock, newBlock)

Se emite cuando un bloque se actualiza. Devuelve el bloque antiguo `oldBlock` y el bloque nuevo `newBlock`.

Nota: `oldBlock` podría ser `null`.

##### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Se emite cuando un bloque en una coordenada se actualiza. Devuelve el bloque antiguo `oldBlock` y el bloque nuevo `newBlock`.

Nota: `oldBlock` podría ser `null`.


#### bot.entity

Tu propia entidad. Mira `Entity`.

#### bot.entities

Todas las entidades cercanas. Este object es un map de entityId (id de la entidad) a entity (entidad)

#### bot.username

Usa esto para averiguar tu propio nombre.

#### bot.spawnPoint

Coordenadas del punto de spawn, donde todas las brújulas apuntan.

#### bot.heldItem

El item en la mano del bot, presentado como una instancia [prismarine-item](https://github.com/PrismarineJS/prismarine-item) especificado con su metadata, nbtdata, etc.

#### bot.game.levelType

Tipo del nivel de juego

#### bot.game.dimension

Tipo de dimension

#### bot.game.difficulty

Tipo de dificultad de juego

#### bot.game.gameMode

Gamemode del bot

#### bot.game.hardcore

Si el juego está en hardcore o no

#### bot.game.maxPlayers

El número máximo de jugadores del juego

#### bot.game.serverBrand

La marca del servidor

### bot.physicsEnabled

Si las físicas deberían habilitarse, el valor predeterminado es true.

### bot.player

Object del jugador del bot
```js
{
  username: 'player',
  displayName: { toString: Function }, // ChatMessage object.
  gamemode: 0,
  ping: 28,
  entity: entity // null si estás demasiado lejos (fuera de la zona renderizada)
}
```

#### bot.players

Map de los nombres de los jugadores del juego

#### bot.isRaining

#### bot.rainState

Un número indicano el nivel de lluvia actual. Si no está lloviendo, este valdrá 0. Cuando empiece a llover, el valor aumentará gradualmente a 1. Y cuando pare de llover, disminuirá gradualmente a 0.

Cada vez que `bot.rainState` cambia, se emitirá el evento "weatherUpdate"

#### bot.thunderState

Un número indicando el nivel de tormenta de rayos actual. Si no hay tormenta, este valdrá 0. Cuando empiece una tormenta, el valor aumentará gradualmente a 1. Y cuando pare la tormenta, disminuirá gradualmente a 0.

Cada vez que `bot.thunderState` cambia, se emitirá el evento "weatherUpdate".

Esto es lo mismo que `bot.rainState`, pero para tormentas de rayos.
Para tormentas de rayos, `bot.rainState` y `bot.thunderState` cambiarán.

#### bot.chatPatterns

Esto es un array de objects de patrones, del siguiente formato:
{ /regex/, "chattype", "description")
 * /regex/ - un patrón regex, debería tener al menos dos grupos de captura
 * 'chattype' - el tipo de chat que debería coincidir, puede ser "chat" o "whisper" (susurro), o también puede ser cualquiera.
 * 'description' - descripción del patrón, opcional.

#### bot.settings.chat

Opciones:

 * `enabled` (habilitado) (predeterminado)
 * `commandsOnly` (soloComandos)
 * `disabled` (deshabilitado)

#### bot.settings.colorsEnabled

Su valor predeterminado es true, si debería recibir códigos de color del servidor

#### bot.settings.viewDistance

Opciones:
 * `far` (lejano) (predeterminado)
 * `normal`
 * `short` (cercano)
 * `tiny` (diminuto)

#### bot.settings.difficulty

Lo mismo que server.properties.

#### bot.settings.skinParts

Estos booleans controlan si las partes externas de la skin del jugadordebería ser visible

##### bot.settings.skinParts.showCape

Si tienes una capa puedes desactivarla cambiando esto a false

##### bot.settings.skinParts.showJacket

Si debería mostrarse la skin externa del pecho

##### bot.settings.skinParts.showLeftSleeve

Si debería mostrarse la skin externa del brazo izquierdo

##### bot.settings.skinParts.showRightSleeve

Si debería mostrarse la skin externa del brazo derecho

##### bot.settings.skinParts.showLeftPants

Si debería mostrarse la skin externa de la pierna izquierda

##### bot.settings.skinParts.showRightPants

Si debería mostrarse la skin externa de la pierna derecha

##### bot.settings.skinParts.showHat

Si debería mostrarse la skin externa de la cabeza


#### bot.experience.level

El nivel de experiencia del bot

#### bot.experience.points

Total de los puntos de experiencia del bot

#### bot.experience.progress

Entre 0 y 1 - cantidad que falta para llegar al siguiente nivel.

#### bot.health

Números entre el 0 y el 20 representando el número de mitades de corazón.

#### bot.food

Números entre el 0 y el 20 representando el número de mitades de muslos de pollo.

#### bot.foodSaturation

La saturación actúa como una "sobrecarga" de la comida. Si la saturación es mayor que 0, el nivel de la comida no disminuirá. Los jugadores que entran al juego automáticamente tienen una saturación de 5.0. Comer aumenta la saturación y el nivel de la comida.

#### bot.oxygenLevel

Número entre el 0 y el 20 representando el número de mitades de burbujas del nivel de oxígeno.

#### bot.physics

Modifica estos números para cambiar la gravedad, velocidad del salto, velocidad terminal, etc. Hazlo bajo tu propio riesgo

#### bot.simpleClick.leftMouse (slot)

abstracción de `bot.clickWindow(slot, 0, 0)`

#### bot.simpleClick.rightMouse (slot)

abstracción de `bot.clickWindow(slot, 1, 0)`

#### bot.time.doDaylightCycle

Si el gamerule doDaylightCycle es true o false.

#### bot.time.bigTime

El número total de ticks desde el día 0.

Este valor es de tipo BigInt y es muy preciso incluso con valores muy grandes. (más de 2^51 - 1 tick)

#### bot.time.time

El número total de ticks desde el día 0.

Ya que el límite de números en Javascript es de 2^51 - 1 bot.time.time es menos preciso en valores más altos que este límite, por eso es recomendado el uso de bot.time.bigTime.
Siendo realistas, probablemente nunca tendrás que usar bot.time.bigTime ya que alcanzará naturalmente 2^51 - 1 tick tras ~14280821 años reales.

#### bot.time.timeOfDay

Hora del día, en ticks.

La hora está basada en ticks, donde 20 ticks ocurren cada segundo. Hay 24000 ticks al día, haciendo que los días en Minecraft sean exactamente 20 minutos.

La hora del día está basada en el módulo timestamp 24000. 0 es el amanecer, 6000 es el mediodía, 12000 es el anochecer, y 18000 es medianoche.

#### bot.time.day

Día del mundo

#### bot.time.isDay

Si es de día o no

Basado en si la hora actual está entre los 13000 y 23000 ticks.

#### bot.time.moonPhase

Fase de la luna.

Entre 0 y 7 donde 0 es luna llena.

#### bot.time.bigAge

Edad del mundo, en ticks

Este valor es de tipo BigInt y es preciso incluso en valores muy altos. (más de 2^51 - 1 tick)

#### bot.time.age

Age of the world, in ticks.

Ya que el límite de números en Javascript es de 2^51 - 1 bot.time.age es menos preciso en valores más altos que este límite, por eso es recomendado el uso de bot.time.bigAge.
Siendo realistas, probablemente nunca tendrás que usar bot.time.bigAge ya que alcanzará naturalmente 2^51 - 1 tick tras ~14280821 años reales.

#### bot.quickBarSlot

Que casilla está seleccionada en la barra de acceso rápido (0 - 8).

#### bot.inventory

Una instancia [`Window`](https://github.com/PrismarineJS/prismarine-windows#windowswindow-base-class) (ventana/interfaz) representando tu inventario.

#### bot.targetDigBlock

El `block` (bloque) que estás picando/rompiendo en ese momento, o `null`.

#### bot.isSleeping

Boolean representando si estás durmiendo o no.

#### bot.scoreboards

Todos los scoreboards que el bot conoce en un object de forma nombre scoreboard -> scoreboard

#### bot.scoreboard

Todos los scoreboards que el bot conoce en un object de forma casilla de visualización -> scoreboard.

 * `belowName` - scoreboard que está debajo del nombre
 * `sidebar` - scoreboard que está en la barra del lado
 * `list` - scoreboard que está en la lista
 * `0-18` - casillas definidas en el [protocol](https://wiki.vg/Protocol#Display_Scoreboard)

#### bot.controlState

Un object que contiene los estados de control principales: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']. ('adelante', 'atrás', 'izquierda', 'derecha', 'salto', 'sprint/correr', 'agachado')

Estos valores se pueden usar en [bot.setControlState](#botsetcontrolstatecontrol-state).

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

Solo se emite cuando un jugador chatea públicamente.

 * `username` - el jugador que ha mandado el mensaje (compáralo con `bot.username` para ignorar tus propios mensajes)
 * `message` - mensaje sin códigos de color
 * `translate` - tipo de mensaje de chat. Null para la mayoría de mensajes de bukkit
 * `jsonMsg` - mensaje JSON sin modificar del servidor
 * `matches` - array de las coincidencias devueltas de las expresiones regulares. Puede ser Null

#### "whisper" (username, message, translate, jsonMsg, matches)

Solos se emite cuando un jugador chatea contigo en privado (susurro).

 * `username` - el jugador que ha mandado el mensaje
 * `message` - mensaje sin códigos de color
 * `translate` - tipo de mensaje de chat. Null para la mayoría de mensajes de bukkit
 * `jsonMsg` - mensaje JSON sin modificar del servidor
 * `matches` - array de las coincidencias devueltas de las expresiones regulares. Puede ser Null

#### "actionBar" (jsonMsg)

Se emite por cada mensaje del servidor que aparece en la barra de acción.

 * `jsonMsg` - mensaje JSON sin modificar del servidor

#### "message" (jsonMsg, position)

Se emite por cada mensaje del servidor, incluye chats.

 * `jsonMsg` - mensaje JSON sin modificar del servidor

 * `position` - (>= 1.8.1): la posición del mensaje de chat puede ser
   * chat
   * system
   * game_info

#### "messagestr" (message, messagePosition, jsonMsg)

Parecido a "message" pero ejecuta .toString() en el mensaje JSON para obtener un string del mensaje antes de que se emita.

#### "inject_allowed"
Se enute cuando el archivo index se ha cargado, puedes cargar mcData o los plugins aquí, pero es mejor esperar al evento "spawn".

#### "login"

Se emite tras registrarse en el servidor.
Aunque probablemente quieras esperar al evento "spawn" antes de hacer algo.

#### "spawn"

Se emite cuando te registras y spawneas y cuando respawneas al morir.

Normalmente este es el evento que quieres recibir antes de hacer algo en el servidor.

#### "respawn"

Se emite al cambiar dimensiones o justo antes de spawnear.
Normalmente querrás ignorar este evento y esperar hasta que el evento "spawn" se emita.

#### "game"

Se emite cuando el servidor cambia cualquiera de sus propiedades

#### "resourcePack" (url, hash)

Se emite cuando el servidor manda un paquete de recursos

#### "title"

Se emite cuando el servidor manda/muestra un título

 * `text` - texto del título

#### "rain"

Se emite cuando empieza a llover o cuando para. Si cuando entras a un servidor ya está lloviendo, este evento se emitirá.

#### "weatherUpdate"

Se emite cuando `bot.thunderState` o `bot.rainState` cambia.
Si cuando entras a un servidor y está lloviendo, este evento se emitirá.

#### "time"

Se emite cuando el servidor cambia/actualiza su hora. Mira `bot.time`.

#### "kicked" (reason, loggedIn)

Se emite cuando el bot es echado del servidor. `reason` es un mensaje de chat con la razón del kickeo. `loggedIn` será `true` si el cliente ya estaba conectado cuando se le echó, y `false` si el cliente fue echado durante el proceso de registración.

#### "end"

Se emite cuando ya no estás conectado en el servidor.

#### "error" (err)

Se emite cuando ocurre un error.

#### "spawnReset"

Se emite cuando no puedes spawnear en tu cama, y se resetea tu spawn.

#### "death"

Se emite al morir

#### "health"

Se emite cuando tu vida o el nivel de comida cambia.

#### "breath"

Se emite cuando tu nivel de oxígeno cambia.

#### "entitySwingArm" (entity)

Se emite cuando una entidad mueve su brazo.

#### "entityHurt" (entity)

Se emite cuando una entidad se hace daño.

#### "entityDead" (entity)

Se emite cuando una entidad muere.

#### "entityTaming" (entity)

Se emite cuando una entidad está siendo domesticada.

#### "entityTamed" (entity)

Se emite cuando una entidad es domesticada.

#### "entityShakingOffWater" (entity)

Se emite cuando una entidad se seca (lobos por ejemplo).

#### "entityEatingGrass" (entity)

Se emite cuando una entidad come hierba.

#### "entityWake" (entity)

Se emite cuando una entidad se despierta.

#### "entityEat" (entity)

Se emite cuando una entidad come.

#### "entityCriticalEffect" (entity)

Se emite cuando una entidad recibe un ataque crítico.

#### "entityMagicCriticalEffect" (entity)

Se emite cuando una entidad recibe un ataque crítico con pociones.

#### "entityCrouch" (entity)

Se emite cuando una entidad se agacha.

#### "entityUncrouch" (entity)

Se emite cuando una entidad deja de agacharse.

#### "entityEquip" (entity)

Se emite cuando una entidad equipa algo.

#### "entitySleep" (entity)

Se emite cuando una entidad se duerme.

#### "entitySpawn" (entity)

Se emite cuando una entidad aparece.

#### "itemDrop" (entity)

Se emite cuando una entidad se dropea (los items también son entidades).

#### "playerCollect" (collector, collected)

Se emite cuando una entidad recoge un item.

 * `collector` - la entidad que ha recogido el item.
 * `collected` - la entidad que fue recogida (el item).

#### "entityGone" (entity)

Se emite cuando una entidad desaparece (muere, despawnea).

#### "entityMoved" (entity)

Se emite cuando una entidad se mueve.

#### "entityDetach" (entity, vehicle)

Se emite cuando una entidad se baja en un vehículo.

#### "entityAttach" (entity, vehicle)

Se emite cuando una entidad se sube en un vehículo.

 * `entity` - la entidad que se ha subido
 * `vehicle` - la entidad del vehículo (minecart, caballo)

#### "entityUpdate" (entity)

Se emite cuando una entidad actualiza una de sus propiedades.

#### "entityEffect" (entity, effect)

Se emite cuando una entidad obtiene un efecto.

#### "entityEffectEnd" (entity, effect)

Se emite cuando una entidad finaliza un efecto.

#### "playerJoined" (player)

Se emite cuando un jugador se une al servidor.

#### "playerUpdated" (player)

Se emite cuando un jugador actualiza una de sus propiedades.

#### "playerLeft" (player)

Se emite cuando un jugador se desconecta del servidor.

#### "blockUpdate" (oldBlock, newBlock)

(Es mejor usar este evento desde bot.world en vez que desde bot directamente) Se emite cuando un bloque se actualiza. Devuelve `oldBlock` y `newBlock`.

Nota: `oldBlock` puede ser `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(Es mejor usar este evento desde bot.world en vez que desde bot directamente) Se emite cuando un bloque en una coordenada específica se actualiza. Devuelve `oldBlock` y `newBlock`.

Nota: `oldBlock` puede ser `null`.

#### "blockPlaced" (oldBlock, newBlock)

Se emite cuando el bot coloca un bloque. Devuelve `oldBlock` y `newBlock`.

Nota: `oldBlock` puede ser `null`.

#### "chunkColumnLoad" (point)

Se emite cuando un chunk se carga

#### "chunkColumnUnload" (point)

Se emite cuando un chunk se actualiza. `point` es la coordenada de la esquina del chunk con los valores x, y, y z más pequeños.

#### "soundEffectHeard" (soundName, position, volume, pitch)

Se emite cuando el cliente oye un efecto de sonido con nombre.

 * `soundName`: nombre del efecto de sonido
 * `position`: una instancia Vec3 indicando el punto de donde el sonido ha originado
 * `volume`: volumen con punto flotante, 1.0 es 100%
 * `pitch`: tono con números enteros, 63 es 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

  Se emite cuando el cliente oye un efecto de sonido codificado.

   * `soundId`: id del efecto de sonido
   * `soundCategory`: categoría del efecto de sonido
   * `position`: una instancia Vec3 indicando el punto de donde el sonido ha originado
   * `volume`: volumen con punto flotante, 1.0 es 100%
   * `pitch`: tono con números enteros, 63 es 100%

#### "noteHeard" (block, instrument, pitch)

Se emite cuando un bloque de notas se dispara en algún sitio

 * `block`: una instancia Block, el bloque que ha emitido el sonido
 * `instrument`:
   - `id`: id con números enteros
   - `name`: uno de estos [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`]. (`harpa`, `dobleBajo`, `tambor`, `palos`, `tamborBajo`)
 * `pitch`: El tono de la nota (entre 0 y 24 ambos incluídos donde 0 es el más bajo y 24 es el más alto). Se puede leer más (sobre como los valores de los tonos corresponden a las notas en la vida real) aquí: [official Minecraft wiki](http://www.minecraftwiki.net/wiki/Note_Block).

#### "pistonMove" (block, isPulling, direction)

Se emite cuando un pistón se mueve.

#### "chestLidMove" (block, isOpen, block2)

Se emite cuando la tapa de un cofre se mueve

* `block`: una instancia de Block, el bloque de la tapadera que se ha movido. El bloque derecho si es un cofre doble
* `isOpen`: número de jugadores que tienen el cofre abierto
* `block2`: una instancia de Block, la otra mitad del bloque donde la tapadera se movió. null si no es un cofre doble

#### "blockBreakProgressObserved" (block, destroyStage)

Se emite cuando el cliente observa un bloque mientras este se está rompiendo

 * `block`: una instancia de Block, el que se está rompiendo
 * `destroyStage`: número entero correspondiente al progreso (0-9)

#### "blockBreakProgressEnd" (block)

Se emite cuando el cliente observa un bloque que termina de romperse
Esto ocurre cuando el proceso fue completado o abortado.

 * `block`: una instancia de Block, el bloque que ya no está siendo roto

#### "diggingCompleted" (block)

Se emite cuando se ha terminado de romper un bloque.
 * `block` - el bloque que ya no existe

#### "diggingAborted" (block)

Se emite cuando se ha abortado el proceso de rotura de un bloque.
 * `block` - el bloque que todavía existe

#### "move"

Se emite cuando el bot se mueve. Si quieres la posición actual, puedes usar `bot.entity.position` y si quieres averiguar la posición anterior, usa `bot.entity.positon.minus(bot.entity.velocity)`

#### "forcedMove"

Se emite cuando el bot es movido forzadamente por el servidor (teletransporte, spawnear, ...). Si quieres la posición actual, usa `bot.entity.position`.

#### "mount"

Se emite cuando el bot se sube a una entidad como un minecart. Para tener acceso a la entidad, usa `bot.vehicle`.

Para subirte a una entidad, usa `mount`.

#### "dismount" (vehicle)

Se emite cuando te bajas de una entidad.

#### "windowOpen" (window)

Se emite cuando empiezas a usar una mesa de crafteo, cofre, mesa de pociones, etc.

#### "windowClose" (window)

Se emite cuando ya no estás usando una mesa de crafteo, cofre, etc.

#### "sleep"

Se emite cuando duermes.

#### "wake"

Se emite cuando te despiertas.

#### "experience"

Se emite cuando `bot.experience.*` cambia.

#### "scoreboardCreated" (scoreboard)

Se emite cuando se crea un scoreboard.

#### "scoreboardDeleted" (scoreboard)

Se emite cuando se elimina un scoreboard.

#### "scoreboardTitleChanged" (scoreboard)

Se emite cuando el título de un scoreboard se actualiza.

#### "scoreUpdated" (scoreboard, item)

Se emite cuando la puntuación de un item en el scoreboard se actualiza.

#### "scoreRemoved" (scoreboard, item)

Se emite cuando la puntuación de un item en el scoreboard se elimina.

#### "scoreboardPosition" (position, scoreboard)

Se emite cuando la posición de un scoreboard se actualiza.

#### "bossBarCreated" (bossBar)

Se emite cuando se crea una barra de vida de jefe.

#### "bossBarDeleted" (bossBar)

Se emite cuando se elimina una barra.

#### "bossBarUpdated" (bossBar)

Se emite cuando se actualiza una barra.

#### "heldItemChanged" (heldItem)

Se emite cuando el item que sostienes cambia.

#### "physicsTick" ()

Se emite por cada tick si bot.physicsEnabled está en true.

#### "chat:name" (matches)

Se emite cuando todos patrones de chat tienen coincidencias.

### Functions

#### bot.blockAt(point, extraInfos=true)

Devuelve el bloque en el `point` (punto: un Vec3) o `null` si ese punto no está cargado. Si `extraInfos` está en true, también devuelve informaciones sobre carteles, cuadros y entidades de bloques (más lento). Mira `Block`.

#### bot.waitForChunksToLoad(cb)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

El cb se ejecuta cuando se han cargado bastantes chunks.

#### bot.blockInSight(maxSteps, vectorLength)

Obsoleto, usar `blockAtCursor` en su lugar.

Devuelve el bloque que se encuentra en el cursor del bot o `null`
 * `maxSteps` - Número de pasos del trazado de rayos, el valor predeterminado es 256.
 * `vectorLength` - Longitud del vector del trazado de rayos, el valor predeterminado es `5/16`.

#### bot.blockAtCursor(maxDistance=256)

Devuelve el bloque que se encuentra en el cursor del bot o `null`
 * `maxDistance` - Distancia máxima a la que el bloque puede estar del ojo, el valor predeterminado es 256.

#### bot.canSeeBlock(block)

Devuelve true o false dependiendo de si el bot puede ver el `block` (bloque).

#### bot.findBlocks(options)

Encuentra los bloques más cercanos al punto establecido.
 * `options` - Opciones de búsqueda:
   - `point` - La posición por donde empezar la búsqueda (centro). Predeterminado: la posición del bot.
   - `matching` - Una función que devuelve true si el bloque cumple las condiciones. También puede ser un ID de un bloque o un array de IDs.
   - `useExtraInfo` - Puede ser de dos tipos para preservar una compatibilidad a la inversa.
      - **boolean** - Proporcionas tu función `matching` más datos - más lento
      - **function** - Se hace mediante dos pasos, si el bloque pasa las condiciones de la función `matching` se pasa a `useExtraInfo` con información adicional
   - `maxDistance` - La distancia máxima de búsqueda, predeterminado: 16.
   - `count` - Número de bloques que hay que encontrar antes de devolver los resultados. Predeterminado: 1. Puede devolver menos si no hay suficientes bloques.

Devuelve un array (puede estar vació) con las coordenadas de los bloques encontrados (no devuelve instancias de bloques). El array es ordenado (los más cercanos primero)

#### bot.findBlock(options)

Parecido a `bot.blockAt(bot.findBlocks(options)[0])`. Devuelve un único bloque o `null`.

#### bot.canDigBlock(block)

Devuelve si `block` está dentro del rango y si es posible picarlo.

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

Devuelve una lista de instancias `Recipe` (receta) que puedes usar para craftear `itemType` con `metadata`.

 * `itemType` - ID numérico de la cosa que quieres craftear
 * `metadata` - el valor numérico de metada del item que quieres craftear, `null` significa "con cualquier valor de metadata".
 * `minResultCount` - se basa en tu inventario actual, cualquier receta de la lista devuelta podrá producir este número de items. `null` significa `1`.
 * `craftingTable` - (mesa de crafteo) una instancia `Block`. Si es `null`, solo recetas que se pueden hacer en el inventario estarán incluidas en la lista.

#### bot.recipesAll(itemType, metadata, craftingTable)

Parecido a bot.recipesFor pero este no comprueba si el bot tiene suicientes materiales para la receta.

#### bot.nearestEntity(match = (entity) => { return true })

Devuelve la entidad más cercana al bot, correspondiendo a la función (predeterminado: todas las entidades).
Devuelve null si no se encuentra una entidad.

### Methods

#### bot.end()

Termina la conexión con el servidor.

#### bot.quit(reason)

Para desconectarse con elegancia del servidor con una razón (predeterminado: 'disconnect.quitting')

#### bot.tabComplete(str, cb, [assumeCommand], [sendBlockInSight])

Esta función también devueve un `Promise`, con `matches` como argumento al finalizar.

Solicita completar el mensaje de chat (para comandos).
 * `str` - String para completar.
 * `callback(matches)`
   - `matches` - Array de strings que coinciden.
 * `assumeCommand` - Campo mandado al servidor, predeterminado: false.
 * `sendBlockInSight` - Campo mandado al servidor, predeterminado: true. Cambiarlo a false si quiere más eficacia.

#### bot.chat(message)

Manda un mensaje público al chat. Rompe grandes mensajes en trozos y los manda como múltiples mensajes si es necesario.

#### bot.whisper(username, message)

Atajo de "/tell <username>" (usuario). Todos los trozos serán susurrados al usuario.

#### bot.chatAddPattern(pattern, chatType, description)

Obsoleto, usar `addChatPattern` en su lugar.

Añade un patrón regex a la lista de patrones del bot. Útil para servidores bukkit donde el formato de chat cambia mucho.
 * `pattern` - patrón regex para concidir
 * `chatType` - el evento que el bot emite cuando el patrón coincide: Ej. "chat" or "whisper"
 * 'description ' - Opcional, descripción del patrón

#### bot.addChatPattern(name, pattern, chatPatternOptions)

** esto es parecido a `bot.addChatPatternSet(name, [pattern], chatPatternOptions)`

crea un evento que se emite cada vez que coincide un patrón, el evento se llamará `"chat:nombre"`, siendo nombre el nombre que se ha proporcionado
* `name` - el nombre usado para el evento
* `pattern` - expresión regular para probar en los mensajes
* `chatPatternOptions` - object
  * `repeat` - predeterminado: true, si seguir probando despues de coincidir una vez
  * `parse` - en vez de devolver el mensaje, devolver los grupos de captura del regex
  * `deprecated` - (**unstable**) (inestable) usado por bot.chatAddPattern para mantener compatibilidad, seguramente sea quitado

devuelve un número que puede usarse en bot.removeChatPattern() para eliminar ese patrón

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

crea un evento que se emite cada vez que coinciden todos los patrones, el evento se llamará `"chat:nombre"`, siendo nombre el nombre que se ha proporcionado
* `name` - el nombre usado para el evento
* `patterns` - expresión regular para probar en los mensajes
* `chatPatternOptions` - object
  * `repeat` - predeterminado: true, si seguir probando despues de coincidir una vez
  * `parse` - en vez de devolver el mensaje, devolver los grupos de captura del regex

devuelve un número que puede usarse en bot.removeChatPattern() para eliminar ese set de patrones

#### bot.removeChatPattern(name)

Elimina un patrón / unos patrones
* `name` : string o número

si name es un string, todos los patrones con ese nombre serán eliminados, al contrario, si es un número, solo se eliminará ese patrón exacto

#### bot.awaitMessage(...args)

promise (promesa) que se resuelve cuando uno de los mensajes proporcionados se resuelve

Ejemplo:

```js
async function wait () {
  await bot.awaitMessage('<flatbot> hello world') // resolves on "hello world" in chat by flatbot (se resuelve cuando un usuario llamado flatbot escribe "hello world" en el chat)
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world']) // resolves on "hello" or "world" in chat by flatbot (se resuelve cuando un usuario llamado flatbot escribe "hello" o "world" en el chat)
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world'], ['<flatbot> im', '<flatbot> batman']) // resolves on "hello" or "world" or "im" or "batman" in chat by flatbot (se resuelve cuando un usuario llamado flatbot escribe "hello world", "world", "im" o "batman" en el chat)
  await bot.awaitMessage('<flatbot> hello', '<flatbot> world') // resolves on "hello" or "world" in chat by flatbot
  await bot.awaitMessage(/<flatbot> (.+)/) // resolves on first message matching the regex (se resuelve cuando un usuario llamado flatbot escribe algo que coincide con el patrón)
}
```

#### bot.setSettings(options)

Mira la propiedad `bot.settings`.

#### bot.loadPlugin(plugin)

Introduce un Plugin. No have nada si el plugin ya está cargado/introducido.

 * `plugin` - función

```js
function somePlugin (bot, options) {
  function someFunction () {
    bot.chat('Yay!')
  }

  bot.myPlugin = {} // Good practice to namespace plugin API (hacer esto para evitar errores como que myPlugin no está definido)
  bot.myPlugin.someFunction = someFunction
}

const bot = mineflayer.createBot({})
bot.loadPlugin(somePlugin)
bot.once('login', function () {
  bot.myPlugin.someFunction() // Yay!
})
```

#### bot.loadPlugins(plugins)

Introduce plugins, mira `bot.loadPlugin`.
 * `plugins` - array (lista) de funciones

#### bot.hasPlugin(plugin)

Comprueba si el plugin ya está cargado (o previsto para cargar) en el bot.

#### bot.sleep(bedBlock, [cb])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Dormir en una cama. `bedBlock` tiene que ser una instancia `Block` que es una cama. `cb` es una función que puede tener un parámetro de error por si el bot no puede dormir.

#### bot.isABed(bedBlock)

Devuelve true si `bedBlock` es una cama

#### bot.wake([cb])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Levantarse de una cama. `cb` es una función que puede tener un parámetro de error por si el bot no puede levantarse.

#### bot.setControlState(control, state)

Este es el método principal para controlar los movimientos del bot. Es parecido a presionar teclas en minecraft.
Por ejemplo, forward con true hará que el bot se mueva hacia adelante. Forward con false hará que el bot deje de moverse hacia adelante.
Puedes usar bot.lookAt con esto para controlar el movimiento. El ejemplo jumper.js te enseña como hacerlo

 * `control` - Uno de estos: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'] ('adelante', 'atrás', 'izquierda', 'derecha', 'salto', 'sprint/correr', 'agachado')
 * `state` - `true` o `false`

#### bot.getControlState(control)

Devuelve true si el control está activado.

* `control` - uno de estos ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'] ('adelante', 'atrás', 'izquierda', 'derecha', 'salto', 'sprint/correr', 'agachado')

#### bot.clearControlStates()

Deshabilita todos los controles.

#### bot.lookAt(point, [force], [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Mueve la cabeza.

 * `point` una instancia [Vec3](https://github.com/andrewrk/node-vec3) - mueve la cabeza para que este mirando este punto
 * `force` - Mira `force` en `bot.look`
 * `callback()` opcional, ejecutado cuando esás mirando al `point`

#### bot.look(yaw, pitch, [force], [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Mueve la cabeza.

 * `yaw` - El número de radianes para rotar alrededor del eje vertical, empezando por el este. Sentido anti-horario.
 * `pitch` - Número de radianes para mirar arriba o abajo. 0 significa recto hacia adelante. PI / 2 significa arriba. -PI / 2 significa abajo.
 * `force` - Si está presente y es true, salta la suave transición. Especifícalo como true si quieres valores precisos para soltar items o disparar flechas. Esto no es necesario para cálculos por parte del cliente como para moverse.
 * `callback()` opcional, ejecutado cuando estás mirando al `yaw` y `pitch`

#### bot.updateSign(block, text)

Cambia el texto en un cartel.

#### bot.equip(item, destination, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Equipar un item del inventario.

 * `item` - instancia `Item`. Mira `window.items()`.
 * `destination` (destino)
   - `"hand"` - (mano) `null` es un alias de esto
   - `"head"` - cabeza
   - `"torso"` - pecho
   - `"legs"` - piernas
   - `"feet"` - pies
   - `"off-hand"` - (mano izquierda) when available
 * `callback(error)` - opcional. ejecutado cuando el bot ha equipado el item o cuando ha fallado al hacerlo.

#### bot.unequip(destination, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Quita un item del destino.

#### bot.tossStack(item, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Suelta el stack de items especificado.
 * `item` - el stack de items que quieres soltar
 * `callback(error)` - opcional, ejecutado cuando el bot ha terminado de soltar o cuando ha fallado al hacerlo.

#### bot.toss(itemType, metadata, count, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `itemType` - ID numérico del item que quieres soltar
 * `metadata` - metadata del item que quieres soltar. `null` para cualquier metadata
 * `count` - cuantos items quieres soltar. `null` significa `1`.
 * `callback(err)` - (opcional) ejecutado cuando el bot ha terminado de soltar o cuando ha fallado al hacerlo

#### bot.dig(block, [forceLook = true], [digFace], [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Empezar a picar el `block` (bloque) con el item de la mano.
Mira los eventos "diggingCompleted" y "diggingAborted".

Nota: al empezar a romper un bloque, no podrás romper otro bloque hasta que terminas de romper ese bloque o ejecutas `bot.stopDigging()`.

 * `block` - el bloque que quieres picar
 * `forceLook` - (opcional) si es true, mirar al bloque rápidamente y empezar a picarlo. Si es false, mirar al bloque lentamente antes de picarlo. Adicionalemente, se puede poner 'ignore', para que el bot no mire el bloque al picarlo.
 * `digFace` - (opcional) Predeterminado: 'auto', mira al centro del bloque y lo rompe desde la cara de arriba, también puede ser un vector Vec3 de la cara del bloque donde el bot debería estar mirando. Por ejemplo: ```vec3(0, 1, 0)``` para picar la cara de arriba. También puede ser 'raycast', esto comprueba si alguna cara es visible para empezar a picar por esa cara, esto es útil en servidores con un anti cheat.
 * `callback(err)` - (opcional) ejecutado cuando el bot ha roto el bloque o cuando ha fallado al hacerlo

#### bot.stopDigging()

Parar de romper el bloque.

#### bot.digTime(block)

Devuelve cuanto va a tardar en romper el bloque, en milisegundos.

#### bot.acceptResourcePack()

Acepta el paquete de recursos

#### bot.denyResourcePack()

Deniega el paquete de recursos

#### bot.placeBlock(referenceBlock, faceVector, cb)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `referenceBlock` - (bloque de referencia) el bloque al lado del bloque que quieres colocar
 * `faceVector` - una de las seis direcciones cardinales, por ejemplo, `new Vec3(0, 1, 0)` para la cara de arriba, indicando la cara del bloque de referencia.
 * `cb` será ejecutado cuando el servidor confirma que el bloque ha sido roto

El bloque será colocado en `referenceBlock.position.plus(faceVector)` (posición del bloque de referencia más el vector de cara).

#### bot.placeEntity(referenceBlock, faceVector)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `referenceBlock` - (bloque de referencia) el bloque al lado de donde quieres colocar la entidad
 * `faceVector` - una de las seis direcciones cardinales, por ejemplo, `new Vec3(0, 1, 0)` para la cara de arriba, indicando la cara del bloque de referencia.

La entidad será colocada en `referenceBlock.position.plus(faceVector)` (posición del bloque de referencia más el vector de cara).

#### bot.activateBlock(block, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Golpea un bloque de notas, abre una puerta, etc.

 * `block` - el bloque que hay que activar
 * `callback(err)` - (opcional) ejecutado cuando el bot ha activado el bloque o ha fallado al hacerlo

#### bot.activateEntity(entity, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Activa una entidad, por ejemplo con aldeanos.

 * `entity` - la entidad que hay que activar
 * `callback(err)` - (opcional) ejecutado cuano el bot ha activado la entidad o ha fallado al hacerlo

#### bot.activateEntityAt(entity, position, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Activa una entitdad en la posición especificada, útil para los soportes de armadura.

 * `entity` - la entidad que hay que activar
 * `position` - la posición donde hay que hacer click
 * `callback(err)` - (opcional) ejecutado cuano el bot ha activado la entidad o ha fallado al hacerlo

#### bot.consume(callback)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Consumir / beber el item en la mano

 * `callback(error)` - ejecutado cuano el bot ha consuimdo el item o ha fallado al hacerlo

#### bot.fish(callback)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Pescar con la caña en la mano

 * `callback(error)` - (opcional) ejecutado cuano el bot ha pescado algo o ha fallado al hacerlo

#### bot.activateItem(offHand=false)

Activa el item en la mano. Esto es para comer, disparar flechas, tirar huevos, etc.
El parámetro opcional puede ser `false` para la mano izquierda.

#### bot.deactivateItem()

Desactiva el item en la mano. Esto es como disparas la flecha, dejas de comer, etc.

#### bot.useOn(targetEntity)

Usar el item en la mano en la instancia de `Entity` (entidad). Esto es como colocas un sillín en un caballo o usas las tijeras en una oveja.

#### bot.attack(entity)

Ataca la entidad o el mob.

#### bot.swingArm([hand], showHand)

Reproduce la animación de mover el brazo.

 * `hand` la mano qe se va a animar, puede ser `left` (izquierda) o `right` (derecha). Predeterminado: `right`
 * `showHand` es un boolean que indica si añadir la mano al paquete para mostrar la animación. Predeterminado: `true`

#### bot.mount(entity)

Subirse a una entidad. Para bajarse, usar `bot.dismount`.

#### bot.dismount()

Baja de la entidad en la que estás montado.

#### bot.moveVehicle(left,forward)

Mover el vehículo :

 * left puede ser -1 o 1 : -1 significa derecha, 1 significa izquierda
 * forward puede ser -1 o 1 : -1 significa hacia atrás, 1 significa hacia adelante

Todas las direcciones son relativas a donde está mirando el bot

#### bot.setQuickBarSlot(slot)

 * `slot` - puede ser de 0 a 8, la casilla de la barra de acceso rápido

#### bot.craft(recipe, count, craftingTable, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `recipe` - Una instancia `Recipe`. Mira `bot.recipesFor`.
 * `count` - Cuantas veces quieres repetir la acción.
   Si quieres craftear `8` palos con tablas de madera, pondrías
   `count` a `2`. `null` significa `1`.
 * `craftingTable` - Una instancia de `Block`, la mesa de crafteo que quieres usar. Si el crafteo no necesita una mesa, este argumento se puede dejar como `null`.
 * `callback` - (opcional) Ejecutado cuando el bot ha terminado de craftear y el inventario ha sido actualizado.

#### bot.writeBook(slot, pages, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

 * `slot` es un número de casilla del inventario (36 es la primera casilla, etc.).
 * `pages` es un array de strings representando las páginas.
 * `callback(error)` - opcional. Ejecutado cuando el bot ha terminado de escribir o ha ocurrido un error.

#### bot.openContainer(containerBlock or containerEntity)

Abre un contenedor.
Devuelve un promise con una instancia `Container` que representa el contenedor que estás abriendo.

#### bot.openChest(chestBlock or minecartchestEntity)

Obsoleto. Lo mismo que `openContainer`

#### bot.openFurnace(furnaceBlock)

Abre un horno.
Devuelve un promise con una instancia `Furnace` que representa el horno que estás abriendo.

#### bot.openDispenser(dispenserBlock)

Obsoleto. Lo mismo que `openContainer`

#### bot.openEnchantmentTable(enchantmentTableBlock)

Devuelve un promise con una instancia `EnchantmentTable` que representa la mesa de encantamiento que estás abriendo.

#### bot.openAnvil(anvilBlock)

Devuelve un promise con una instancia `anvil` que representa el yunque que estás abriendo.

#### bot.openVillager(villagerEntity)

Devuelve un promise con una instancia `Villager` que representa la ventana de tradeo que estás abriendo
El evento `ready` en la instancia `Villager` se puede usar para saber cuando están listos los tradeos

#### bot.trade(villagerInstance, tradeIndex, [times], [cb])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Usa la instancia `Villager` para comerciar.

#### bot.setCommandBlock(pos, command, [options])

Cambia las propiedadezs de un bloque de comandos en la posición `pos`.
Ejemplo de `options`:
```js
{
  mode: 2,
  trackOutput: true,
  conditional: false,
  alwaysActive: true
}
```
options.mode puede tener 3 valores: 0 (SEQUENCE) (secuencia), 1 (AUTO), 2 (REDSTONE)
Todas las opciones tienen como predeterminado false, excepto modo que es 2 (para parecerse al bloque de comandos de Minecraft).

#### bot.supportFeature(name)

Esto puede usarse para ver si una característica está disponible en la versión del bot de Minecraft. Normalmente esto es solo para manejar funciones que son específicas de una versión.

Puedes encontrar la lista de características en [./lib/features.json](https://github.com/PrismarineJS/mineflayer/blob/master/lib/features.json) file.

#### bot.waitForTicks(ticks)

Esta función devuelve un promise y espera a que el número de ticks especificado pase dentro del juego, esta función es similar a la función setTimeout de Javascript pero esta funciona con el reloj físico del juego.

### Lower level inventory methods

Estos son métodos de un nivel más bajo para el inventario, pueden ser útils algunas veces pero es mejor usar los métodos presentados arriba si es posible.

#### bot.clickWindow(slot, mouseButton, mode, cb)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Hacer click en la ventana/interfaz actual, los detalles están en https://wiki.vg/Protocol#Click_Window
 * slot - número que representa la casilla de la ventan
 * mouseButton - 0 para click izquierdo, y 1 para click derecho
 * mode - mineflayer solo tiene disponible el modo 0

#### bot.putSelectedItemRange(start, end, window, slot)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Mover el item en la casilla `slot` en un rango especificado

#### bot.putAway(slot)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Mover el item a la casilla `slot` en el inventario.

#### bot.closeWindow(window)

Cerrar la ventana/interfaz.
 * window - la ventana a cerrar

#### bot.transfer(options, cb)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Transferir un item de un rango a otro. `options` es un object con :

 * `window` : la ventana donde el item será movido
 * `itemType` : el tipo de item a mover (id numérico)
 * `metadata` : la metadata del item a mover
 * `sourceStart` and `sourceEnd` : el rango
 * `destStart` and `destEnd` : el rango de destino

#### bot.openBlock(block)

Abre un bloque, por ejemplo un cofre, devuelve un promise con `Window` siendo la ventana abierta.

 * `block` es el bloque a abrir

#### bot.openEntity(entity)

Abre una entidad con un inventario, por ejemplo un aldeano, devuelve un promise con `Window` siendo la ventana abierta.

 * `entity` es la entidad a abrir

#### bot.moveSlotItem(sourceSlot, destSlot, cb)

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Mover un item de una casilla `sourceSlot` a otra `destSlot` en una ventana.

#### bot.updateHeldItem()

Actualiza `bot.heldItem`.

#### bot.getEquipmentDestSlot(destination)

Devuelve el id de la casilla de equipamiento por nombre del destino.

El destino puede ser:
* head - (cabeza)
* torso - (pecho)
* legs - (piernas)
* feet - (pies)
* hand - (mano)
* off-hand - (mano izquierda)

### bot.creative

Esta colección de apis es útil en modo creativo.
Detectar y cambiar de modo no está implementado,
pero se asume y muchas veces se necesita que el bot esté en modo creativo para que estas características funcionen.

#### bot.creative.setInventorySlot(slot, item, [callback])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Proporciona al bot el item especificado en la casilla especificada.
Si se ejecuta dos veces antes de que la primera ejecución no haya terminado, la primera ejecución contendrá un error.

 * `slot` es un número de casilla del inventario (donde 36 es la primera casilla, etc.).
 * `item` es una instancia [prismarine-item](https://github.com/PrismarineJS/prismarine-item) con su metadata, nbtdata, etc.
    Si `item` es `null`, el item en esa casilla será eliminado
 * `callback(err)` (opcional) es un callback que es ejecutado cuando el servidor acepta la transacción o cuando falla al hacerlo.

Si este método cambia algo, se emitirá `bot.inventory.on("updateSlot")`

#### bot.creative.flyTo(destination, [cb])

Esta función también devueve un `Promise`, con `void` como argumento al finalizar.

Ejecuta `startFlying()` y se mueve a una velocidad constante en un espacio tridimensional en línea recta hasta el destino.
`destination` es un `Vec3`, y las coordenadas `x` y `z` a veces terminarán en `.5`.
Está operación no funcionará si hay algún obstáculo en el camino,
por eso es recomendable volar distancias cortas.

Cuando el bot llega al destino, `cb` es ejecutado.

Este método no va a buscar el camino automáticamente.
Se espera que una implementación de path finding usará este método para moverse < 2 bloques a la vez.

Para dejar de volar (volver a las físicas normales), se puede ejecutar `stopFlying()`.

#### bot.creative.startFlying()

Cambia `bot.physics.gravity` a `0`.
Para volver a las físicas normales, se puede ejecutar `stopFlying()`.

Este método es útil si quieres levitar mientras rompes el bloque debajo de tí.
No es necesario ejecutar esta función antes de ejecutar `flyTo()`.

Nota: mientras vuelas, `bot.entity.velocity` no es preciso.

#### bot.creative.stopFlying()

Restablece `bot.physics.gravity` a su valor original.
