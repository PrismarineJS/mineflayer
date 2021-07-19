import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Client, ClientOptions } from 'minecraft-protocol'
import { Vec3 } from 'vec3'
import { Item } from 'prismarine-item'
import { Window } from 'prismarine-windows'
import { Recipe } from 'prismarine-recipe'
import { Block } from 'prismarine-block'
import { Entity } from 'prismarine-entity'

//todo grammer? full sentences? puncutation? capitalization?

/**
 * Create and return an instance of the class bot.
 *
 * @param options an object containing the optional properties
 */
export function createBot (options: BotOptions): Bot
export interface BotOptions extends ClientOptions {
  //todo use @default or @defaultValue https://github.com/microsoft/tsdoc/issues/27
  /**
   * Whether errors should be caught and logged
   *
   * @default `true`
   */
  logErrors?: boolean
  /**
   * Whether errors should be hidden (even if logErrors is true)
   *
   * @default `true`
   */
  hideErrors?: boolean
  //todo
  /**
   * Whether to load internal plugins
   * @defaut `true`
   */
  loadInternalPlugins?: boolean
  /**
   * @see PluginOptions
   *
   * @default `{}` todo omit?
   */
  plugins?: PluginOptions
  //todo
  /**
   * @see chat
   */
  chat?: ChatLevel
  colorsEnabled?: boolean
  /**
   * @default `far`
   */
  viewDistance?: ViewDistance
  mainHand?: MainHands
  difficulty?: number
  chatLengthLimit?: number
  physicsEnabled?: boolean
  client?: Client
}

export type ChatLevel = 'enabled' | 'commandsOnly' | 'disabled'
//todo find actual numbers for these
export type ViewDistance = 'far' | 'normal' | 'short' | 'tiny'
export type MainHands = 'left' | 'right'
// see https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#mineflayercreatebotoptions
export interface PluginOptions {
  [plugin: string]: boolean | Plugin
}

export type Plugin = (bot: Bot, options: BotOptions) => void

