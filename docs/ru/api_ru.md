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
      - [bot.time.day](#bottimeday)
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
      - ["entityEquipmentChange" (entity)](#entityequipmentchange-entity)
      - ["entitySleep" (entity)](#entitysleep-entity)
      - ["entitySpawn" (entity)](#entityspawn-entity)
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
      - ["chestLidMove" (block, isOpen)](#chestlidmove-block-isopen)
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
    - [Functions](#functions)
      - [bot.blockAt(point)](#botblockatpoint)
      - [bot.blockInSight(maxSteps, vectorLength)](#botblockinsightmaxsteps-vectorlength)
      - [bot.canSeeBlock(block)](#botcanseeblockblock)
      - [bot.findBlock(options)](#botfindblockoptions)
      - [bot.canDigBlock(block)](#botcandigblockblock)
      - [bot.recipesFor(itemType, metadata, minResultCount, craftingTable)](#botrecipesforitemtype-metadata-minresultcount-craftingtable)
      - [bot.recipesAll(itemType, metadata, craftingTable)](#botrecipesallitemtype-metadata-craftingtable)
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
      - [bot.dig(block, [callback])](#botdigblock-callback)
      - [bot.stopDigging()](#botstopdigging)
      - [bot.digTime(block)](#botdigtimeblock)
      - [bot.placeBlock(referenceBlock, faceVector, cb)](#botplaceblockreferenceblock-facevector-cb)
      - [bot.activateBlock(block, [callback])](#botactivateblockblock-callback)
      - [bot.activateEntity(entity, [callback])](#botactivateentityentity-callback)
      - [bot.consume(callback)](#botconsumecallback)
      - [bot.fish(callback)](#botfishcallback)
      - [bot.activateItem()](#botactivateitem)
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
      - [bot.setCommandBlock(pos, command, track_output)](#botsetcommandblockpos-command-track_output)
    - [Методы инвентаря низкого уровня](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4%D1%8B-%D0%B8%D0%BD%D0%B2%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D1%8F-%D0%BD%D0%B8%D0%B7%D0%BA%D0%BE%D0%B3%D0%BE-%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F)
      - [bot.clickWindow(slot, mouseButton, mode, cb)](#botclickwindowslot-mousebutton-mode-cb)
      - [bot.putSelectedItemRange(start, end, window, slot, cb)](#botputselecteditemrangestart-end-window-slot-cb)
      - [bot.putAway(slot, cb)](#botputawayslot-cb)
      - [bot.closeWindow(window)](#botclosewindowwindow)
      - [bot.transfer(options, cb)](#bottransferoptions-cb)
      - [bot.openBlock(block, Class)](#botopenblockblock-class)
      - [bot.openEntity(entity, Class)](#botopenentityentity-class)
      - [bot.moveSlotItem(sourceSlot, destSlot, cb)](#botmoveslotitemsourceslot-destslot-cb)
      - [bot.updateHeldItem()](#botupdatehelditem)
    - [bot.creative](#botcreative)
      - [bot.creative.setInventorySlot(slot, item, [callback])](#botcreativesetinventoryslotslot-item-callback)
      - [bot.creative.flyTo(destination, [cb])](#botcreativeflytodestination-cb)
      - [bot.creative.startFlying()](#botcreativestartflying)
      - [bot.creative.stopFlying()](#botcreativestopflying)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API

## Enums

Эти данные хранятся не внутри библиотеки Mineflayer [minecraft-data](https://github.com/PrismarineJS/minecraft-data) ,
 и доступны через [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

### minecraft-data
Данные доступны в модуле [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)

Используйте `require('minecraft-data')(bot.version)`

### mcdata.blocks
Идентификация блоков по ID

### mcdata.items
Идентификация предметов по ID

### mcdata.materials

Объект в качестве идентификатора элемента инструмента

### mcdata.recipes
Идентификация крафтов по ID

### mcdata.instruments
Идентификация инструментов по ID

### mcdata.biomes
Идентификация биомов по ID

### mcdata.entities
Идентификация существ по ID

## Classes

### vec3

Смотрите [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

Все координаты библиотеки Mineflayer используют данный класс

 * x - юг
 * y - вверх
 * z - запад

Функции и методы, требующие точного аргумента, как правило, используют `Vec3`,
а также массив с тремя значениями "x", "y", "z"

### mineflayer.Location

### Entity

Существами являются игроки, мобы и объекты. Вы также можете получить доступ
к своему существу, используя `bot.entity`.
Смотрите [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

### Block

Смотрите [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

`block.blockEntity` является дополнительным значением с данными объекта "Object"
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
  Text4: { toString: Function }, // ChatMessage object
}
```

### Biome

Смотрите [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

Смотрите [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

Смотрите [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

### Recipe

Смотрите [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe)

### mineflayer.Chest

Предоставляет сеанс взаимодействия с сундуками ( Открытие и закрытие )
Смотрите `bot.openChest(chestBlock or minecartchestEntity)`.

#### chest.window

Если сундук открыт, этим свойством является `ChestWindow`.
Если же сундук закрыт, этим свойством является `null`.

#### chest "open"

Срабатывает, когда сундук открыт

#### chest "close"

Срабатывает, когда сундук закрыт

#### chest "updateSlot" (oldItem, newItem)

Срабатывает, когда в просматриваемом Вами сундуке обновляются слоты

#### chest.close()

#### chest.deposit(itemType, metadata, count, [callback])

 * `itemType` - ID предмета
 * `metadata` - числовое значение. `null` может совпадать с чем угодно.
 * `count` - количество предметов. `null` является 1 предметом
 * `callback(err)` - (необязательно) - Срабатывает при успешном действии

#### chest.withdraw(itemType, metadata, count, [callback])

 * `itemType` - ID предмета
 * `metadata` - числовое значение. `null` может совпадать с чем угодно.
 * `count` - количество предметов. `null` является 1 предметом
 * `callback(err)` - (необязательно) - Срабатывает при успешном действии

#### chest.count(itemType, [metadata])

Возвращает количество предметов разных типов

 * `itemType` - ID предмета
 * `metadata` - (необязательно) - Срабатывает при успешном действии

#### chest.items()

Возвращает список предметов в `Item`, которые на момент вызова находились в сундуке.

### mineflayer.Furnace

Смотрите `bot.openFurnace(furnaceBlock)`.

#### furnace "open"

Срабатывает, когда печь открыта

#### furnace "close"

Срабатывает, когда печь закрыта

#### furnace "update"

Срабатывает при обновлении `furnace.fuel` и/или обновлении `furnace.progress`.

#### furnace "updateSlot" (oldItem, newItem)

Срабатывает, когда в печи обновился слот для плавки

#### furnace.close()

#### furnace.takeInput([callback])

 * `callback(err, item)`

#### furnace.takeFuel([callback])

 * `callback(err, item)`

#### furnace.takeOutput([callback])

 * `callback(err, item)`

#### furnace.putInput(itemType, metadata, count, [cb])

#### furnace.putFuel(itemType, metadata, count, [cb])

#### furnace.inputItem()

Возвращает предметы в `Item`, которые на момент вызова находились в печи.

#### furnace.fuelItem()

Возвращает предмет в `Item`, которые на момент вызова находились в слоте для топлива печи.

#### furnace.outputItem()

Возвращает предмет в `Item`, который на момент вызова был доступен для вывода

#### furnace.fuel

Возвращает количество топлива в печи

#### furnace.progress

Возвращает прогресс плавки предмета

### mineflayer.Dispenser

Смотрите `bot.openDispenser(dispenserBlock)`.

#### dispenser "open"

Срабатывает, когда раздатчик был открыт

#### dispenser "close"

Срабатывает, когда раздатчик был закрыт

#### dispenser "updateSlot" (oldItem, newItem)

Срабатывает, когда в раздатчик положили предмет

#### dispenser.close()

#### dispenser.items()

Возвращает список предметов в `Item`, которые лежат в раздатчике.

#### dispenser.deposit(itemType, metadata, count, [callback])

 * `itemType` - ID предмета
 * `metadata` - числовое значение. `null` может совпадать с чем угодно.
 * `count` - количество предметов. `null` является 1 предметом
 * `callback(err)` - (необязательно) - Срабатывает при успешном действии

#### dispenser.withdraw(itemType, metadata, count, [callback])

 * `itemType` - ID предмета
 * `metadata` - числовое значение. `null` может совпадать с чем угодно.
 * `count` - количество предметов. `null` является 1 предметом
 * `callback(err)` - (необязательно) - Срабатывает при успешном действии

#### dispenser.count(itemType, [metadata])

Возвращает число определенного предмета, находящегося в раздатчике.

 * `itemType` - numerical item id
 * `metadata` - (optional) numerical value. `null` means match anything.

### mineflayer.EnchantmentTable

Смотрите `bot.openEnchantmentTable(enchantmentTableBlock)`.

#### enchantmentTable "open"

Срабатывает, когда стол зачарований был открыт

#### enchantmentTable "close"

Срабатывает, когда стол зачарований был закрыт

#### enchantmentTable "updateSlot" (oldItem, newItem)

Срабатывает, когда в стол зачарований положили предмет

#### enchantmentTable "ready"

Срабатывает, когда `enchantmentTable.enchantments` готов к зачарованию и вы
можете зачаровать предмет, используя `enchantmentTable.enchant(choice)`.

#### enchantmentTable.close()

#### enchantmentTable.targetItem()

Возвращает текущий предмет в столе зачарования. Этот метод может использоваться как для того чтобы положить предмет, так и для того, чтобы забрать его.

#### enchantmentTable.enchantments

Возвращает массив из трёх зачарований, доступных для выбориа
`level` может являтся `null`, если сервер ещё не отправил данные. Это нормально.

Пример:

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

 * `choice` - [0-2], индекс массива (уровня зачарования), который Вы можете выбрать
 * `callback(err, item)` - (необязательно) Срабатывает, когда предмет зачарован

#### enchantmentTable.takeTargetItem([callback])

 * `callback(err, item)`

#### enchantmentTable.putTargetItem(item, [callback])

 * `callback(err)`

### mineflayer.Villager

Смотрите `bot.openVillager(villagerEntity)`.

#### villager "open"

Срабатывает, когда GUI торговли открыто

#### villager "close"

Срабатывает, когда интерфейс торговли закрыт

#### villager "updateSlot" (oldItem, newItem)

Срабатывает, когда предмет был положен в ячейку для торговли

#### villager "ready"

Возвращает, когда `villager.trades` был загружен

#### villager.close()

#### villager.trades

Массив вариантов торговли

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

### mineflayer.ScoreBoard

#### ScoreBoard.name

Имя скорборда

#### ScoreBoard.title

Название скорборда (может не совпадать с ScoreBoard.title)

#### ScoreBoard.itemsMap

Объект со всеми элементами скорборда
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

Массив со всеми отсортированными элементами скорборда
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.BossBar

#### BossBar.title

Название боссбара, передается в `ChatMessage`

#### BossBar.health

Количество здоровья от `0` до `1`. Пример: ( 0.9873 )

#### BossBar.dividers

Количество ячеек, является одним числом из  `0`, `6`, `10`, `12`, `20`

#### BossBar.entityUUID

UIID босса

#### BossBar.shouldDarkenSky

Определяет, стоит ли затемнять небо

#### BossBar.isDragonBar

Определяет, является ли боссбар - боссбаром Дракона Края

#### BossBar.createFog

Определяет, стоит ли создават туман

#### BossBar.color

Определяет цвет боссбара `pink`, `blue`, `red`, `green`, `yellow`, `purple`, `white` ("розовый", "голубой", "красный", "желтый", "фиолетовый", "белый")

## Bot

### mineflayer.createBot(options)

Create and return an instance of the class bot.
`options` это объект, который содержит в себе :
 * username : по умолчанию "Player"
 * port : по умолчанию 25565
 * password : может быть пропущен, если подключение осуществляется к пиратскому серверу
 * host : default to localhost
 * version : по умолчанию установлен автоопределитель версии сервера. Пример использования : "1.12.2"
 * clientToken : генерируется, если задан пароль
 * accessToken : генерируется, если задан пароль
 * logErrors : установлен по умолчанию, используется для отлова ошибок
 * keepAlive : отправка пакета активности, по умолчанию активен
 * checkTimeoutInterval : по умолчанию `30*1000` (30 сек.), не используется если не используется keepAlive
 * loadInternalPlugins : по умолчанию активен
 * plugins : объект : по умолчанию {}
   - pluginName : false : не загружать плагин с заданным именем. `pluginName`
   - pluginName : true : загрузить плагин с заданным именем. `pluginName` даже если loadInternalplugins отключен
   - pluginName : external plugin inject function : загружает сторонний плагин, задает новое имя плагина при активном существущем
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
 * chatLengthLimit : максимальное количество символов, отправляемое в чат. Если не установлено, будет установлено следующее: 100 в < 1.11 и 256 в >= 1.11.

### Properties

#### bot.entity

Ваше собственное существо. Смотрите `Entity`.

#### bot.entities

Все ближайшие существа.

#### bot.username

Используйте это, чтобы узнать имя бота.

#### bot.spawnPoint

Показывает координаты спавна бота

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.maxPlayers

### bot.player

Объект игрока
```js
{
  username: 'player',
  displayName: { toString: Function }, // Объект ChatMessage.
  gamemode: 0,
  ping: 28,
  entity: entity, // null, если Вы находитесь слишком далеко
}
```

#### bot.players

Показывает всех игроков, которые находятся на сервере

#### bot.isRaining

#### bot.chatPatterns

Массив шаблонов следующего формата:
{ /regex/, "chattype", "description")
 * /regex/ - шаблон регулярного выражения, который должен иметь как минимум две группы захвата
 * 'chattype' - тип чата, который может является "chat" или "whisper"
 * 'description' - описание шаблона, необязательно

#### bot.settings.chat

Выбор:

 * `enabled` (default)
 * `commandsOnly`
 * `disabled`

#### bot.settings.colorsEnabled

По умолчанию активен, используется для отображения кодов цветов

#### bot.settings.viewDistance

Выбор:
 * `far` (по умолчанию)
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

Вернет то же, что и в server.properties.

#### bot.settings.skinParts.showCape

Если у вас есть плащ, вы можете отключить его, установив для него значение false.

#### bot.settings.skinParts.showJacket

#### bot.settings.skinParts.showLeftSleeve

#### bot.settings.skinParts.showRightSleeve

#### bot.settings.skinParts.showLeftPants

#### bot.settings.skinParts.showRightPants

#### bot.settings.skinParts.showHat

#### bot.experience.level

#### bot.experience.points

Общее количество очков опыта.

#### bot.experience.progress

От 0 до 1 - сумма для перехода на следующий уровень.

#### bot.health

Число от 0 до 20. Каждое число является половиной ячейки здоровья в игре

#### bot.food

Число от 0 до 20. Каждое число является половиной ячейки голода в игре

#### bot.foodSaturation

Покажет насыщенность голода. Голод не уменьшается
если насыщенность больше нуля. Игроки, зашедшие на сервер, автоматически получают
насыщенность 5,0. Еда увеличивает как насыщенность так и голод


#### bot.physics

Изменение значений скорости, отдачи, скорости прыжка и т.д
Изменяйте на свой страх и риск!

#### bot.time.day

Время суток в тиках.

Время основано на тиках, где каждую секунду происходит 20 тиков. 24000 в Майнкрафте 
являются 20 минутам реальной игры

Время суток основано на тиках. 0 - восход, 6000
полдень, 12000 - закат, а 18000 - полночь.

#### bot.time.age

Возраст мира в тиках

#### bot.quickBarSlot

Показывает, какой слот сейчас активен ( 0 - 8 )

#### bot.inventory

Является `Window`, отображающий ваш инвентарь.

#### bot.targetDigBlock

Показывает блок, который вы сейчас копаете, или же `null`.

#### bot.isSleeping

Возвращает true или false, в зависимости от того,
лежите вы в кровати или нет

#### bot.scoreboards

Показывает все известные скорборды

#### bot.scoreboard

Показывает все скорборды в "Object"

 * `belowName` - скорборд размещен снизу
 * `sidebar` - скорборд размещен на боковой панели
 * `list` - скорборд помещен в список
 * `0-18` - слоты, определенные в [протоколе](https://wiki.vg/Protocol#Display_Scoreboard)

#### bot.controlState

Обьект, который осуществляет управление ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
Или же ['вперед', 'назад', 'влево', 'вправо', 'прыгнуть', 'бежать', 'сесть'] (Не использовать в методе)

Подробнее [bot.setControlState](#botsetcontrolstatecontrol-state).

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

При обращении в чате

 * `username` - имя отправителя (сравните с bot.username, если вы не хотите видет собственные сообщения)
 * `message` - сообщение (очищенно от всех цветовых кодов)
 * `translate` - Тип сообщение. В большинстве случаев является null
 * `jsonMsg` - сообщение в JSON
 * `matches` - массив совпадений в регулярных выражениях. Может являтся null

#### "whisper" (username, message, translate, jsonMsg, matches)

При обращении в ЛС
 * `username` - имя отправителя
 * `message` - сообщение (очищенно от всех цветовых кодов)
 * `translate` - Тип сообщение. В большинстве является null
 * `jsonMsg` - сообщение в JSON
 * `matches` - массив совпадений в регулярных выражениях. Может являтся null

#### "actionBar" (jsonMsg)

При появлении в панели действия

 * `jsonMsg` - сообщение в JSON

#### "message" (jsonMsg, position)

При появлении любого серверного сообщения, включая чаты

 * `jsonMsg` - сообщение в JSON
 * `position` - (> = 1.8.1): положение сообщения чата может быть
   * Чат
   * Система
   * информация об игре

#### "login"

Срабатывает при успешном подключении к серверу
Отличается от "spawn"

#### "spawn"

Выдается один раз после того, как вы вошли на сервер
и каждый раз, после смерти.


#### "respawn"

Срабатывает при появлении в мире
Обычно используется вызов "spawn"

#### "game"

Срабатывает, если сервер меняет свойства в server.properties

#### "title"

Срабатывает, когда сервер отправляет заголовок

 * `text` - заголовок текста

#### "rain"

Срабатывает, когда начинается или прекращается дождь. Если вы присоединитесь к
серверу, на котором уже идет дождь, это событие также сработает.

#### "time"

Срабатывает, когда сервер принудительно обновляет время. Смотрите `bot.time`.

#### "kicked" (reason, loggedIn)

Срабатывает при отключении от сервера. `reason`
выводит причину отключения. `loggedIn`
является `true`, если вы были кикнуты после успешного входа в систему,
или `false`, если отключение произошло во время подключения

#### "end"

Срабатывает, когда вы отключены от сервера

#### "spawnReset"

Срабатывает, когда вы не можете заспавнится у своей кровати, и ваша точка появления сбрасывается

#### "death"

Срабатывает, когда вы умерли

#### "health"

Срабатывает, когда значения здоровья или голода изменяются

#### "entitySwingArm" (entity)
#### "entityHurt" (entity)
#### "entityWake" (entity)
#### "entityEat" (entity)
#### "entityCrouch" (entity)
#### "entityUncrouch" (entity)
#### "entityEquipmentChange" (entity)
#### "entitySleep" (entity)
#### "entitySpawn" (entity)
#### "playerCollect" (collector, collected)

Если существо подняло предмет

 * `collector` - существо, поднявшее предмет
 * `collected` - существо, которое являлось поднятым предметом

#### "entityGone" (entity)
#### "entityMoved" (entity)
#### "entityDetach" (entity, vehicle)
#### "entityAttach" (entity, vehicle)

Если существо сидит в транспортном средстве,
таком как лодка, вагонетка

 * `entity` - существо, которое сидит в транспортном средстве
 * `vehicle` - существо, которое является транспортным средством

#### "entityUpdate" (entity)
#### "entityEffect" (entity, effect)
#### "entityEffectEnd" (entity, effect)
#### "playerJoined" (player)
#### "playerLeft" (player)

#### "blockUpdate" (oldBlock, newBlock)

Срабатывает, когда блок обновлен. `oldBlock` и` newBlock` могут сравниватся

Стоит заметить, что `oldBlock` может быть `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

Срабатывает при обновлении блока в определенном месте. `oldBlock` и` newBlock` могут сравниватся

Стоит заметить, что `oldBlock` может быть `null`.

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

Fires when a chunk has updated. `point` is the coordinates to the corner
of the chunk with the smallest x, y, and z values.

#### "soundEffectHeard" (soundName, position, volume, pitch)

Срабатывает, когда вы слышите звуковой эффект

 * `soundName`: имя звукового эффекта
 * `position`:  координаты, где был проигран звук
 * `volume`: уровень звука, 1.0 является 100%
 * `pitch`: искажение звука, 63 является 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

Срабатывает, когда вы слышите сильной искаженный звуковой эффект

 * `soundId`: ID имя звукового эффекта
 * `soundCategory`: категория звукового эффекта
 * `position`: координаты, где был проигран звук
 * `volume`: уровень звука, 1.0 является 100%
 * `pitch`: Искажение звука, 63 является 100%

#### "noteHeard" (block, instrument, pitch)

Срабатывает, когда был проигран звук нотного блока

 * `block`: имя блока
 * `instrument`:
   - `id`: определенный ID
   - `name`: один из видов звука [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`].
 * `pitch`: Высота ноты (от 0 до 24 включительно, где 0 - это
    самый низкий, а 24 -  самый высокий). Больше информации о том можно найти на
   [оффициальном Minecraft wiki](http://www.minecraftwiki.net/wiki/Note_Block).

#### "pistonMove" (block, isPulling, direction)

#### "chestLidMove" (block, isOpen)

#### "blockBreakProgressObserved" (block, destroyStage)

Срабатывает, когда вы наблюдаете процесс разрушения блока

 * `block`: имя блока, который ломается
 * `destroyStage`: уровень прогресса (0 - 9) 

#### "blockBreakProgressEnd" (block)

Срабатывает, когда процесс разрушения блока прекращен.
Происходит при прекращении разрушения блока или его полного разрушения

 * `block`: имя блока, процесс разрушения которого был прекращен

#### "diggingCompleted" (block)

 * `block` - блок, который больше не существует

#### "diggingAborted" (block)

 * `block` - блок, который все ещё существует

#### "move"

Срабатывает при движении бота. Если вы хотите узнать текущее положение, используйте
`bot.entity.position` если вы хотите узнать предыдущее положение, используйте
`bot.entity.position.minus(bot.entity.velocity)`.

#### "forcedMove"

Срабатывает при принудительном перемещении бота (телепорт, спавн). Если вы хотите узнать текущее положение, используйте
`bot.entity.position`.

#### "mount"

Срабатывает, если вы устанавливаете объект, например тележку. Чтобы получить доступ к ней,
используйте `bot.vehicle`.

Чтобы установить её, используйте `mount`.

#### "dismount" (vehicle)

Срабатывает, если вы слезли с существа

#### "windowOpen" (window)

Срабатывает, если вы используете верстак, сундук и т.д

#### "windowClose" (window)

Срабатывает, если вы закрыли верстак, сундук и т.д

#### "sleep"

Срабатывает, если вы лягли спать

#### "wake"

Срабатывает, если вы проснулись

#### "experience"

Срабатывает, если значение `bot.experience.*` было обновлено

#### "scoreboardCreated" (scoreboard)

Срабатывает, если скорборд был создан

#### "scoreboardDeleted" (scoreboard)

Срабатывает, если скорборд был удален

#### "scoreboardTitleChanged" (scoreboard)

Срабатывает, если скорборд был обновлен

#### "scoreUpdated" (scoreboard, item)

Срабатывает, если значение в скорборде было обновлено

#### "scoreRemoved" (scoreboard, item)

Срабатывает, если значение в скорборде было удалено

#### "scoreboardPosition" (position, scoreboard)

Срабатывает, если позиция скорборда была обновлена

#### "bossBarCreated" (bossBar)

Срабатывает, если боссбар был создан

#### "bossBarDeleted" (bossBar)

Срабатывает, если боссбар был удален

#### "bossBarUpdated" (bossBar)

Срабатывает, если боссбар был обновлен

### Functions

#### bot.blockAt(point)

Возвращает блок в `point` или `null`, если эта точка не загружена
Смотрите `Block`.

#### bot.blockInSight(maxSteps, vectorLength)

Возвращает блок, на который смотрит бот, либо `null`
 * `maxSteps` - количество блоков, по умолчанию 256.
 * `vectorLength` - длина вектора, по умолчанию `5/16`.

#### bot.canSeeBlock(block)

Возвращает true или false, в зависимости от того,
видит ли бот указанный блок, или нет

#### bot.findBlock(options)

Находит ближайший блок, указанный в точке
 * `options` - Дополнительные параментры для поиска:
   - `point` -Начальная точка для поиска.
   - `matching` - Функция, которая возвращает true, если указанный блок найден. Значение является ID блока, или массивом ID блоков
   - `maxDistance` - Максимальная дистанция поиска, по умолчанию 16.

Это простой пример, для более полного поиска, использующего алгоритмы,
 используйте [mineflayer-blockfinder](https://github.com/Darthfett/mineflayer-blockfinder), которое имеет похожее API

#### bot.canDigBlock(block)

Возвращает, является ли `block` ломаемым и находится в пределах диапазона

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

Возвращает список рецептов (Recipe) которые вы можете использовать для крафта 
предмета(itemType) с метаданными(metadata).

 * `itemType` - ID предмета, который вы хотите создать
 * `metadata` - значение метаданных создаваемого предмета, null соответствует любым метаданным
 * `minResultCount` - количество создаваемого предмета, null эквивалентно 1 предмету,
	присутствует проверка на количество материала, требуемого для изготовления предмета
 * `craftingTable` - блок верстака, при указании null предмет создается в вашем инвентаре

#### bot.recipesAll(itemType, metadata, craftingTable)

То же, что и bot.recipesFor, но без проверки на количество материала, требуемого для изготовления предмета

### Methods

#### bot.end()

Завершить соединение с сервером

#### bot.quit(reason)

Принудительно завершить соиденение по собственной причине (по умолчанию 'disconnect.quitting').

#### bot.tabComplete(str, cb, [assumeCommand], [sendBlockInSight])

Запрашивает чат севрера
 * `str` - Строка для завершения
 * `callback(matches)`
   - `matches` - Массив с совпадениями.
 * `assumeCommand` - Поле отправлено на сервер, по умолчанию отключено.
 * `sendBlockInSight` - Поле отправлено на сервер, по умолчанию включено. Установите для этого параметра значение false, если вы хотите повысить производительность.

#### bot.chat(message)

Отправляет сообщение. При необходимости разбивает большое сообщение на несколько маленьких

#### bot.whisper(username, message)

Аналог "/tell <никнейм>". Все разделенные сообщения будут отправлятся пользователю

#### bot.chatAddPattern(pattern, chatType, description)

Добавляет шаблон чата. Полезно, если формат чата сильно меняется за счёт плагинов
 * `pattern` -  регулярное выражение для совпадения
 * `chatType` - вид сообщения. Например: "chat" или "whisper"
 * 'description' - Необязательно, описание шаблона

#### bot.setSettings(options)

Посмотреть значение `bot.settings`.

#### bot.loadPlugin(plugin)

Загрузить плагин
 * `plugin` - функция

```js
function somePlugin(bot, options) {
  function someFunction() {
    bot.chat('Yay!');
  }
  bot.someFunction = someFunction;
}

var bot = mineflayer.createBot(...);
bot.loadPlugin(somePlugin);
bot.once('login', function() {
  bot.someFunction(); // Yay!
});
```

#### bot.loadPlugins(plugins)

О загрузке плагинов смотрите в `bot.loadPlugin`.
 * `plugins` - массив функций

#### bot.sleep(bedBlock, [cb])

Отправить бота спать. `bedBlock` должен являтся блоком. `cb` может иметь параментр "err", если бот не может лечь спать

#### bot.isABed(bedBlock)

Возвращает true если `bedBlock` является кроватью

#### bot.wake([cb])

Встать с кровати. `cb` может иметь параментр "err", если бот не может встать

#### bot.setControlState(control, state)

 * `control` - одно из ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
 * `state` - `true` или `false`

#### bot.clearControlStates()

Отключить элементы управления

#### bot.lookAt(point, [force], [callback])

 * `point` - наклонить голову к указанной точке
 * `force` - Смотрите `force` в `bot.look`
 * `callback()` необязательно, вызывается если вы смотрите на указанную точку

#### bot.look(yaw, pitch, [force], [callback])

Установить направление головы

 * `yaw` - Количество радианов для вертикальной оси
 * `pitch` - Количество радианов для поворота вверх или вниз. 0  - строго вперед.
   pi / 2 - смотреть вверх. -pi / 2 - смотреть вниз
 * `force` - Если установлен true, плавный переход не состоится. Укажите значение true,
 для проверки на стороне сервера. Рекомендуется включать, чтобы избежать конфликтов с античитом
 * `callback()` - необязательно, вызывается, если бот смотрит на указанную точку

#### bot.updateSign(block, text)

Обновить текст на табличке

#### bot.equip(item, destination, [callback])

Надеть вещи из инвентаря

 * `item` - Предмет. Смотрите `window.items()`.
 * `destination`
   - `"hand"` - `null` альтернатива к этому
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
 * `callback(error)` - необязательно. вызывается при успешной экипировке,
 или при ошибке

#### bot.unequip(destination, [callback])

Снять предмет

#### bot.tossStack(item, [callback])

 * `item` - стак предмета, который вы хотите выбросить
 * `callback(error)` - необязательно, вызывается если предмет выкинут, либо при ошибке

#### bot.toss(itemType, metadata, count, [callback])

 * `itemType` - ID предмета, который вы хотите выбросить
 * `metadata` - метаданные предмета. Используйте `null`
   чтобы выбрать любые метаданные 
 * `count` - количество предмета. null равно 1
 * `callback(err)` - (необязательно) вызывается при успешной операции

#### bot.dig(block, [callback])

Начать ломать блок предметом, который экипирован в руке
Смотрите также события "diggingCompleted" и "diggingAborted".

Обратите внимание, что вы не сможете ломать другие блоки, 
пока выбранный блок не будет сломан, либо не будет вызвана функция
`bot.stopDigging()`.

 * `block` - блок, который нужно ломать
 * `callback(err)` - (необязательно) вызывается если блок сломан, или операция прервана

#### bot.stopDigging()

#### bot.digTime(block)

Покажет время, которое нужно потратить, чтобы сломать блок

#### bot.placeBlock(referenceBlock, faceVector, cb)

 * `referenceBlock` - блок, который вы хотите разместить рядорм
 * `faceVector` - один из шести направлений `new Vec3(0, 1, 0)`, чтобы указать сторону,
 куда нужно поставить блок
 * `cb` вызывается, если сервер подтвердит, что блок поставлен

Новый блок будет размещен на координатах `referenceBlock.position.plus(faceVector)`.

#### bot.activateBlock(block, [callback])

Ударить нотный блок, открыть дверь и т.д

 * `block` - активируемый блок 
 * `callback(err)` - (необязательно) вызывается, если блок активирован

#### bot.activateEntity(entity, [callback])

Нажать на существо, например житель, или NPC

 * `entity` - активируемре существо
 * `callback(err)` - (необязательно) вызывается, если существо активировано

#### bot.consume(callback)

Съесть/выпить предмет, который находится в руке

 * `callback(error)` - вызывается, если предмет использован

#### bot.fish(callback)

Использовать удочку

 * `callback(error)` - вызывается, если рыбалка окончена

#### bot.activateItem()

Активирует предмет, который находится в руке. Используется для выстрела из лука, бросания яиц и т.д

#### bot.deactivateItem()

Деактивирует предмет, который находится в руке. Например для прекращения натягивания тетевы лука и т.д

#### bot.useOn(targetEntity)

Использует предмет, который находится в руке на существе. Например, одеть седло или использовать ножницы

#### bot.attack(entity)

Атаковать игрока или моба

#### bot.swingArm([hand])

Сыграть анимацию удара руки

 * `hand` может быть `left` или `right`. По умолчанию: `right`

#### bot.mount(entity)

Сесть в транспортное средство.

#### bot.dismount()

Вылезть из транспортного средства.

#### bot.moveVehicle(left,forward)

Двигатся в транспортном средстве:

 * по сторонам: -1 или 1 : -1 означает вправо, 1 означает влево
 * вперед/назад: -1 или 1 : -1 означает назад, 1 означает вперед

Направление относительно того, куда смотрит бот

#### bot.setQuickBarSlot(slot)

 * `slot` - выбрать слот ( 0 - 8 )

#### bot.craft(recipe, count, craftingTable, [callback])

 * `recipe` - рецепт крафта. Смотрите `bot.recipesFor`.
 * `count` - количество предмета крафта
   Если вы хотите скрафтить 8 досок в палки,  вы должны установить
   `count` в `2`. `null` является 1
 * `craftingTable` - блок верстака, при указании null предмет крафтится в вашем инвентаре
 * `callback` - (необязательно) Вызыватся если крафт завершен успешно

#### bot.writeBook(slot, pages, [callback])

 * `slot` - слот в инвентаре ( 0 - 36)
 * `pages` - массив страниц
 * `callback(error)` - необязательно. вызывается если редактирование завершено, либо при вызове ошибки

#### bot.openChest(chestBlock or minecartchestEntity)

Открывает сундук

#### bot.openFurnace(furnaceBlock)

Открывает печь

#### bot.openDispenser(dispenserBlock)

Открывает раздатчик

#### bot.openEnchantmentTable(enchantmentTableBlock)

Открывает стол зачарований

#### bot.openVillager(villagerEntity)

Открывает торговлю с жителем

#### bot.trade(villagerInstance, tradeIndex, [times], [cb])

Использует `villagerInstance` для торговли

#### bot.setCommandBlock(pos, command, track_output)

.Установить командный блок по координатам

### Методы инвентаря низкого уровня

Эти методы могут быть иногда полезны, но мы рекомендуем использовать методы, описанные выше

#### bot.clickWindow(slot, mouseButton, mode, cb)

Нажать на слот

#### bot.putSelectedItemRange(start, end, window, slot, cb)

Поместить предмет в слот в указаном диапазоне

#### bot.putAway(slot, cb)

Поместить предмет в слот инвентаря

#### bot.closeWindow(window)

Закрыть окно(GUI)

#### bot.transfer(options, cb)

Поместить предмет с одного диапазона в другой. `options` это объект, содержащий :

 * `window` : окно, куда требуется положить предмет
 * `itemType` : тип предмета
 * `metadata` : метаданные предмета
 * `sourceStart` и `sourceEnd` : старый диапазон
 * `destStart` и `destEnd` : новый диапазон

#### bot.openBlock(block, Class)

Открыть блок, например сундук

 * `block` блок, который нужен открыть
 * `Class` тип окна, которое нужно открыть

#### bot.openEntity(entity, Class)

Открыть GUI существа, например жителя

 * `entity` существо, GUI которого нужно открыть
 * `Class` тип окна, которое нужно открыть

#### bot.moveSlotItem(sourceSlot, destSlot, cb)

Поместить предмет со слота `sourceSlot` в слот  `destSlot` в открытом окне

#### bot.updateHeldItem()

Обновить `bot.heldItem`.

### bot.creative

Данные функции использются в творческом режиме

#### bot.creative.setInventorySlot(slot, item, [callback])

Дает боту указанный предмет в слоте инвентаря. Не рекомендуется 
выдавать дважды в один слот

 * `slot` номер слота ( 0 -36 )
 * `item` предмет, NBT-тег
     Если `item` равен` null`, элемент в указанном слоте удаляется.
 * `callback(err)` (необязательно) вызывается, если сервер одобрил выдачу предмета

Если этот метод меняет ваш инвентарь, вы можете использовать `bot.inventory.on("updateSlot")`.

#### bot.creative.flyTo(destination, [cb])

Вызывает `startFlying()` и движется к месту назначения.
`destination` это `Vec3`, координаты `x` и `z`, которые обычно заканчиваются на `.5`.
Функция не будет рабоать, если присутствуют препятствия.
Рекомендуется отправлять на небольшие расстояния


Когда бот прибывает в пункт назначения, вызывается `cb`.

Этот метод не пытается найти путь до точки.
Ожидается, что реализация поиска пути будет использовать этот метод для перемещения на <2 блоков одновременно.

Чтобы остановить полет, используйте `stopFlying()`.

#### bot.creative.startFlying()

Установите `bot.physics.gravity` к `0`.
Чтобы остановить полет, используйте  `stopFlying()`.

Этот метод полезен, если вы хотите летать, копая землю под собой.
Нет необходимости вызывать эту функцию перед вызовом `flyTo()`.

Обратите внимание, что во время полета `bot.entity.velocity` может быть не точным.

#### bot.creative.stopFlying()

Восстанавливает `bot.physics.gravity` к оригинальному значению.
