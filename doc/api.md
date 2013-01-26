# API

## Classes

### mineflayer.vec3

See [superjoe30/node-vec3](https://github.com/superjoe30/node-vec3)

All points in mineflayer are supplied as instances of this class.

 * x - south
 * y - up
 * z - west

Functions and methods which require a point argument accept `Vec3` instances
as well as an array with 3 values, and an object with `x`, `y`, and `z`
properties.

### mineflayer.Entity

Entities represent players, mobs, and objects. They are emitted
in many events, and you can access your own entity with `bot.entity`.

#### entity.id

#### entity.type

Choices:

 * `player`
 * `mob`
 * `object`
 * `global` - lightning
 * `orb` - experience orb.

#### entity.username

If the entity type is `player`, this field will be set.

#### entity.mobType

If the entity type is `mob`, this field will be set.

#### entity.objectType

If the entity type is `object`, this field will be set.

#### entity.count

If the entity type is `orb`, this field will be how much experience you
get from collecting the orb.

#### entity.position

#### entity.velocity

#### entity.yaw

#### entity.pitch

#### entity.height

#### entity.onGround

#### entity.equipment[5]

 * `0` - held item
 * `1` - head
 * `2` - torso
 * `3` - legging
 * `4` - shoes

#### entity.heldItem

Equivalent to `entity.equipment[0]`.

### mineflayer.Block

#### block.pos

Vec3 instance.

#### block.type

Numerical id.

#### block.name

#### block.displayName

#### block.meta

#### block.light

#### block.skyLight

#### block.hardness

#### block.add

#### block.biome

A biome instance. See `Biome`.

#### block.signText

If the block is a sign, contains the sign text.

#### block.painting

If the block is a painting, contains information about the painting.

 * `id`
 * `position`
 * `name`
 * `direction` - direction vector telling how the painting is facing.

#### block.boundingBox

The shape of the block according to the physics engine's collision decection. Currently one of:

 * `block` - currently, partially solid blocks, such as half-slabs and ladders, are considered entirely solid.
 * `empty` - such as flowers and lava.

Note that some api's will override the boundingBox to `block` if there's a fence just below it.

### mineflayer.Biome

#### biome.id

Numerical id.

#### biome.color

#### biome.height

#### biome.name

#### biome.rainfall

#### biome.temperature

### mineflayer.Item

#### item.type

Numerical id.

#### item.count

#### item.meta

#### item.nbt

Buffer.

#### item.name

#### item.displayName

#### item.stackSize

### mineflayer.windows.Window (base class)

#### window.id

#### window.type

#### window.title

"Inventory", "Chest", "Large chest", "Crafting", "Furnace", or "Trap"

#### window.slots

Map of slot index to `Item` instance.

#### window.selectedItem

In vanilla client, this is the item you are holding with the mouse cursor.

#### window.findInventoryItem(itemType, [metadata])

 * `itemType` - numerical id that you are looking for
 * `metadata` - (optional) metadata value that you are looking for.
   defaults to unspecified.

#### window.count(itemType, [metadata])

Returns how many you have in the inventory section of the window.

 * `itemType` - numerical id that you are looking for
 * `metadata` - (optional) metadata value that you are looking for.
   defaults to unspecified

#### window.items()

Returns a list of `Item` instances from the inventory section of the window.

### mineflayer.windows.InventoryWindow
### mineflayer.windows.ChestWindow
### mineflayer.windows.CraftingTableWindow
### mineflayer.windows.FurnaceWindow
### mineflayer.windows.DispenserWindow
### mineflayer.windows.EnchantmentTableWindow
### mineflayer.windows.BrewingStandWindow

## Bot

### Properties

#### bot.entity

Your own entity. See `Entity`.

#### bot.entities

All nearby entities. This object is a map of entityId to entity.

#### bot.username

Use this to find out your own name.

#### bot.spawnPoint

Coordinates to the main spawn point, where all compasses point to.

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.worldHeight

#### bot.game.maxPlayers

#### bot.players

Map of username to people playing the game. A player looks like this:

```js
{
  username: 'player',
  ping: 28,
  entity: entity, // null if you are too far away
}
```

#### bot.isRaining

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
 * `far`
 * `normal`
 * `short`
 * `tiny`

#### bot.settings.difficulty

Same as from server.properties.

#### bot.settings.showCape

If you have a cape you can turn it off by setting this to false.

#### bot.experience.level

#### bot.experience.points

Total experience points.

#### bot.experience.progress

Between 0 and 1 - amount to get to the next level.

#### bot.health

Number in the range [0, 20] representing the number of half-hearts.

#### bot.food

Number, in the range [0, 20] representing the number of half-turkey-legs.

#### bot.foodSaturation

Food saturation acts as a food "overcharge". Food values will not decrease
while the saturation is over zero. Players logging in automatically get a
saturation of 5.0. Eating food increases the saturation as well as the food bar.


#### bot.physics

Edit these numbers to tweak gravity, jump speed, terminal velocity, etc.
Do this at your own risk.

#### bot.time.day

Time of the day, in ticks.

Time is based on ticks, where 20 ticks happen every second. There are 24000
ticks in a day, making Minecraft days exactly 20 minutes long.

The time of day is based on the timestamp modulo 24000. 0 is sunrise, 6000
is noon, 12000 is sunset, and 18000 is midnight.

#### bot.time.age

Age of the world, in ticks.

#### bot.quickBarSlot

Which quick bar slot is selected (0 - 8).

#### bot.inventory

A `Window` instance representing your inventory.

#### bot.targetDigBlock

The `block` that you are currently digging, or `null`.

### Events

#### "chat" (username, message, rawMessage)

Only emitted when a player chats publicly.

 * `username` - who said the message (compare with bot.username to ignore your own chat)
 * `message` - stripped of all color and control characters
 * `rawMessage` - unmodified message from the server

#### "message" (message, rawMessage)

Emitted for every server message, including chats.

 * `message` - stripped of all color and control characters
 * `rawMessage` - unmodified message from the server

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

#### "rain"

Emitted when it starts or stops raining. If you join a
server where it is already raining, this event will fire.

#### "time"

Emitted when the server sends a time update. See `bot.time`.

#### "kicked" (reason)

Emitted when the bot is kicked from the server. `reason`
is a string explaining why you were kicked.

#### "spawnReset"

Fires when you cannot spawn in your bed and your spawn point gets reset.

#### "death"

Fires when you die.

#### "health"

Fires when your hp or food change.

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
#### "playerLeft" (player)

#### "blockUpdate" (point)
#### "blockUpdate:(x, y, z)"

Fires for a specific point. Replace x, y, and z with real integer values.

#### "chunkColumnLoad" (point)
#### "chunkColumnUnload" (point)

Fires when a chunk has updated. `point` is the coordinates to the corner
of the chunk with the smallest x, y, and z values.


#### "noteHeard" (block, instrument, pitch)

Fires when a note block goes off somewhere.

 * `block`: a Block instance, the block at emitted the noise
 * `instrument`:
   - `id`: integer id
   - `name`: one of [`harp`, `doubleBass`, `snareDrum`, `sticks`, `bassDrum`].
 * `pitch`: The pitch of the note (between 0-24 inclusive where 0 is the
   lowest and 24 is the highest). More information about how the pitch values
   correspond to notes in real life are available on the
   [official Minecraft wiki](http://www.minecraftwiki.net/wiki/Note_Block).

#### "pistonMove" (block, isPulling, direction)

#### "chestLidMove" (block, isOpen)

#### "diggingCompleted" (block)

 * `block` - the block that no longer exists

#### "move"

Fires when the bot moves. If you want the current position, use
`bot.entity.position` and if you want the previous position, use
`bot.entity.position.minus(bot.entity.velocity)`.

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

### Functions

#### bot.blockAt(point)

Returns the block at `point` or `null` if that point is not loaded.
See `Block`.

### Methods

#### bot.end()

End the connection with the server.

#### bot.quit(reason)

Gracefully disconnect from the server with the given reason (defaults to 'disconnect.quitting').

#### bot.chat(message)

Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary.

#### bot.tell(username, message)

Shortcut for "/tell <username>". All split messages will be whispered to username.

#### bot.setSettings(options)

See the `bot.settings` property.

#### bot.sleep(bedPosition)

Sleep in a bed. `bedPosition` should be a point which contains a bed.

#### bot.wake()

Get out of bed.

#### bot.setControlState(control, state)

 * `control` - one of ['forward', 'back', 'left', 'right', 'jump', 'sprint']
 * `state` - `true` or `false`

#### bot.clearControlStates()

Sets all controls to off.

#### bot.lookAt(point, [force])

 * `point` - tilts your head so that it is directly facing this point.
 * `force` - See `force` in `bot.lookAt`

#### bot.look(yaw, pitch, [force])

Set the direction your head is facing.

 * `yaw` - The number of radians to rotate around the vertical axis, starting
   from due east. Counter clockwise.
 * `pitch` - Number of radians to point up or down. 0 means straight forward.
   pi / 2 means straight up. -pi / 2 means straight down.
 * `force` - If present and true, skips the smooth server-side transition.
   Specify this to true if you need the server to know exactly where you
   are looking, such as for dropping items or shooting arrows. This is not
   needed for client-side calculation such as walking direction.

#### bot.attack(entity)

Attack a player or a mob.

#### bot.mount(entity)

Mount a vehicle. To get back out, use `bot.dismount`.

#### bot.dismount()

Dismounts from the vehicle you are in.

#### bot.updateSign(block, text)

Changes the text on the sign.

#### bot.equip(itemType, destination, [callback])

Equips an item from your inventory. Returns the item that you equipped, or
`null` if unable to equip.

 * `itemType` - numerical item id
 * `destination`
   - `"hand"` - `null` aliases to this
   - `"head"`
   - `"torso"`
   - `"legs"`
   - `"feet"`
 * `callback(error)` - optional. called when you have successfully equipped
   the item or when you learn that you have failed to equip the item.

#### bot.unequip(destination, [callback])

Remove an article of equipment.

#### bot.tossStack(item, [callback])

 * `item` - the stack of items you wish to toss
 * `callback(error)` - optional, called when tossing is done. if error is
   truthy, you were not able to complete the toss.

#### bot.toss(itemType, metadata, count, [callback])

 * `itemType` - numerical id of the item you wish to toss
 * `metadata` - metadata of the item you wish to toss. Use `null`
   to match any metadata
 * `count` - how many you want to toss. `null` is an alias for `1`.
 * `callback(err)` - (optional) called once tossing is complete

#### bot.startDigging(block)

Begin digging into `block` with the currently equipped item. When you
finally break through the block, you get a "diggingCompleted" event.
There is currently no way to stop digging.

#### bot.canDigBlock(block)

Returns whether `block` is diggable and within range.

#### bot.placeBlock(referenceBlock, faceVector)

 * `referenceBlock` - the block you want to place a new block next to
 * `faceVector` - a direction vector pointing to the face of `referenceBlock`
   which you want to place the new block next to.

#### bot.setQuickBarSlot(slot)

 * `slot` - 0-8 the quick bar slot to select.

#### bot.craft(recipe, [options], [callback])

 * `recipe` - A `Recipe` instance. See `bot.recipesFor`.
 * `options.craftingTable` - A `Block` instance, the crafting table you wish to
   use. If the recipe does not require a crafting table, you may leave out
   this option.
 * `options.count` - (optional) How many times you wish to perform the
   operation. If you want to craft planks into 8 sticks, you would set
   `options.count` to `2`. Defaults to `1`.
 * `options.metadata` - (optional) The numerical metadata value you want the
   result to be. Defaults to `0`.
 * `callback` - (optional) Called when the crafting is complete and your
   inventory is updated.

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