interface BotEvents {
  /**
   * Emitted when a player chats publicly.
   *
   * @param username who said the message (compare with bot.username to ignore your own chat) //todo link bot.username?
   * @param message stripped of all color and control characters
   * @param translate chat message type. Null for most bukkit chat messages //todo more descriptive?
   * @param jsonMsg unmodified JSON message from the server
   * @param matches array of returned matches from regular expressions //todo null if
   */
  chat: (
    username: string,
    message: string,
    translate: string | null,
    jsonMsg: ChatMessage,
    matches: string[] | null
  ) => void
  /**
   * Emitted when a player chats to you privately //todo with /tell or /whisper
   *
   * @param username who said the message
   * @param message stripped of all color and control characters
   * @param translate chat message type. Null for most bukkit chat messages
   * @param jsonMsg unmodified JSON message from the server
   * @param matches array of returned matches from regular expressions //todo null if ...
   */
  whisper: (
    username: string,
    message: string,
    translate: string | null,
    jsonMsg: ChatMessage,
    matches: string[] | null
  ) => void
  /**
   * Emitted for every server message which appears on the Action Bar
   *
   * @param jsonMsg unmodified JSON message from the server
   */
  actionBar: (jsonMsg: ChatMessage) => void
  /**
   * Emitted when an error occurs.
   * @param err
   */
  error: (err: Error) => void
  /**
   * Emitted for every server message, including chats.
   * @param jsonMsg
   * @param position
   */
  message: (jsonMsg: ChatMessage, position: string) => void
  /**
   * Alias for the //todo @see message event but it calls .toString() on the message object to get a string for the message before emitting.
   * @param message
   * @param position
   * @param jsonMsg
   */
  messagestr: (message: string, position: string, jsonMsg: ChatMessage) => void
  unmatchedMessage: (stringMsg: string, jsonMsg: ChatMessage) => void
  /**
   * Fires when the index file has been loaded, you can load mcData and plugins here but it's better to wait for "spawn" event.
   */
  inject_allowed: () => void
  /**
   * Fires after you successfully login to the server. You probably want to wait for the spawn event before doing anything though. //todo relevant https://github.com/PrismarineJS/mineflayer/issues/328
   */
  login: () => void
  /**
   * Emitted once after you log in and spawn for the first time and then emitted when you respawn after death.
   * This is usually the event that you want to listen to before doing anything on the server.
   */
  spawn: () => void
  /**
   * Emitted when you change dimensions and just before you spawn. Usually you want to ignore this event and wait until the "spawn" event instead.
   */
  respawn: () => void
  /**
   * Emitted when the server changes any of the game properties. //todo more descriptive
   */
  game: () => void
  /**
   * Emitted when the server sends a title
   * @param text
   */
  title: (text: string) => void
  /**
   * Emitted when it starts or stops raining. If you join a server where it is already raining, this event will fire.
   */
  rain: () => void
  /**
   * Emitted when the server sends a time update. See bot.time. //todo link bot.time
   */
  time: () => void
  /**
   * Emitted when the bot is kicked from the server.
   * @param reason chat message explaining why you were kicked
   * @param loggedIn `true` if the client was kicked after successfuly logging in, or `false` if the kick occured in the login phase
   */
  kicked: (reason: string, loggedIn: boolean) => void
  /**
   * Emitted when you are no longer connected to the server.
   */
  end: () => void
  /**
   * Fires when you cannot spawn in your bed and your spawn point gets reset.
   */
  spawnReset: () => void
  /**
   * Fires when you die.
   */
  death: () => void
  /**
   * Fires when your hp or food change.
   */
  health: () => void
  breath: () => void
  entitySwingArm: (entity: Entity) => void
  entityHurt: (entity: Entity) => void
  entityDead: (entity: Entity) => void
  entityTaming: (entity: Entity) => void
  entityTamed: (entity: Entity) => void
  entityShakingOffWater: (entity: Entity) => void
  entityEatingGrass: (entity: Entity) => void
  entityWake: (entity: Entity) => void
  entityEat: (entity: Entity) => void
  entityCriticalEffect: (entity: Entity) => void
  entityMagicCriticalEffect: (entity: Entity) => void
  entityCrouch: (entity: Entity) => void
  entityUncrouch: (entity: Entity) => void
  entityEquip: (entity: Entity) => void
  entitySleep: (entity: Entity) => void
  entitySpawn: (entity: Entity) => void
  itemDrop: (entity: Entity) => void
  /**
   * Fires when an entity picks up an item.
   * @param collector entity that picked up the item.
   * @param collected the entity that was the item on the ground.
   */
  playerCollect: (collector: Entity, collected: Entity) => void
  entityGone: (entity: Entity) => void
  entityMoved: (entity: Entity) => void
  entityDetach: (entity: Entity, vehicle: Entity) => void
  /**
   * An entity is attached to a vehicle, such as a mine cart or boat.
   * @param entity the entity hitching a ride
   * @param vehicle the entity that is the vehicle
   */
  entityAttach: (entity: Entity, vehicle: Entity) => void
  entityUpdate: (entity: Entity) => void
  entityEffect: (entity: Entity, effect: Effect) => void
  entityEffectEnd: (entity: Entity, effect: Effect) => void
  playerJoined: (player: Player) => void
  playerUpdated: (player: Player) => void
  playerLeft: (entity: Player) => void
  /**
   * Fires when a block updates. Both oldBlock and newBlock provided for comparison.
   * It is better to use this event from bot.world instead of bot directly
   * @param oldBlock //todo when is this null
   * @param newBlock
   */
  blockUpdate: (oldBlock: Block | null, newBlock: Block) => void
  /**
   * Fires for a specific point. Both oldBlock and newBlock provided for comparison.
   * (It is better to use this event from bot.world instead of bot directly)
   * @param oldBlock
   * @param newBlock
   */
  'blockUpdate:(x, y, z)': (oldBlock: Block | null, newBlock: Block) => void
  chunkColumnLoad: (entity: Vec3) => void
  /**
   * Fires when a chunk has updated.
   * @param entity the coordinates to the corner of the chunk with the smallest x, y, and z values. //todo point or entity? https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#chunkcolumnunload-point
   */
  chunkColumnUnload: (entity: Vec3) => void
  /**
   * Fires when the client hears a named sound effect.Fires when the client hears a named sound effect.
   * @param soundName name of the sound effect
   * @param position a Vec3 instance where the sound originates
   * @param volume floating point volume, 1.0 is 100%
   * @param pitch integer pitch, 63 is 100%
   */
  soundEffectHeard: (
    soundName: string,
    position: Vec3,
    volume: number,
    pitch: number
  ) => void
  /**
   * Fires when the client hears a hardcoded sound effect.
   * @param soundId id of the sound effect
   * @param soundCategory category of the sound effect
   * @param position a Vec3 instance where the sound originates
   * @param volume floating point volume, 1.0 is 100%
   * @param pitch integer pitch, 63 is 100%
   */
  hardcodedSoundEffectHeard: (
    soundId: number,
    soundCategory: number,
    position: Vec3,
    volume: number,
    pitch: number
  ) => void
  /**
   * Fires when a note block goes off somewherec.
   * @param block a Block instance, the block that emitted the noise
   * @param instrument @see Instrument //todo
   * @param pitch the pitch of the note (between 0-24 inclusive where 0 is the lowest and 24 is the highest) //todo @link http://www.minecraftwiki.net/wiki/Note_Block
   */
  noteHeard: (block: Block, instrument: Instrument, pitch: number) => void
  pistonMove: (block: Block, isPulling: number, direction: number) => void
  /**
   *
   * @param block a Block instance, the block whose lid opened. The right block if it's a double chest
   * @param isOpen number of players that have the chest open. 0 if it's closed
   * //todo missing param https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#chestlidmove-block-isopen-block2
   */
  chestLidMove: (block: Block, isOpen: number) => void
  /**
   * Fires when the client observes a block in the process of being broken.
   * @param block a Block instance, the block being broken
   * @param destroyStage integer corresponding to the destroy progress (0-9)
   */
  blockBreakProgressObserved: (block: Block, destroyStage: number) => void
  /**
   * Fires when the client observes a block stops being broken. This occurs whether the process was completed or aborted.
   * @param block a Block instance, the block no longer being broken
   */
  blockBreakProgressEnd: (block: Block) => void
  /**
   * @param block the block that no longer exists
   */
  diggingCompleted: (block: Block) => void
  /**
   * @param block the block that still exists
   */
  diggingAborted: (block: Block) => void
  /**
   * Fires when the bot moves. If you want the current position, use bot.entity.position and for normal moves if you want the previous position, use bot.entity.position.minus(bot.entity.velocity)
   */
  move: () => void
  /**
   * Fires when the bot is force moved by the server (teleport, spawning, ...). If you want the current position, use bot.entity.position.
   */
  forcedMove: () => void
  /**
   * Fires when you mount an entity such as a minecart. To get access to the entity, use bot.vehicle.

   To mount an entity, use mount.
   */
  mount: () => void
  /**
   * Fires when you dismount from an entity.
   * @param vehicle
   */
  dismount: (vehicle: Entity) => void
  /**
   * Fires when you begin using a workbench, chest, brewing stand, etc.
   * @param vehicle
   */
  windowOpen: (vehicle: Window) => void
  /**
   * Fires when you may no longer work with a workbench, chest, etc.
   * @param vehicle
   */
  windowClose: (vehicle: Window) => void
  /**
   * Fires when you sleep.
   */
  sleep: () => void
  /**
   * Fires when you wake up.
   */
  wake: () => void
  /**
   * Fires when bot.experience.* has updated.
   */
  experience: () => void
  /**
   * Fires every tick if bot.physicsEnabled is set to true. //todo link
   */
  physicsTick: () => void
  physicTick: () => void
  /**
   * Fires when a scoreboard is added.
   * @param scoreboard
   */
  scoreboardCreated: (scoreboard: ScoreBoard) => void
  /**
   * Fires when a scoreboard is deleted.
   * @param scoreboard
   */
  scoreboardDeleted: (scoreboard: ScoreBoard) => void
  /**
   * Fires when a scoreboard's title is updated.
   * @param scoreboard
   */
  scoreboardTitleChanged: (scoreboard: ScoreBoard) => void
  /**
   * Fires when the score of a item in a scoreboard is updated.
   * @param scoreboard
   * @param item
   */
  scoreUpdated: (scoreboard: ScoreBoard, item: number) => void
  /**
   * Fires when the score of a item in a scoreboard is removed.
   * @param scoreboard
   * @param item
   */
  scoreRemoved: (scoreboard: ScoreBoard, item: number) => void
  /**
   * Fires when the position of a scoreboard is updated.
   * @param position
   * @param scoreboard
   */
  scoreboardPosition: (position: DisplaySlot, scoreboard: ScoreBoard) => void
  /**
   * Fires when new boss bar is created.
   * @param bossBar
   */
  bossBarCreated: (bossBar: BossBar) => void
  /**
   * Fires when new boss bar is deleted.
   * @param bossBar
   */
  bossBarDeleted: (bossBar: BossBar) => void
  /**
   * Fires when new boss bar is updated.
   * @param bossBar
   */
  bossBarUpdated: (bossBar: BossBar) => void
  /**
   * Emitted when the server sends a resource pack.
   * @param url
   * @param hash //todo more descriptive about format?
   */
  resourcePack: (url: string, hash: string) => void
  //todo https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#weatherupdate
  //todo https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#breath
  //todo https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#blockplaced-oldblock-newblock
  //todo https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#helditemchanged-helditem
  //todo https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#chatname-matches
}

