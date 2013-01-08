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

### Entity

Entities represent players, mobs, and objects. They are emitted
in many events, and you can access your own entity with `bot.entity`.

#### entity.id

#### entity.type

Choices:

 * `player`
 * `mob`
 * `object`

#### entity.username

If the entity type is `player`, this field will be set.

#### entity.mobType

If the entity type is `mob`, this field will be set.

#### entity.objectType

If the entity type is `object`, this field will be set.

#### entity.position

#### entity.velocity

#### entity.yaw

#### entity.pitch

#### entity.height

#### entity.onGround

#### entity.equipment[5]

0 = held item, 1-4 = armor slot

#### entity.heldItem

Equivalent to `entity.equipment[0]`.

### Block

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

### Biome

#### biome.id

Numerical id.

#### biome.color

#### biome.height

#### biome.name

#### biome.rainfall

#### biome.temperature


## Bot

### Properties

#### bot.entity

Your own entity. See `Entity`.

#### bot.username

Use this to find out your own name.

#### bot.game.spawnPoint

Coordinates to the main spawn point, where all compasses point to.

#### bot.game.levelType

#### bot.game.dimension

#### bot.game.difficulty

#### bot.game.gameMode

#### bot.game.hardcore

#### bot.game.worldHeight

#### bot.game.maxPlayers

#### bot.game.players

List of people playing the game. A player looks like this:

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

### Events

#### "chat" (username, message, rawMessage)

 * `username` - who said the message
 * `message` - stripped of any control characters
 * `rawMessage` - unmodified message from the server

#### "nonSpokenChat" (message, rawMessage)

 * `message` - stripped of all control characters
 * `rawMessage` - unmodified message from the server

#### "login"

#### "spawn"

Emitted once after you log in and spawn for the first time
and then emitted when you respawn after death.

#### "game"

Emitted when the server changes any of the game properties.

#### "rain"

Emitted when it starts or stops raining. If you join a
server where it is already raining, this event will fire.

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

#### "chunk" (point)

Fires when a chunk has updated. `point` is the coordinates to the corner
with the smallest x, y, and z values.

### Functions

#### blockAt(point)

Returns the block at `point` or `null` if that point is not loaded.
See `Block`.

### Methods

#### chat(message)

Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary. If message begins with "/tell <username> ", then all split messages will be whispered as well.

#### spawn()

Spawn is called automatically upon login and death. If you wish to
disable this behavior and do it manually, pass `autoSpawn` `false`
to the `options` argument of `createBot`.

#### setSettings(options)

See the `bot.settings` property.

#### sleep(bedPosition)

Sleep in a bed. `bedPosition` should be a point which contains a bed.

#### wake()

Get out of bed.

