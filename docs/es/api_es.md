<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Tabla de contenidos**  *generado con [DocToc](https://github.com/thlorenz/doctoc)*

Esta documentación no está mantenida oficialmente, si quiere ver las últimas novedades, por favor dirijase a la documentación original: [api](api.md)

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
    - [mineflayer.Villager](#mineflayervillager)
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
    - [bot.physicEnabled](#botphysicenabled)
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
      - ["login"](#login)
      - ["spawn"](#spawn)
      - ["respawn"](#respawn)
      - ["game"](#game)
      - ["resourcePack" (url, hash)](#resourcepack-url-hash)
      - ["title"](#title)
      - ["rain"](#rain)
      - ["weatherUpdate"](#weatherUpdate)
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
      - [bot.hasPlugin(plugin)](#bothaspluginplugin)
      - [bot.sleep(bedBlock, [cb])](#botsleepbedblock-cb)
      - [bot.isABed(bedBlock)](#botisabedbedblock)
      - [bot.wake([cb])](#botwakecb)
      - [bot.setControlState(control, state)](#botsetcontrolstatecontrol-state)
      - [bot.getControlState(control)](#botgetcontrolstatecontrol-state)
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
      - [bot.activateBlock(block, [callback])](#botactivateblockblock-callback)
      - [bot.activateEntity(entity, [callback])](#botactivateentityentity-callback)
      - [bot.activateEntityAt(entity, position, [callback])](#botactivateentityatentity-position-callback)
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
      - [bot.openContainer(containerBlock or containerEntity)](#botopencontainercontainerblock-or-containerentity)
      - [bot.openChest(chestBlock or minecartchestEntity)](#botopenchestchestblock-or-minecartchestentity)
      - [bot.openFurnace(furnaceBlock)](#botopenfurnacefurnaceblock)
      - [bot.openDispenser(dispenserBlock)](#botopendispenserdispenserblock)
      - [bot.openEnchantmentTable(enchantmentTableBlock)](#botopenenchantmenttableenchantmenttableblock)
      - [bot.openVillager(villagerEntity)](#botopenvillagervillagerentity)
      - [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)
      - [bot.setCommandBlock(pos, command, [options])](#botsetcommandblockpos-command-options)
      - [bot.supportFeature(name)](#botsupportfeaturename)
      - [bot.waitForTicks(ticks)](#botwaitforticksticks)
    - [Lower level inventory methods](#lower-level-inventory-methods)
      - [bot.clickWindow(slot, mouseButton, mode, cb)](#botclickwindowslot-mousebutton-mode-cb)
      - [bot.putSelectedItemRange(start, end, window, slot, cb)](#botputselecteditemrangestart-end-window-slot-cb)
      - [bot.putAway(slot, cb)](#botputawayslot-cb)
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

Las entidades representan jugadores, mobs, y objetos. Son emitidos en muchos eventos, pero puedes acceder a tu propia entidad con `bot.entity`.
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
   - pluginName : función para injectar : carga un plugin de terceros (externo), anula el plugin interno con el mismo nombre ej. `pluginName`
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

#### "end"

Emitted when you are no longer connected to the server.

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

#### bot.dig(block, [forceLook = true], [digFace], [callback])

This function also returns a `Promise`, with `void` as its argument upon completion.

Begin digging into `block` with the currently equipped item.
See also "diggingCompleted" and "diggingAborted" events.

Note that once you begin digging into a block, you may not
dig any other blocks until the block has been broken, or you call
`bot.stopDigging()`.

 * `block` - the block to start digging into
 * `forceLook` - (optional) if true, look at the block and start mining instantly. If false, the bot will slowly turn to the block to mine. Additionally, this can be assigned to 'ignore' to prevent the bot from moving it's head at all.
 * `digFace` - (optional) Default is 'auto' looks at the center of the block and mines the top face. Can also be a vec3 vector 
 of the face the bot should be looking at when digging the block. For example: ```vec3(0, 1, 0)``` when mining the top. Can also be 'raycast' raycast checks if there is a face visible by the bot and mines that face. Useful for servers with anti cheat.
 * `callback(err)` - (optional) called when the block is broken or you
   are interrupted.

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

#### bot.attack(entity)

Attack a player or a mob.

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

Click on the current window. See details at https://wiki.vg/Protocol#Click_Window

#### bot.putSelectedItemRange(start, end, window, slot, noWaiting)

This function also returns a `Promise`, with `void` as its argument upon completion.

Put the item at `slot` in the specified range.

`noWaiting` will not wait for items to be moved.
Can be useful in case the client is supposed to simulate without feedback from the server.

#### bot.putAway(slot, noWaiting)

This function also returns a `Promise`, with `void` as its argument upon completion.
`noWaiting` calls putSelectedItemRange with `noWaiting` option: it will not wait for items to be moved.
Can be useful in case the client is supposed to simulate without feedback from the server.

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