export interface Bot extends TypedEmitter<BotEvents> {
  username: string
  protocolVersion: string
  majorVersion: string
  version: string
  entity: Entity
  entities: { [id: string]: Entity }
  spawnPoint: Vec3
  game: GameState
  player: Player
  players: { [username: string]: Player }
  isRaining: boolean
  chatPatterns: ChatPattern[]
  settings: GameSettings
  experience: Experience
  health: number
  food: number
  foodSaturation: number
  oxygenLevel: number
  physics: PhysicsOptions
  physicsEnabled: boolean
  time: Time
  quickBarSlot: number
  inventory: Window
  targetDigBlock: Block
  isSleeping: boolean
  scoreboards: { [name: string]: ScoreBoard }
  scoreboard: { [slot in DisplaySlot]: ScoreBoard }
  controlState: ControlStateStatus
  creative: creativeMethods
  world: any
  _client: Client
  heldItem: Item | null
  currentWindow: Window | null
  simpleClick: simpleClick

  connect: (options: BotOptions) => void

  supportFeature: (feature: string) => boolean

  end: () => void

  blockAt: (point: Vec3) => Block | null

  blockInSight: (maxSteps: number, vectorLength: number) => Block | null

  blockAtCursor: (maxDistance?: number, matcher?: Function) => Block | null

