<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Tabela de conteúdos** *gerada com [DocToc](https://github.com/thlorenz/doctoc)*

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

Esses enums estão armazenados em um projeto independente da linguagem [minecraft-data](https://github.com/PrismarineJS/minecraft-data) e acessados pelo [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data).

### minecraft-data
Os dados estão disponíveis no módulo [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)

`require('minecraft-data')(bot.version)` te dá acesso a eles.

### mcdata.blocks
Blocos ordenados por ID.

### mcdata.items
Itens ordenados por ID.

### mcdata.materials
A chave é o material. O valor é um objeto com a chave sendo o ID da ferramenta e o valor é o multiplicador de eficiência.

### mcdata.recipes
Receitas ordenadas por ID.

### mcdata.instruments
Ferramentas ordenadas por ID.

### mcdata.biomes
Biomas ordenados por ID.

### mcdata.entities
Entidades ordenadas por ID.

## Clases

### vec3

Veja [andrewrk/node-vec3](https://github.com/andrewrk/node-vec3)

Todos os pontos no mineflayer são instâncias dessa classe.

- x - sul
- y - para cima
- z - oeste

Funções e métodos que requerem um ponto aceitam instâncias `Vec3`, uma matriz com 3 valores e um objeto com as propriedades `x`, `y` e `z`.

### mineflayer.Location

### Entity

Entidades representam jogadores, mobs e objetos. Elas são emitidas em muitos eventos, mas você pode acessar sua própria entidade com `bot.entity`.
Veja [prismarine-entity](https://github.com/PrismarineJS/prismarine-entity)

### Block

Veja [prismarine-block](https://github.com/PrismarineJS/prismarine-block)

Além disso, `block.blockEntity` é um campo adicional com os dados da entidade do bloco em formato de `Object`.
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

Veja [prismarine-biome](https://github.com/PrismarineJS/prismarine-biome)

### Item

Veja [prismarine-item](https://github.com/PrismarineJS/prismarine-item)

### windows.Window (base class)

Veja [prismarine-windows](https://github.com/PrismarineJS/prismarine-windows)

#### window.deposit(itemType, metadata, count, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento ao ser concluída.

- `itemType` - ID numérico do item.
- `metadata` - valor numérico. `null` significa que qualquer valor coincide.
- `count` - quantos itens devem ser depositados. `null` é um alias para 1.
- `callback(err)` - (opcional) - executado ao ser concluída.

#### window.withdraw(itemType, metadata, count, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento ao ser concluída.

 * `itemType` - ID numérico do item
 * `metadata` - valor numérico. `null` significa que qualquer valor é correspondente.
 * `count` - quantos itens devem ser retirados. `null` é um alias para 1.
 * `callback(err)` - (opcional) - executado ao finalizar

#### window.close()

Fecha a interface/janela.

### Recipe

Veja [prismarine-recipe](https://github.com/PrismarineJS/prismarine-recipe).

### mineflayer.Container

Estende windows.Window para baús, dispensadores, etc...
Veja `bot.openContainer(blocoDoBaú ou entidadeDeCarrinhoDeMinério)`.

### mineflayer.Furnace

Estende windows.Window para fornalhas, fundidores, etc...
Veja `bot.openFurnace(blocoDaFornalha)`.

#### Furnace "update"

É emitido quando `fornalha.combustível` e/ou `fornalha.progresso` são atualizados.

#### furnace.takeInput([callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `callback(err, item)`

#### furnace.takeFuel([callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `callback(err, item)`

#### furnace.takeOutput([callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `callback(err, item)`

#### furnace.putInput(itemType, metadata, count, [cb])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

#### furnace.putFuel(itemType, metadata, count, [cb])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

#### furnace.inputItem()

Retorna uma instância `Item` que é o item de entrada.

#### furnace.fuelItem()

Retorna uma instância `Item` que é o combustível.

#### furnace.outputItem()

Retorna uma instância `Item` que é o item de saída.

#### furnace.fuel

Quanto combustível resta, variando de 0 a 1.

#### furnace.progress

Quanto o item está avançado no processo, variando de 0 a 1.

### mineflayer.EnchantmentTable

Estende windows.Window para mesas de encantamento.
Veja `bot.openEnchantmentTable(blocoDaMesaDeEncantamento)`.

#### enchantmentTable "ready"

É emitido quando `mesaDeEncantamento.encantamentos` está completo e você pode escolher um encantamento executando `mesaDeEncantamento.encantar(escolha)`.

#### enchantmentTable.targetItem()

Retorna os itens de entrada e saída.

#### enchantmentTable.xpseed

A semente de XP de 16 bits enviada pelo servidor.

#### enchantmentTable.enchantments

Array de comprimento 3 com três encantamentos que você pode escolher.
`level` pode ser -1 se o servidor ainda não enviou os dados.

Parece com:

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

Esta função também retorna uma `Promise`, com o `item` como argumento quando concluída.

* `escolha` - [0-2], o índice do encantamento que você deseja escolher.
* `callback(err, item)` - (opcional) executado ao finalizar.

#### enchantmentTable.takeTargetItem([callback])

Esta função também retorna uma `Promise`, com o `item` como argumento quando concluída.

* `callback(err, item)`

#### enchantmentTable.putTargetItem(item, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

* `callback(err)`

#### enchantmentTable.putLapis(item, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

* `callback(err)`

### mineflayer.anvil

Estende a janela de janelas para bigornas.
Veja `bot.openAnvil(anvilBlock)`.

#### anvil.combine(itemUm, itemDois[, nome, callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

* `callback(err)` - para usar o retorno de chamada, o nome deve estar vazio ('').

#### anvil.combine(item[, nome, callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

* `callback(err)`

#### villager "ready"

É emitido quando `vilarejo.trocas` foram carregadas.

#### villager.trades

Array de negociações

Semelhante a:

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
É o mesmo que [bot.trade(villagerInstance, tradeIndex, [times], [cb])](#bottradevillagerinstance-tradeindex-times-cb)

### mineflayer.ScoreBoard

#### ScoreBoard.name

Nome do placar.

#### ScoreBoard.title

O título do placar (nem sempre é o mesmo que o nome).

#### ScoreBoard.itemsMap

Um objeto com todos os itens do placar nele.
```js
{
  wvffle: { name: 'wvffle', value: 3 },
  dzikoysk: { name: 'dzikoysk', value: 6 }
}
```

#### ScoreBoard.items

Uma matriz com todos os itens no placar.
```js
[
  { name: 'dzikoysk', value: 6 },
  { name: 'wvffle', value: 3 }
]
```

### mineflayer.BossBar

#### BossBar.title

Título da barra de vida do chefe, instância de ChatMessage

#### BossBar.health

Porcentagem da vida do chefe, de `0` a `1`

#### BossBar.dividers

Número de divisores na barra, pode ser `0`, `6`, `10`, `12` ou `20`

#### BossBar.entityUUID

UUID da entidade do chefe

#### BossBar.shouldDarkenSky

Determina se o céu deve escurecer ou não

#### BossBar.isDragonBar

Determina se a barra é a barra de vida do dragão

#### BossBar.createFog

Determina se a barra cria neblina ou não

#### BossBar.color

Determina el color de la barra entre `pink`, `blue`, `red`, `green`, `yellow`, `purple` y `white` (`rosa`, `azul`, `rojo`, `verde`, `amarillo`, `morado` y `blanco`)

## Bot

### mineflayer.createBot(options)

Crie e retorne uma instância da classe Bot.

`options` é um objeto que contém propriedades opcionais:
 * username : (usuário) o valor padrão é 'Player'
 * port : (porta) o valor padrão é 25565
 * password : (senha) pode ser omitida (se os tokens também forem omitidos, tentará conectar no modo offline)
 * host : (ip) o valor padrão é localhost
 * version : se omitido, tentará determinar automaticamente a versão. Por exemplo: "1.12.2"
 * auth : (autenticação) o valor padrão é 'mojang', também pode ser 'microsoft'
 * clientToken : gerado se uma senha for fornecida
 * accessToken : gerado se uma senha for fornecida
 * logErrors : o valor padrão é true, retém erros e os imprime
 * hideErrors : o valor padrão é true, para ocultar erros (mesmo se logErrors for true)
 * keepAlive : envia pacotes keepAlive: o valor padrão é true
 * checkTimeoutInterval : o valor padrão é `30*1000` (30s), verifica se o pacote keepAlive foi recebido neste período, desconecta o bot se não for recebido.
 * loadInternalPlugins : o valor padrão é true
 * storageBuilder : uma função opcional, que recebe a versão e o nome do mundo (worldName) como argumentos e retorna uma instância de algo com a mesma API que prismarine-provider-anvil. Será usado para salvar o mundo.
 * client : uma instância de node-minecraft-protocol, se não for especificado, o mineflayer criará seu próprio cliente. Isso é útil para usar o mineflayer por meio de um proxy de vários clientes ou para um cliente vanilla e um cliente mineflayer.
 * plugins : objeto: o valor padrão é {}
   - pluginName : false : não carrega o plugin interno com esse nome, por exemplo, `pluginName`
   - pluginName : true : carrega o plugin interno com esse nome, por exemplo, `pluginName`, mesmo se loadInternalPlugins estiver definido como false
   - pluginName : função para introduzir : carrega um plugin de terceiros (externo), anulando o plugin interno com o mesmo nome, por exemplo, `pluginName`
 * physicsEnabled : o valor padrão é true, se o bot deve ser afetado pela física, pode ser modificado através de bot.physicsEnabled
 * [chat](#bot.settings.chat)
 * [colorsEnabled](#bot.settings.colorsEnabled)
 * [viewDistance](#bot.settings.viewDistance)
 * [difficulty](#bot.settings.difficulty)
 * [skinParts](#bot.settings.skinParts)
 * chatLengthLimit : o valor máximo de caracteres que podem ser enviados com uma única mensagem. Se não for especificado, será 100 em versões anteriores à 1.11 e 256 na 1.11 e posteriores.

### Properties

#### bot.world

Uma representação sincronizada do mundo. Confira a documentação em http://github.com/PrismarineJS/prismarine-world

#### world "blockUpdate" (oldBlock, newBlock)

É emitido quando um bloco é atualizado. Retorna o bloco antigo `oldBlock` e o novo bloco `newBlock`.

Observação: `oldBlock` pode ser `null`.

#### world "blockUpdate:(x, y, z)" (oldBlock, newBlock)

É emitido quando um bloco em uma coordenada é atualizado. Retorna o bloco antigo `oldBlock` e o novo bloco `newBlock`.

Observação: `oldBlock` pode ser `null`.


#### bot.entity

Sua própria entidade. Consulte `Entity`.

#### bot.entities

Todas as entidades próximas. Este objeto é um mapa de entityId (id da entidade) para entity (entidade).

#### bot.username

Use isso para descobrir seu próprio nome.

#### bot.spawnPoint

Coordenadas do ponto de spawn, para onde todas as bússolas apontam.

#### bot.heldItem

O item na mão do bot, apresentado como uma instância [prismarine-item](https://github.com/PrismarineJS/prismarine-item) especificado com seus metadados, dados NBT, etc.

#### bot.game.levelType

Tipo do nível do jogo.

#### bot.game.dimension

Tipo da dimensão.

#### bot.game.difficulty

Tipo de dificuldade do jogo.

#### bot.game.gameMode

Modo de jogo do bot.

#### bot.game.hardcore

Se o jogo está no modo hardcore ou não.

#### bot.game.maxPlayers

O número máximo de jogadores no jogo.

#### bot.game.serverBrand

A marca do servidor.

#### bot.physicsEnabled

Se a física deve ser habilitada, o valor padrão é true.

#### bot.player

Objeto do jogador do bot
```js
{
  username: 'player',
  displayName: { toString: Function }, // Objeto ChatMessage.
  gamemode: 0,
  ping: 28,
  entity: entity // nulo se você estiver muito longe (fora da zona renderizada)
}
```

#### bot.players

Mapa dos nomes dos jogadores no jogo.

#### bot.isRaining

Determina se está chovendo.

#### bot.rainState

Um número indicando o nível de chuva atual. Se não estiver chovendo, este valor será 0. Quando começa a chover, o valor aumenta gradualmente para 1. E quando para de chover, diminui gradualmente para 0.

Cada vez que `bot.rainState` muda, o evento "weatherUpdate" é emitido.

#### bot.thunderState

Um número indicando o nível de tempestade de raios atual. Se não houver tempestade, este valor será 0. Quando começa uma tempestade, o valor aumenta gradualmente para 1. E quando a tempestade para, diminui gradualmente para 0.

Cada vez que `bot.thunderState` muda, o evento "weatherUpdate" é emitido.

Isso é semelhante ao `bot.rainState`, mas para tempestades de raios. Para tempestades de raios, `bot.rainState` e `bot.thunderState` mudarão.

#### bot.chatPatterns

Isso é uma matriz de objetos de padrões, no seguinte formato:
{ /regex/, "chattype", "descrição")
 * /regex/ - um padrão regex, deve ter pelo menos dois grupos de captura.
 * 'chattype' - o tipo de chat que deve corresponder, pode ser "chat" (conversa) ou "whisper" (sussurro), ou qualquer outro.
 * 'descrição' - descrição do padrão, opcional.

#### bot.settings.chat

Opções:

 * `enabled` (ativado) (padrão)
 * `commandsOnly` (apenasComandos)
 * `disabled` (desativado)

#### bot.settings.colorsEnabled

Seu valor padrão é verdadeiro, se deve receber códigos de cor do servidor.

#### bot.settings.viewDistance

Opções:
 * `far` (distante) (padrão)
 * `normal`
 * `short` (curto)
 * `tiny` (minúsculo)

#### bot.settings.difficulty

O mesmo que em server.properties.

#### bot.settings.skinParts

Esses booleanos controlam se as partes externas da skin do jogador devem ser visíveis.

##### bot.settings.skinParts.showCape

Se você tem uma capa, pode desativá-la alterando isso para falso.

##### bot.settings.skinParts.showJacket

Se a parte externa do peito deve ser mostrada.

##### bot.settings.skinParts.showLeftSleeve

Se a parte externa do braço esquerdo deve ser mostrada.

##### bot.settings.skinParts.showRightSleeve

Se a parte externa do braço direito deve ser mostrada.

##### bot.settings.skinParts.showLeftPants

Se a parte externa da perna esquerda deve ser mostrada.

##### bot.settings.skinParts.showRightPants

Se a parte externa da perna direita deve ser mostrada.

##### bot.settings.skinParts.showHat

Se a parte externa da cabeça deve ser mostrada.

#### bot.experience.level

O nível de experiência do bot.

#### bot.experience.points

Total de pontos de experiência do bot.

#### bot.experience.progress

Entre 0 e 1 - a quantidade que falta para atingir o próximo nível.

#### bot.health

Números entre 0 e 20 representando o número de metades de coração.

#### bot.food

Números de 0 a 20 representando o número de metades de coxas de frango.

#### bot.foodSaturation

A saturação atua como um "suprimento" de comida. Se a saturação for maior que 0, o nível de comida não diminuirá. Os jogadores que entram no jogo têm automaticamente uma saturação de 5,0. Comer aumenta a saturação e o nível de comida.

#### bot.oxygenLevel

Número de 0 a 20 representando o número de metades de bolhas do nível de oxigênio.

#### bot.physics

Modifique esses números para alterar a gravidade, velocidade de salto, velocidade terminal, etc. Faça isso por sua própria conta e risco.

#### bot.simpleClick.leftMouse (slot)

Abstração de `bot.clickWindow(slot, 0, 0)`

#### bot.simpleClick.rightMouse (slot)

Abstração de `bot.clickWindow(slot, 1, 0)`

#### bot.time.doDaylightCycle

Se o gamerule doDaylightCycle está ativado ou desativado.

#### bot.time.bigTime

O número total de ticks desde o dia 0.

Este valor é do tipo BigInt e é muito preciso, mesmo com valores muito grandes (mais de 2^51 - 1 ticks).

#### bot.time.time

O número total de ticks desde o dia 0.

Como o limite de números em JavaScript é 2^51 - 1, bot.time.time é menos preciso em valores mais altos que esse limite. Portanto, é recomendado o uso de bot.time.bigTime. Sendo realista, provavelmente você nunca terá que usar bot.time.bigTime, já que ele naturalmente alcançará 2^51 - 1 ticks após cerca de 14.280.821 anos reais.

#### bot.time.timeOfDay

Hora do dia, em ticks.

A hora é baseada em ticks, onde 20 ticks ocorrem a cada segundo. Há 24.000 ticks em um dia, o que torna os dias em Minecraft exatamente 20 minutos. A hora do dia é baseada no módulo 24.000 do timestamp. 0 é o amanhecer, 6.000 é o meio-dia, 12.000 é o anoitecer e 18.000 é a meia-noite.

#### bot.time.day

Dia do mundo.

#### bot.time.isDay

Se é dia ou não.

Baseado no horário atual estar entre 13.000 e 23.000 ticks.

#### bot.time.moonPhase

Fase da lua.

De 0 a 7, onde 0 é lua cheia.

#### bot.time.bigAge

Idade do mundo, em ticks.

Este valor é do tipo BigInt e é preciso mesmo em valores muito altos (mais de 2^51 - 1 ticks).

#### bot.time.age

Idade do mundo, em ticks.

Como o limite de números em JavaScript é 2^51 - 1, bot.time.age é menos preciso em valores mais altos que esse limite. Portanto, é recomendado o uso de bot.time.bigAge. Sendo realista, provavelmente você nunca terá que usar bot.time.bigAge, já que ele naturalmente alcançará 2^51 - 1 ticks após cerca de 14.280.821 anos reais.

#### bot.quickBarSlot

Qual slot está selecionado na barra de acesso rápido (0 - 8).

#### bot.inventory

Uma instância de janela (interface) representando seu inventário.

#### bot.targetDigBlock

O bloco que você está quebrando no momento, ou `null`.

#### bot.isSleeping

Booleano representando se você está dormindo ou não.

#### bot.scoreboards

Todos os placares que o bot conhece em um objeto com o formato nome do placar -> placar.

#### bot.scoreboard

Todos os placares que o bot conhece em um objeto com o formato exibição de placar -> placar.
- `belowName` - placar exibido abaixo do nome
- `sidebar` - placar exibido na barra lateral
- `list` - placar exibido na lista
- `0-18` - entradas definidas no protocolo

#### bot.controlState

Um objeto que contém os estados de controle principais: ['frente', 'trás', 'esquerda', 'direita', 'pular', 'correr', 'agachar'].

Esses valores podem ser usados em bot.setControlState.

### Events

#### "chat" (username, message, translate, jsonMsg, matches)

Somente é emitido quando um jogador conversa publicamente.
- `username` - o jogador que enviou a mensagem (compare com `bot.username` para ignorar suas próprias mensagens).
- `message` - mensagem sem códigos de cores.
- `translate` - tipo de mensagem no chat. Nulo para a maioria das mensagens do Bukkit.
- `jsonMsg` - mensagem JSON não modificada do servidor.
- `matches` - matriz de correspondências retornadas pelas expressões regulares. Pode ser nulo.

#### "whisper" (username, message, translate, jsonMsg, matches)

Somente é emitido quando um jogador conversa com você em particular (sussurro).
- `username` - o jogador que enviou a mensagem.
- `message` - mensagem sem códigos de cores.
- `translate` - tipo de mensagem no chat. Nulo para a maioria das mensagens do Bukkit.
- `jsonMsg` - mensagem JSON não modificada do servidor.
- `matches` - matriz de correspondências retornadas pelas expressões regulares. Pode ser nulo.

#### "actionBar" (jsonMsg)

Este evento é emitido para cada mensagem do servidor que aparece na barra de ação.

 * `jsonMsg` - mensagem JSON não modificada do servidor

#### "message" (jsonMsg, position)

Este evento é emitido para cada mensagem do servidor, incluindo chats.

 * `jsonMsg` - mensagem JSON não modificada do servidor

 * `position` - (>= 1.8.1): a posição da mensagem de chat pode ser
   * chat
   * sistema
   * informações_do_jogo

#### "messagestr" (message, messagePosition, jsonMsg)

Similar a "message", mas converte a mensagem JSON em uma string antes de ser emitida.

#### "inject_allowed"

Este evento é emitido quando o arquivo index é carregado. Você pode carregar mcData ou os plugins aqui, mas é melhor esperar pelo evento "spawn".

#### "login"

É emitido após se registrar no servidor. No entanto, provavelmente você desejará aguardar o evento "spawn" antes de fazer qualquer coisa.

#### "spawn"

É emitido quando você se registra e aparece no mundo ou quando ressurge após a morte. Normalmente, este é o evento que você deseja receber antes de fazer qualquer coisa no servidor.

#### "respawn"

É emitido ao mudar de dimensões ou imediatamente antes de aparecer. Normalmente, você vai querer ignorar esse evento e esperar até que o evento "spawn" seja emitido.

#### "game"

É emitido quando o servidor altera algumas de suas propriedades.

#### "resourcePack" (url, hash)

É emitido quando o servidor envia um pacote de recursos.

#### "title"

É emitido quando o servidor exibe um título.

 * `text` - texto do título

#### "rain"

É emitido quando começa a chover ou quando para de chover. Se estiver chovendo quando você entrar no servidor, este evento será emitido.

#### "weatherUpdate"

É emitido quando o estado de chuva (`bot.thunderState` ou `bot.rainState`) muda. Se estiver chovendo quando você entrar no servidor, este evento será emitido.

#### "time"

É emitido quando o servidor altera ou atualiza a hora. Veja `bot.time`.

#### "kicked" (reason, loggedIn)

É emitido quando o bot é expulso do servidor. `motivo` é uma mensagem de chat com o motivo da expulsão. `loggedIn` será `true` se o cliente já estava conectado quando foi expulso e `false` se o cliente foi expulso durante o processo de registro.

#### "end"

É emitido quando você não está mais conectado ao servidor.

#### "error" (err)

É emitido quando ocorre um erro.

#### "spawnReset"

É emitido quando você não pode mais ressurgir em sua cama e seu ponto de ressurgimento é redefinido.

#### "death"

É emitido ao morrer.

#### "health"

É emitido quando sua vida ou nível de comida mudam.

#### "breath"

É emitido quando seu nível de oxigênio muda.

#### "entitySwingArm" (entity)

É emitido quando uma entidade move o braço.

#### "entityHurt" (entity)

É emitido quando uma entidade se machuca.

#### "entityDead" (entity)

É emitido quando uma entidade morre.

#### "entityTaming" (entity)

É emitido quando uma entidade está sendo domesticada.

#### "entityTamed" (entity)

É emitido quando uma entidade é domesticada.

#### "entityShakingOffWater" (entity)

É emitido quando uma entidade se sacode para se secar (por exemplo, lobos).

#### "entityEatingGrass" (entity)

É emitido quando uma entidade come grama.

#### "entityWake" (entity)

É emitido quando uma entidade acorda.

#### "entityEat" (entity)

É emitido quando uma entidade come.

#### "entityCriticalEffect" (entity)

É emitido quando uma entidade recebe um ataque crítico.

#### "entityMagicCriticalEffect" (entity)

É emitido quando uma entidade recebe um ataque crítico com poções.

#### "entityCrouch" (entity)

É emitido quando uma entidade se agacha.

#### "entityUncrouch" (entity)

É emitido quando uma entidade para de se agachar.

#### "entityEquip" (entity)

É emitido quando uma entidade equipa algo.

#### "entitySleep" (entity)

É emitido quando uma entidade dorme.

#### "entitySpawn" (entity)

É emitido quando uma entidade aparece.

#### "itemDrop" (entity)

É emitido quando uma entidade solta itens (os itens também são entidades).

#### "playerCollect" (collector, collected)

É emitido quando uma entidade coleta um item.

 * `coletor` - a entidade que coletou o item.
 * `coletado` - a entidade que foi coletada (o item).

#### "entityGone" (entity)

É emitido quando uma entidade desaparece (morre, despawna).

#### "entityMoved" (entity)

É emitido quando uma entidade se move.

#### "entityDetach" (entity, vehicle)

É emitido quando uma entidade sai de um veículo.

#### "entityAttach" (entity, vehicle)

É emitido quando uma entidade entra em um veículo.

 * `entidade` - a entidade que entrou
 * `veículo` - a entidade do veículo (carrinho, cavalo)

#### "entityUpdate" (entity)

É emitido quando uma entidade atualiza uma de suas propriedades.

#### "entityEffect" (entity, effect)

É emitido quando uma entidade recebe um efeito.

#### "entityEffectEnd" (entity, effect)

É emitido quando um efeito em uma entidade termina.

#### "playerJoined" (player)

É emitido quando um jogador entra no servidor.

#### "playerUpdated" (player)

É emitido quando um jogador atualiza uma de suas propriedades.

#### "playerLeft" (player)

É emitido quando um jogador se desconecta do servidor.

#### "blockUpdate" (oldBlock, newBlock)

(É melhor usar este evento a partir de bot.world em vez de bot diretamente) É emitido quando um bloco é atualizado. Retorna `blocoAntigo` e `blocoNovo`.

Observação: `blocoAntigo` pode ser `null`.

#### "blockUpdate:(x, y, z)" (oldBlock, newBlock)

(É melhor usar este evento a partir de bot.world em vez de bot diretamente) É emitido quando um bloco em uma coordenada específica é atualizado. Retorna `blocoAntigo` e `blocoNovo`.

Observação: `blocoAntigo` pode ser `null`.

#### "blockPlaced" (oldBlock, newBlock)

É emitido quando o bot coloca um bloco. Retorna `blocoAntigo` e `blocoNovo`.

Observação: `blocoAntigo` pode ser `null`.

#### "chunkColumnLoad" (point)

É emitido quando um chunk é carregado.

#### "chunkColumnUnload" (point)

É emitido quando um chunk é descarregado. `ponto` é a coordenada do canto do chunk com os valores x, y e z mais baixos.

#### "soundEffectHeard" (soundName, position, volume, pitch)

Isso ocorre quando o cliente ouve um efeito sonoro com um nome específico.

 * `nomeSom`: nome do efeito sonoro
 * `posição`: uma instância Vec3 indicando o ponto de onde o som originou
 * `volume`: volume em ponto flutuante, 1.0 é 100%
 * `altura`: pitch em números inteiros, 63 é 100%

#### "hardcodedSoundEffectHeard" (soundId, soundCategory, position, volume, pitch)

Isso ocorre quando o cliente ouve um efeito sonoro codificado.

   * `idSom`: ID do efeito sonoro
   * `categoriaSom`: categoria do efeito sonoro
   * `posição`: uma instância Vec3 indicando o ponto de onde o som originou
   * `volume`: volume em ponto flutuante, 1.0 é 100%
   * `altura`: pitch em números inteiros, 63 é 100%

#### "noteHeard" (block, instrument, pitch)

Isso ocorre quando um bloco de notas é disparado em algum lugar.

 * `bloco`: uma instância de Bloco, o bloco que emitiu o som
 * `instrumento`:
   - `id`: identificação numérica
   - `nome`: um dos seguintes [`harpa`, `contrabaixo`, `caixa de bateria`, `baquetas`, `bateria grave`]
 * `tom`: O tom da nota (entre 0 e 24, inclusivos, onde 0 é o mais baixo e 24 é o mais alto). Você pode ler mais (sobre como os valores de tom correspondem às notas na vida real) aqui: [Página oficial da Minecraft Wiki](http://minecraft.wiki/w/Note_Block).

#### "pistonMove" (block, isPulling, direction)

Isso ocorre quando um pistão se move.

#### "chestLidMove" (block, isOpen, block2)

Isso ocorre quando a tampa de um baú se move.

* `bloco`: uma instância de Bloco, o bloco da tampa que se moveu. O bloco à direita se for um baú duplo.
* `estáAberto`: número de jogadores que têm o baú aberto.
* `bloco2`: uma instância de Bloco, a outra metade do bloco onde a tampa se moveu. Nulo se não for um baú duplo.

#### "blockBreakProgressObserved" (block, destroyStage)

Isso ocorre quando o cliente observa um bloco enquanto ele está sendo quebrado.

 * `bloco`: uma instância de Bloco, o que está sendo quebrado.
 * `estágioDestruicao`: número inteiro correspondente ao progresso (0-9).

#### "blockBreakProgressEnd" (block)

Isso ocorre quando o cliente observa um bloco que termina de ser quebrado.
Isso ocorre quando o processo foi concluído ou cancelado.

 * `bloco`: uma instância de Bloco, o bloco que não está mais sendo quebrado.

#### "diggingCompleted" (block)

Isso ocorre quando a quebra de um bloco foi concluída.
 * `bloco` - o bloco que já não existe.

#### "diggingAborted" (block)

Isso ocorre quando o processo de quebra de um bloco foi abortado.
 * `bloco` - o bloco que ainda existe.

#### "move"

Se emite cuando o bot se move. Se deseja a posição atual, você pode usar `bot.entity.position` e se quiser descobrir a posição anterior, use `bot.entity.positon.minus(bot.entity.velocity)`.

#### "forcedMove"

Se emite quando o bot é movido forçadamente pelo servidor (teletransporte, spawn, ...). Se deseja a posição atual, use `bot.entity.position`.

#### "mount"

Se emite quando o bot sobe em uma entidade, como um minecart. Para acessar a entidade, use `bot.vehicle`.

Para subir em uma entidade, use `mount`.

#### "dismount" (vehicle)

Se emite quando você desce de uma entidade.

#### "windowOpen" (window)

Se emite quando você começa a usar uma mesa de criação, baú, mesa de poções, etc.

#### "windowClose" (window)

Se emite quando você não está mais usando uma mesa de criação, baú, etc.

#### "sleep"

Se emite quando você dorme.

#### "wake"

Se emite quando você acorda.

#### "experience"

Se emite quando `bot.experience.*` muda.

#### "scoreboardCreated" (scoreboard)

Se emite quando um placar é criado.

#### "scoreboardDeleted" (scoreboard)

Se emite quando um placar é excluído.

#### "scoreboardTitleChanged" (scoreboard)

Se emite quando o título de um placar é atualizado.

#### "scoreUpdated" (scoreboard, item)

Se emite quando a pontuação de um item no placar é atualizada.

#### "scoreRemoved" (scoreboard, item)

Se emite quando a pontuação de um item no placar é removida.

#### "scoreboardPosition" (position, scoreboard)

Se emite quando a posição de um placar é atualizada.

#### "bossBarCreated" (bossBar)

Se emite quando uma barra de vida de chefe é criada.

#### "bossBarDeleted" (bossBar)

Se emite quando uma barra é excluída.

#### "bossBarUpdated" (bossBar)

Se emite quando uma barra é atualizada.

#### "heldItemChanged" (heldItem)

Se emite quando o item que você está segurando muda.

#### "physicsTick" ()

Se emite a cada tick se bot.physicsEnabled estiver em true.

#### "chat:name" (matches)

Se emite quando todos os padrões de chat têm correspondências.

### Functions

#### bot.blockAt(point, extraInfos=true)

Retorna o bloco no `point` (um Vec3) ou `null` se esse ponto não estiver carregado. Se `extraInfos` estiver definido como true, também retorna informações sobre placas, quadros e entidades de blocos (mais lento). Veja `Block`.

#### bot.waitForChunksToLoad(cb)

Essa função também retorna uma `Promise`, com `void` como argumento quando a carga dos chunks estiver completa.

O `cb` é executado quando bastantes chunks são carregados.

#### bot.blockInSight(maxSteps, vectorLength)

Obsoleto, usar `blockAtCursor` no lugar.

Retorna o bloco que está no cursor do bot ou `null`.
 * `maxSteps` - Número de passos do traçado de raios, o valor padrão é 256.
 * `vectorLength` - Comprimento do vetor do traçado de raios, o valor padrão é `5/16`.

#### bot.blockAtCursor(maxDistance=256)

Retorna o bloco que está no cursor do bot ou `null`.
 * `maxDistance` - Distância máxima à qual o bloco pode estar do olho, o valor padrão é 256.

#### bot.canSeeBlock(block)

Retorna verdadeiro ou falso dependendo se o bot pode ver o `block` (bloco).

#### bot.findBlocks(options)

Encontra os blocos mais próximos do ponto especificado.
 * `options` - Opções de pesquisa:
   - `point` - A posição a partir da qual começar a pesquisa (centro). Padrão: a posição do bot.
   - `matching` - Uma função que retorna verdadeiro se o bloco atender às condições. Também pode ser um ID de bloco ou uma matriz de IDs.
   - `useExtraInfo` - Pode ser de dois tipos para manter a compatibilidade inversa.
      - **boolean** - Você fornece sua função `matching` com mais informações - mais lento.
      - **function** - É feito em duas etapas, se o bloco atender às condições da função `matching`, ele passa para `useExtraInfo` com informações adicionais.
   - `maxDistance` - A distância máxima de pesquisa, padrão: 16.
   - `count` - Número de blocos a serem encontrados antes de retornar os resultados. Padrão: 1. Pode retornar menos se não houver blocos suficientes.

Retorna um array (pode estar vazio) com as coordenadas dos blocos encontrados (não retorna instâncias de blocos). O array é ordenado (os mais próximos primeiro).

#### bot.findBlock(options)

Semelhante a `bot.blockAt(bot.findBlocks(options)[0])`. Retorna um único bloco ou `null`.

#### bot.canDigBlock(block)

Retorna se o `block` está dentro do alcance e se pode ser escavado.

#### bot.recipesFor(itemType, metadata, minResultCount, craftingTable)

Retorna uma lista de instâncias `Recipe` (receita) que você pode usar para criar `itemType` com `metadata`.

 * `itemType` - ID numérico do item que deseja criar.
 * `metadata` - o valor numérico da metadados do item que deseja criar, `null` significa "com qualquer valor de metadados".
 * `minResultCount` - baseia-se no seu inventário atual, qualquer receita da lista retornada poderá produzir esse número de itens. `null` significa `1`.
 * `craftingTable` - uma instância `Block` (mesa de criação). Se for `null`, apenas receitas que podem ser feitas no inventário serão incluídas na lista.

#### bot.recipesAll(itemType, metadata, craftingTable)

Semelhante a bot.recipesFor, mas não verifica se o bot tem materiais suficientes para a receita.

#### bot.nearestEntity(match = (entity) => { return true })

Retorna a entidade mais próxima do bot, correspondendo à função (padrão: todas as entidades).
Retorna null se nenhuma entidade for encontrada.

### Methods

#### bot.end()

Encerra a conexão com o servidor.

#### bot.quit(reason)

Para se desconectar do servidor de forma elegante com um motivo (padrão: 'disconnect.quitting').

#### bot.tabComplete(str, cb, [assumeCommand], [sendBlockInSight])

Essa função também retorna uma `Promise`, com `matches` como argumento quando a conclusão é feita.

Solicita a conclusão da mensagem de chat (para comandos).
 * `str` - String para completar.
 * `callback(matches)`
   - `matches` - Array de strings correspondentes.
 * `assumeCommand` - Campo enviado ao servidor, padrão: false.
 * `sendBlockInSight` - Campo enviado ao servidor, padrão: true. Mude para false se desejar maior eficiência.

#### bot.chat(message)

Envia uma mensagem pública no chat. Divide mensagens grandes em pedaços e as envia como várias mensagens, se necessário.

#### bot.whisper(username, message)

Atalho para "/tell <username>" (usuário). Todas as partes serão sussurradas ao usuário.

#### bot.chatAddPattern(pattern, chatType, description)

#### bot.addChatPattern(name, pattern, chatPatternOptions)

Adicione um padrão regex à lista de padrões do bot. Útil para servidores Bukkit onde o formato do chat muda com frequência.
 * `pattern` - padrão regex para corresponder
 * `chatType` - o evento que o bot emite quando o padrão corresponde, por exemplo, "chat" ou "whisper"
 * 'description' - Opcional, descrição do padrão

#### bot.addChatPattern(name, pattern, chatPatternOptions)

** isso é semelhante a `bot.addChatPatternSet(name, [pattern], chatPatternOptions)`

Cria um evento que é emitido sempre que um padrão corresponde, o evento será chamado "chat:name", sendo "name" o nome fornecido.
* `name` - o nome usado para o evento
* `pattern` - expressão regular a ser testada nas mensagens
* `chatPatternOptions` - objeto
  * `repeat` - padrão: true, se continuar testando após corresponder uma vez
  * `parse` - em vez de retornar a mensagem, retorne os grupos capturados pela regex
  * `deprecated` - (**unstable**) usado por bot.chatAddPattern para manter a compatibilidade, provavelmente será removido

Retorna um número que pode ser usado em bot.removeChatPattern() para remover esse padrão.

#### bot.addChatPatternSet(name, patterns, chatPatternOptions)

Cria um evento que é emitido sempre que todos os padrões correspondem, o evento será chamado "chat:name", sendo "name" o nome fornecido.
* `name` - o nome usado para o evento
* `patterns` - expressões regulares a serem testadas nas mensagens
* `chatPatternOptions` - objeto
  * `repeat` - padrão: true, se continuar testando após corresponder uma vez
  * `parse` - em vez de retornar a mensagem, retorne os grupos capturados pela regex

Retorna um número que pode ser usado em bot.removeChatPattern() para remover esse conjunto de padrões.

#### bot.removeChatPattern(name)

Remove um padrão / conjuntos de padrões
* `name`: string ou número

Se o nome for uma string, todos os padrões com esse nome serão removidos; caso contrário, se for um número, apenas o padrão exato será removido.

#### bot.awaitMessage(...args)

Promessa que é resolvida quando uma das mensagens fornecidas é cumprida.

Exemplo:

```js
async function wait () {
  await bot.awaitMessage('<flatbot> hello world') // resolve "hello world" no chat por flatbot (se resolve quando um usuário chamado flatbot escreve "hello world" no chat)
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world']) // resolve "hello" ou "world" no chat por flatbot (se resolve quando um usuário chamado flatbot escreve "hello" ou "world" no chat)
  await bot.awaitMessage(['<flatbot> hello', '<flatbot> world'], ['<flatbot> im', '<flatbot> batman']) // resolve "hello" ou "world" ou "im" ou "batman" no chat por flatbot (se resolve quando um usuário chamado flatbot escreve "hello world", "world", "im" ou "batman" no bater papo)
  await bot.awaitMessage('<flatbot> hello', '<flatbot> world') // resolve "hello" ou "world" no chat do flatbot
  await bot.awaitMessage(/<flatbot> (.+)/) // resolve na primeira mensagem correspondente ao regex (se resolve quando um usuário chamado flatbot escreve algo que coincide com o padrão)
}
```

#### bot.setSettings(options)

Veja a propriedade `bot.settings`.

#### bot.loadPlugin(plugin)

Introduz um Plugin. Não faz nada se o plugin já estiver carregado/introduzido.

 * `plugin` - função

```js
function somePlugin (bot, options) {
  function someFunction () {
    bot.chat('Yay!')
  }

  bot.myPlugin = {} // Boas práticas para API de plugin de namespace (faça isso para evitar erros como myPlugin não está definido)
  bot.myPlugin.someFunction = someFunction
}

const bot = mineflayer.createBot({})
bot.loadPlugin(somePlugin)
bot.once('login', function () {
  bot.myPlugin.someFunction() // Yay!
})
```

#### bot.loadPlugins(plugins)

Introduz plugins, veja `bot.loadPlugin`.
 * `plugins` - array de funções

#### bot.hasPlugin(plugin)

Verifica se o plugin já está carregado (ou previsto para carregar) no bot.

#### bot.sleep(bedBlock, [cb])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Dormir em uma cama. `bedBlock` deve ser uma instância `Block` que é uma cama. `cb` é uma função que pode ter um parâmetro de erro se o bot não conseguir dormir.

#### bot.isABed(bedBlock)

Retorna verdadeiro se `bedBlock` for uma cama.

#### bot.wake([cb])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Acordar de uma cama. `cb` é uma função que pode ter um parâmetro de erro se o bot não conseguir acordar.

#### bot.setControlState(control, state)

Este é o método principal para controlar os movimentos do bot. É semelhante a pressionar teclas no Minecraft.
Por exemplo, forward como true fará o bot se mover para a frente. Forward como false fará o bot parar de se mover para a frente.
Você pode usar bot.lookAt com isso para controlar o movimento. O exemplo jumper.js mostra como fazer isso.

 * `control` - Um dos seguintes: ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']
 * `state` - `true` ou `false`

#### bot.getControlState(control)

#### bot.getControlState(control)

Retorna verdadeiro se o controle estiver ativado.

* `control` - um dos seguintes ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak']

#### bot.clearControlStates()

Desativa todos os controles.

#### bot.lookAt(point, [force], [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Move a cabeça.

 * `point` - uma instância [Vec3](https://github.com/andrewrk/node-vec3) - move a cabeça para olhar para este ponto.
 * `force` - Veja `force` em `bot.look`.
 * `callback()` - opcional, executado quando você está olhando para o `point`.

#### bot.look(yaw, pitch, [force], [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Move a cabeça.

 * `yaw` - O número de radianos para girar em torno do eixo vertical, começando pelo leste, no sentido anti-horário.
 * `pitch` - O número de radianos para olhar para cima ou para baixo. 0 significa olhar em frente. PI / 2 significa para cima. -PI / 2 significa para baixo.
 * `force` - Se presente e verdadeiro, pula a transição suave. Especifique como verdadeiro se você quiser valores precisos para soltar itens ou atirar flechas. Isso não é necessário para cálculos do lado do cliente, como mover-se.
 * `callback()` - opcional, executado quando você está olhando para `yaw` e `pitch`.

#### bot.updateSign(block, text)

Altera o texto em um sinal.

#### bot.equip(item, destination, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Equipar um item do inventário.

 * `item` - instância `Item`. Veja `window.items()`.
 * `destination` - `"hand"` (mão), `null` é um alias para isso.
   - `"head"` (cabeça)
   - `"torso"` (peito)
   - `"legs"` (pernas)
   - `"feet"` (pés)
   - `"off-hand"` (mão esquerda), quando disponível.
 * `callback(error)` - opcional, executado quando o bot equipou o item ou quando falhou em fazê-lo.

#### bot.unequip(destination, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Remove um item do destino.

#### bot.tossStack(item, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Descarta a pilha de itens especificada.
 * `item` - a pilha de itens que você deseja descartar.
 * `callback(error)` - opcional, executado quando o bot terminou de descartar ou quando falhou em fazê-lo.

#### bot.toss(itemType, metadata, count, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `itemType` - ID numérico do item que você deseja descartar.
 * `metadata` - metadados do item que você deseja descartar. `null` para qualquer metadados.
 * `count` - quantos itens você deseja descartar. `null` significa `1`.
 * `callback(err)` - (opcional) executado quando o bot terminou de descartar ou quando falhou em fazê-lo.

#### bot.dig(block, [forceLook = true], [digFace], [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Começa a quebrar o `block` (bloco) com o item na mão.
Observe os eventos "diggingCompleted" e "diggingAborted".

Nota: ao começar a quebrar um bloco, você não poderá quebrar outro bloco até terminar de quebrar aquele bloco ou executar `bot.stopDigging()`.

 * `block` - o bloco que você deseja quebrar.
 * `forceLook` - (opcional) se for verdadeiro, olha rapidamente para o bloco e começa a quebrá-lo. Se for falso, olha lentamente para o bloco antes de começar a quebrá-lo. Além disso, pode ser 'ignore', para que o bot não olhe para o bloco ao quebrá-lo.
 * `digFace` - (opcional) Padrão: 'auto', olha para o centro do bloco e quebra-o a partir do topo. Também pode ser um vetor Vec3 da face do bloco para onde o bot deve olhar. Por exemplo: ```vec3(0, 1, 0)``` para quebrar a face de cima. Também pode ser 'raycast', isso verifica se alguma face é visível para começar a quebrar por essa face, o que é útil em servidores com um anti-cheat.
 * `callback(err)` - (opcional) executado quando o bot quebrou o bloco ou quando falhou em fazê-lo.

#### bot.stopDigging()

Parar de quebrar o escavar o bloco.

#### bot.digTime(block)

Retorna quanto tempo levará para quebrar o bloco, em milissegundos.

#### bot.acceptResourcePack()

Aceitar o pacote de recursos.

#### bot.denyResourcePack()

Negar o pacote de recursos.

#### bot.placeBlock(referenceBlock, faceVector, cb)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `referenceBlock` - o bloco ao lado do bloco que deseja colocar
 * `faceVector` - uma das seis direções cardeais, por exemplo, `new Vec3(0, 1, 0)` para o lado de cima, indicando a face do bloco de referência.
 * `cb` será executado quando o servidor confirmar que o bloco foi colocado.

O bloco será colocado em `referenceBlock.position.plus(faceVector)` (posição do bloco de referência mais o vetor de face).

#### bot.placeEntity(referenceBlock, faceVector)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `referenceBlock` - o bloco ao lado de onde deseja colocar a entidade.
 * `faceVector` - uma das seis direções cardeais, por exemplo, `new Vec3(0, 1, 0)` para a face de cima, indicando a face do bloco de referência.

A entidade será colocada em `referenceBlock.position.plus(faceVector)` (posição do bloco de referência mais o vetor de face).

#### bot.activateBlock(block, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Ativar um bloco, como bater em um bloco de nota ou abrir uma porta.

 * `block` - o bloco a ser ativado.
 * `callback(err)` - (opcional) executado quando o bot ativa o bloco ou falha ao fazê-lo.

#### bot.activateEntity(entity, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Ativar uma entidade, por exemplo, com aldeões.

 * `entity` - a entidade a ser ativada.
 * `callback(err)` - (opcional) executado quando o bot ativa a entidade ou falha ao fazê-lo.

#### bot.activateEntityAt(entity, position, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Ativar uma entidade na posição especificada, útil para suportes de armadura.

 * `entity` - a entidade a ser ativada.
 * `position` - a posição onde você deve clicar.
 * `callback(err)` - (opcional) executado quando o bot ativa a entidade ou falha ao fazê-lo.

#### bot.consume(callback)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Consumir ou beber o item na mão.

 * `callback(error)` - executado quando o bot consome o item ou falha ao fazê-lo.

#### bot.fish(callback)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Pescar com a vara de pescar na mão.

 * `callback(error)` - (opcional) executado quando o bot pescou algo ou falhou ao fazê-lo.

#### bot.activateItem(offHand=false)

Ativar o item na mão. Isso é usado para comer, atirar flechas, jogar ovos, etc.
O parâmetro opcional pode ser `false` para a mão esquerda.

#### bot.deactivateItem()

Desativar o item na mão. Isso é como atirar uma flecha, parar de comer, etc.

#### bot.useOn(targetEntity)

Usar o item na mão na instância de `Entity` (entidade). Isso é usado para colocar uma sela em um cavalo, ou usar tesouras em uma ovelha, por exemplo.

#### bot.attack(entity)

Atacar a entidade ou criatura.

#### bot.swingArm([hand], showHand)

Reproduz a animação de mover o braço.

 * `mão` - a mão que será animada, pode ser `esquerda` ou `direita`. Padrão: `direita`
 * `mostrarMão` - um booleano que indica se adicionar a mão ao pacote para mostrar a animação. Padrão: `verdadeiro`

#### bot.mount(entity)

Subir em uma entidade. Para descer, use `bot.dismount`.

#### bot.dismount()

Desce da entidade em que você está montado.

#### bot.moveVehicle(left,forward)

Mover o veículo:

 * esquerda pode ser -1 ou 1: -1 significa direita, 1 significa esquerda
 * frente pode ser -1 ou 1: -1 significa para trás, 1 significa para a frente

Todas as direções são relativas à direção em que o bot está olhando.

#### bot.setQuickBarSlot(slot)

 * `slot` - pode ser de 0 a 8, a posição da barra de acesso rápido

#### bot.craft(recipe, count, craftingTable, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `receita` - Uma instância de `Receita`. Veja `bot.receitasPara`.
 * `quantidade` - Quantas vezes você deseja repetir a ação.
   Se você deseja criar `8` varas com tábuas de madeira, você colocaria
   `quantidade` como `2`. `null` significa `1`.
 * `mesaDeCriação` - Uma instância de `Bloco`, a mesa de criação que você deseja usar. Se a criação não exigir uma mesa, este argumento pode ser deixado como `null`.
 * `retorno` - (opcional) Executado quando o bot terminou a criação e o inventário foi atualizado.

#### bot.writeBook(slot, pages, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

 * `slot` é um número de posição no inventário (36 é o primeiro slot, etc.).
 * `páginas` é um array de strings representando as páginas.
 * `retorno(erro)` - opcional. Executado quando o bot terminou de escrever ou ocorreu um erro.

#### bot.openContainer(containerBlock or containerEntity)

Abre um recipiente.
Retorna uma promise com uma instância de `Container` que representa o recipiente que você está abrindo.

#### bot.openChest(chestBlock or minecartchestEntity)

Obsoleto. O mesmo que `openContainer`

#### bot.openFurnace(furnaceBlock)

Abre um forno.
Retorna uma promise com uma instância de `Forno` que representa o forno que você está abrindo.

#### bot.openDispenser(dispenserBlock)

Obsoleto. O mesmo que `openContainer`

#### bot.openEnchantmentTable(enchantmentTableBlock)

Retorna uma promise com uma instância de `MesaDeEncantamento` que representa a mesa de encantamento que você está abrindo.

#### bot.openAnvil(anvilBlock)

Retorna uma promise com uma instância de `bigorna` que representa a bigorna que você está abrindo.

#### bot.openVillager(villagerEntity)

Retorna uma promise com uma instância de `Aldeão` que representa a janela de negociação que você está abrindo
O evento `pronto` na instância de `Aldeão` pode ser usado para saber quando as negociações estão prontas

#### bot.trade(villagerInstance, tradeIndex, [times], [cb])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Use a instância de `Aldeão` para fazer negociações.

#### bot.setCommandBlock(pos, command, [options])

Altera as propriedades de um bloco de comandos na posição `posição`.
Exemplo de `opções`:
```js
{
  modo: 2,
  rastrearSaída: verdadeiro,
  condicional: falso,
  sempreAtivo: verdadeiro
}
```
opções.modo pode ter 3 valores: 0 (SEQUÊNCIA), 1 (AUTO), 2 (REDSTONE)
Todas as opções têm padrão como falso, exceto modo que é 2 (para se assemelhar ao bloco de comandos do Minecraft).

#### bot.supportFeature(name)

Isso pode ser usado para verificar se uma característica está disponível na versão do bot do Minecraft. Normalmente, isso é usado para lidar com funções específicas de uma versão.

Você pode encontrar a lista de características em [./lib/features.json](https://github.com/PrismarineJS/mineflayer/blob/master/lib/features.json) arquivo.

#### bot.waitForTicks(ticks)

Esta função retorna uma promessa e espera que o número de ticks especificado passe no jogo; esta função é semelhante à função setTimeout do JavaScript, mas funciona com o relógio físico do jogo.

### Lower level inventory methods

Esses são métodos de nível mais baixo para o inventário e podem ser úteis em algumas situações, mas é melhor usar os métodos apresentados acima sempre que possível.

#### bot.clickWindow(slot, mouseButton, mode, cb)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Clique na janela/interface atual; os detalhes estão em https://wiki.vg/Protocol#Click_Window
 * slot - número que representa a posição na janela
 * mouseButton - 0 para clique esquerdo e 1 para clique direito
 * mode - mineflayer só tem o modo 0 disponível

#### bot.putSelectedItemRange(start, end, window, slot)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Mova o item na posição `slot` em um intervalo especificado.

#### bot.putAway(slot)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Mova o item para a posição `slot` no inventário.

#### bot.closeWindow(window)

Feche a janela/interface.
 * janela - a janela a ser fechada

#### bot.transfer(options, cb)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Transfira um item de um intervalo para outro. `opções` é um objeto com:

 * `janela`: a janela para onde o item será movido
 * `tipoItem`: o tipo de item a ser movido (ID numérico)
 * `metadata`: a metadados do item a ser movido
 * `inícioOrigem` e `fimOrigem`: o intervalo de origem
 * `inícioDestino` e `fimDestino`: o intervalo de destino

#### bot.openBlock(block)

Abra um bloco, como um baú; retorna uma promessa com `Janela` sendo a janela aberta.

 * `bloco` é o bloco a ser aberto

#### bot.openEntity(entity)

Abra uma entidade com um inventário, como um aldeão; retorna uma promessa com `Janela` sendo a janela aberta.

 * `entidade` é a entidade a ser aberta

#### bot.moveSlotItem(sourceSlot, destSlot, cb)

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Mova um item de uma posição `origemSlot` para outra `destinoSlot` em uma janela.

#### bot.updateHeldItem()

Atualize `bot.heldItem`.

#### bot.getEquipmentDestSlot(destination)

Retorna o ID da posição de equipamento pelo nome do destino.

O destino pode ser:
* cabeça - (cabeça)
* peito - (peito)
* pernas - (pernas)
* pés - (pés)
* mão - (mão)
* mão secundária - (mão esquerda)

### bot.creative

Esta coleção de APIs é útil no modo criativo.
A detecção e a troca de modo não estão implementadas,
mas é assumido e muitas vezes é necessário que o bot esteja no modo criativo para que essas funcionalidades funcionem.

#### bot.creative.setInventorySlot(slot, item, [callback])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Fornece ao bot o item especificado na posição especificada.
Se for executado duas vezes antes que a primeira execução seja concluída, a primeira execução conterá um erro.

 * `slot` é um número de posição no inventário (onde 36 é a primeira posição, etc.).
 * `item` é uma instância de [prismarine-item](https://github.com/PrismarineJS/prismarine-item) com seus metadados, dados nbt, etc.
    Se `item` for `null`, o item nessa posição será removido
 * `retorno(erro)` (opcional) é uma função de retorno que é executada quando o servidor aceita a transação ou quando a transação falha.

Se este método alterar algo, será emitido `bot.inventory.on("updateSlot")`.

#### bot.creative.flyTo(destination, [cb])

Esta função também retorna uma `Promise`, com `void` como argumento quando concluída.

Execute `startFlying()` e mova-se a uma velocidade constante em um espaço tridimensional em linha reta até o destino.
`destino` é um `Vec3`, e as coordenadas `x` e `z` às vezes terminarão em `.5`.
Essa operação não funcionará se houver algum obstáculo no caminho,
portanto, é recomendável voar distâncias curtas.

Quando o bot chegar ao destino, `cb` será executado.

Este método não procurará automaticamente o caminho.
Espera-se que uma implementação de busca de caminho use este método para se mover < 2 blocos de cada vez.

Para parar de voar (voltar à física normal), você pode executar `stopFlying()`.

#### bot.creative.startFlying()

Altera `bot.physics.gravity` para `0`.
Para voltar à física normal, você pode executar `stopFlying()`.

Este método é útil se você quiser flutuar enquanto quebra o bloco abaixo de você.
Não é necessário executar esta função antes de executar `flyTo()`.

Observação: enquanto você voa, `bot.entity.velocity` não é preciso.

#### bot.creative.stopFlying()

Restaura `bot.physics.gravity` ao seu valor original.