  canSeeBlock: (block: Block) => boolean

  findBlock: (options: FindBlockOptions) => Block | null

  findBlocks: (options: FindBlockOptions) => Vec3[]

  canDigBlock: (block: Block) => boolean

  recipesFor: (
    itemType: number,
    metadata: number | null,
    minResultCount: number | null,
    craftingTable: Block | boolean | null
  ) => Recipe[]

  recipesAll: (
    itemType: number,
    metadata: number | null,
    craftingTable: Block | boolean | null
  ) => Recipe[]

  quit: (reason?: string) => void

  tabComplete: (
    str: string,
    cb: (matches: string[]) => void,
    assumeCommand?: boolean,
    sendBlockInSight?: boolean
  ) => Promise<string[]>

  chat: (message: string) => void

  whisper: (username: string, message: string) => void

  chatAddPattern: (pattern: RegExp, chatType: string, description?: string) => number

  setSettings: (options: Partial<GameSettings>) => void

  loadPlugin: (plugin: Plugin) => void

  loadPlugins: (plugins: Plugin[]) => void

  hasPlugin: (plugin: Plugin) => boolean

  sleep: (bedBlock: Block, cb?: (err?: Error) => void) => Promise<void>

  isABed: (bedBlock: Block) => void

  wake: (cb?: (err?: Error) => void) => Promise<void>

  setControlState: (control: ControlState, state: boolean) => void

  getControlState: (control: ControlState) => boolean

  clearControlStates: () => void

  lookAt: (point: Vec3, force?: boolean, callback?: () => void) => Promise<void>

  look: (
    yaw: number,
    pitch: number,
    force?: boolean,
    callback?: () => void
  ) => Promise<void>

  updateSign: (block: Block, text: string) => void

  equip: (
    item: Item,
    destination: EquipmentDestination | null,
    callback?: (error?: Error) => void
  ) => Promise<void>

  unequip: (
    destination: EquipmentDestination | null,
    callback?: () => void
  ) => Promise<void>

  tossStack: (item: Item, callback?: (error?: Error) => void) => Promise<void>

  toss: (
    itemType: number,
    metadata: number | null,
    count: number | null,
    callback?: (err?: Error) => void
  ) => Promise<void>

  dig: ((block: Block, forceLook?: boolean | 'ignore', callback?: (err?: Error) => void) => Promise<void>) & ((block: Block, forceLook: boolean | 'ignore', digFace: 'auto' | Vec3 | 'raycast', callback?: (err?: Error) => void) => Promise<void>)

  stopDigging: () => void

  digTime: (block: Block) => number

  placeBlock: (referenceBlock: Block, faceVector: Vec3, cb?: () => void) => Promise<void>

  placeEntity: (referenceBlock: Block, faceVector: Vec3) => Promise<Entity>

  activateBlock: (block: Block, callback?: (err?: Error) => void) => Promise<void>

  activateEntity: (block: Entity, callback?: (err?: Error) => void) => Promise<void>

  activateEntityAt: (block: Entity, position: Vec3, callback?: (err?: Error) => void) => Promise<void>

  consume: (callback: (err?: Error) => void) => Promise<void>

  fish: (callback: (err?: Error) => void) => Promise<void>

  activateItem: (offhand?: boolean) => void

  deactivateItem: () => void

  useOn: (targetEntity: Entity) => void

  attack: (entity: Entity) => void

  swingArm: (hand: 'left' | 'right' | undefined, showHand?: boolean) => void

  mount: (entity: Entity) => void

  dismount: () => void

  moveVehicle: (left: number, forward: number) => void

  setQuickBarSlot: (slot: number) => void

  craft: (
    recipe: Recipe,
    count: number | null,
    craftingTable: Block,
    callback?: () => void
  ) => Promise<void>

  writeBook: (
    slot: number,
    pages: string[],
    callback?: (err?: Error) => void
  ) => Promise<void>

  openChest: (chest: Block | Entity) => Chest

  openFurnace: (furnace: Block) => Furnace

  openDispenser: (dispenser: Block) => Dispenser

  openEnchantmentTable: (enchantmentTable: Block) => EnchantmentTable

  openAnvil: (anvil: Block) => Anvil

  openVillager: (
    villager: Entity
  ) => Villager

  trade: (
    villagerInstance: Villager,
    tradeIndex: string | number,
    times?: number,
    cb?: (err?: Error) => void
  ) => Promise<void>

  setCommandBlock: (pos: Vec3, command: string, trackOutput: boolean) => void

  clickWindow: (
    slot: number,
    mouseButton: number,
    mode: number,
    cb?: (err?: Error) => void
  ) => Promise<void>

  putSelectedItemRange: (
    start: number,
    end: number,
    window: Window,
    slot: any,
    cb?: (err?: Error) => void
  ) => Promise<void>

  putAway: (slot: number, cb?: (err?: Error) => void) => Promise<void>

  closeWindow: (window: Window) => void

  transfer: (options: TransferOptions, cb?: (err?: Error) => void) => Promise<void>

  openBlock: (block: Block, Class: new () => EventEmitter) => void

  openEntity: (block: Entity, Class: new () => EventEmitter) => void

  moveSlotItem: (
    sourceSlot: number,
    destSlot: number,
    cb?: (err?: Error) => void
  ) => Promise<void>

  updateHeldItem: () => void

  getEquipmentDestSlot: (destination: string) => number

  waitForChunksToLoad: (cb?: (err?: Error) => void) => Promise<void>

  nearestEntity: (filter?: (entity: Entity) => boolean) => Entity | null

  waitForTicks: (ticks: number) => Promise<void>

  addChatPattern: (name: string, pattern: RegExp, options?: chatPatternOptions) => number

  addChatPatternSet: (name: string, patterns: RegExp[], options?: chatPatternOptions) => number

  removeChatPattern: (name: string | number) => void

  awaitMessage: (...args: string[] | RegExp[]) => Promise<string>

  acceptResourcePack: () => void

  denyResourcePack: () => void
}

export interface simpleClick {
  leftMouse: (slot: number) => Promise<void>
  rightMouse: (slot: number) => Promise<void>
}

export interface chatPatternOptions {
  repeat: boolean
  parse: boolean
}

export interface GameState {
  levelType: LevelType
  gameMode: GameMode
  hardcore: boolean
  dimension: Dimension
  difficulty: Difficulty
  maxPlayers: number
}

export type LevelType =
  | 'default'
  | 'flat'
  | 'largeBiomes'
  | 'amplified'
  | 'customized'
  | 'buffet'
  | 'default_1_1'
export type GameMode = 'survival' | 'creative' | 'adventure'
export type Dimension = 'minecraft:nether' | 'minecraft:overworld' | 'minecraft:end'
export type Difficulty = 'peaceful' | 'easy' | 'normal' | 'hard'

export interface Player {
  uuid: string
  username: string
  displayName: ChatMessage
  gamemode: number
  ping: number
  entity: Entity
}

export class ChatMessage {
  json: object
  text?: string
  translate?: string
  with?: ChatMessage[]
  extra?: ChatMessage[]
  bold: boolean
  italic: boolean
  underlined: boolean
  strikethrough: boolean
  obfuscated: boolean
  color: string
  clickEvent: object
  hoverEvent: object

  constructor (message: ChatMessage);

  parse (): void;

  length (): number;

  getText (idx: number, lang?: { [key: string]: string }): string;

  toString (lang?: { [key: string]: string }): string;

  valueOf (): string;

  toMotd (lang?: { [key: string]: string }): string;

  toAnsi (lang?: { [key: string]: string }): string;
}

export interface ChatPattern {
  pattern: RegExp
  type: string
  description: string
}

export interface SkinParts {
  showCape: boolean
  showJacket: boolean
  showLeftSleeve: boolean
  showRightSleeve: boolean
  showLeftPants: boolean
  showRightPants: boolean
  showHat: boolean
}

export interface GameSettings {
  chat: ChatLevel
  colorsEnabled: boolean
  viewDistance: ViewDistance
  difficulty: number
  skinParts: SkinParts
  mainHand: MainHands
}

export interface Experience {
  level: number
  points: number
  progress: number
}

export interface PhysicsOptions {
  maxGroundSpeed: number
  terminalVelocity: number
  walkingAcceleration: number
  gravity: number
  groundFriction: number
  playerApothem: number
  playerHeight: number
  jumpSpeed: number
  yawSpeed: number
  sprintSpeed: number
  maxGroundSpeedSoulSand: number
  maxGroundSpeedWater: number
}

export interface Time {
  doDaylightCycle: boolean
  bigTime: BigInt
  time: number
  timeOfDay: number
  day: number
  isDay: boolean
  moonPhase: number
  bigAge: BigInt
  age: number
}

export interface ControlStateStatus {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
  sneak: boolean
}

export type ControlState =
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'jump'
  | 'sprint'
  | 'sneak'

export interface Effect {
  id: number
  amplifier: number
  duration: number
}

export interface Instrument {
  id: number
  name: 'harp' | 'doubleBass' | 'snareDrum' | 'sticks' | 'bassDrum'
}

export interface FindBlockOptions {
  point?: Vec3
  matching: number | number[] | ((block: Block) => boolean)
  maxDistance?: number
  count?: number
  useExtraInfo?: boolean
}

export type EquipmentDestination = 'hand' | 'head' | 'torso' | 'legs' | 'feet' | 'off-hand'

export interface TransferOptions {
  window: Window
  itemType: number
  metadata: number | null
  sourceStart: number
  sourceEnd: number
  destStart: number
  destEnd: number
}

export interface creativeMethods {
  setInventorySlot: (
    slot: number,
    item: Item | null,
    callback?: (error?: Error) => void
  ) => Promise<void>

  flyTo: (destination: Vec3, cb?: () => void) => Promise<void>

  startFlying: () => void

  stopFlying: () => void
}

export class Location {
  floored: Vec3
  blockPoint: Vec3
  chunkCorner: Vec3
  blockIndex: number
  biomeBlockIndex: number
  chunkYIndex: number

  constructor (absoluteVector: Vec3);
}

export class Painting {
  id: number
  position: Vec3
  name: string
  direction: Vec3

  constructor (id: number, position: Vec3, name: string, direction: Vec3);
}

interface StorageEvents {
  open: () => void
  close: () => void
  updateSlot: (oldItem: Item | null, newItem: Item) => void
}

interface FurnaceEvents extends StorageEvents {
  update: () => void
}

interface ConditionalStorageEvents extends StorageEvents {
  ready: () => void
}

export class Chest extends (EventEmitter as new () => TypedEmitter<StorageEvents>) {
  window: object | /* prismarine-windows ChestWindow */ null

  constructor ();

  close (): void;

  deposit (
    itemType: number,
    metadata: number | null,
    count: number | null,
    cb?: (err?: Error) => void
  ): Promise<void>;

  withdraw (
    itemType: number,
    metadata: number | null,
    count: number | null,
    cb?: (err?: Error) => void
  ): Promise<void>;

  count (itemType: number, metadata: number | null): number;

  items (): Item[];
}

export class Furnace extends (EventEmitter as new () => TypedEmitter<FurnaceEvents>) {
  fuel: number
  progress: number

  constructor ();

  close (): void;

  takeInput (cb: (err: Error | null, item: Item) => void): Promise<Item>;

  takeFuel (cb: (err: Error | null, item: Item) => void): Promise<Item>;

  takeOutput (cb: (err: Error | null, item: Item) => void): Promise<Item>;

  putInput (
    itemType: number,
    metadata: number | null,
    count: number,
    cb?: (err?: Error) => void
  ): Promise<void>;

  putFuel (
    itemType: number,
    metadata: number | null,
    count: number,
    cb?: (err?: Error) => void
  ): Promise<void>;

  inputItem (): Item;

  fuelItem (): Item;

  outputItem (): Item;
}

export class Dispenser extends (EventEmitter as new () => TypedEmitter<StorageEvents>) {
  constructor ();

  close (): void;

  deposit (
    itemType: number,
    metadata: number | null,
    count: number | null,
    cb?: (err?: Error) => void
  ): Promise<void>;

  withdraw (
    itemType: number,
    metadata: number | null,
    count: number | null,
    cb?: (err?: Error) => void
  ): Promise<void>;

  count (itemType: number, metadata: number | null): number;

  items (): Item[];
}

export class EnchantmentTable extends (EventEmitter as new () => TypedEmitter<ConditionalStorageEvents>) {
  enchantments: Enchantment[]

  constructor ();

  close (): void;

  targetItem (): Item;

  enchant (
    choice: string | number,
    cb?: (err: Error | null, item: Item) => void
  ): Promise<Item>;

  takeTargetItem (cb?: (err: Error | null, item: Item) => void): Promise<Item>;

  putTargetItem (item: Item, cb?: (err: Error | null) => void): Promise<Item>;

  putLapis (item: Item, cb?: (err: Error | null) => void): Promise<Item>;
}

export class Anvil {
  combine (itemOne: Item, itemTwo: Item, name?: string): Promise<void>
  rename (item: Item, name?: string): Promise<void>
}

export interface Enchantment {
  level: number
}

export class Villager extends (EventEmitter as new () => TypedEmitter<ConditionalStorageEvents>) {
  trades: VillagerTrade[]

  constructor ();

  close (): void;
}

export interface VillagerTrade {
  firstInput: Item
  output: Item
  hasSecondItem: boolean
  secondaryInput: Item | null
  disabled: boolean
  tooluses: number
  maxTradeuses: number
}

export class ScoreBoard {
  name: string
  title: string
  itemsMap: { [name: string]: ScoreBoardItem }
  items: ScoreBoardItem[]

  constructor (packet: object);

  setTitle (title: string): void;

  add (name: string, value: number): ScoreBoardItem;

  remove (name: string): ScoreBoardItem;
}

export interface ScoreBoardItem {
  name: string
  value: number
}

export type DisplaySlot =
  | 'list'
  | 'sidebar'
  | 'belowName'
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18

export class BossBar {
  entityUUID: string
  title: ChatMessage
  health: number
  dividers: number
  color: 'pink' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'white'
  shouldDarkenSky: boolean
  isDragonBar: boolean
  shouldCreateFog: boolean

  constructor (
    uuid: string,
    title: string,
    health: number,
    dividers: number,
    color: number,
    flags: number
  );
}

export var supportedVersions: string[]
export var testedVersions: string[]

export function supportFeature (feature: string, version: string): boolean
