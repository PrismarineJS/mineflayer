/// <reference types="minecraft-protocol" />
/// <reference types="node" />
/// <reference types="typed-emitter" />
/// <reference types="vec3" />
/// <reference types="prismarine-item" />
/// <reference types="prismarine-windows" />
/// <reference types="prismarine-recipe" />
/// <reference types="prismarine-block" />
/// <reference types="prismarine-entity" />

import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { Client, ClientOptions } from "minecraft-protocol";
import { Vec3 } from "vec3";
import { Item } from "prismarine-item";
import { Window } from "prismarine-windows";
import { Recipe } from "prismarine-recipe";
import { Block } from "prismarine-block";
import { Entity } from "prismarine-entity";

export function createBot(options: BotOptions): Bot;

export interface BotOptions extends ClientOptions {
  logErrors?: boolean;
  hideErrors?: boolean;
  loadInternalPlugins?: boolean;
  plugins?: PluginOptions;
  chat?: ChatLevel;
  colorsEnabled?: boolean;
  viewDistance?: ViewDistance;
  mainHand?: MainHands;
  difficulty?: number;
  chatLengthLimit?: number;
}

export type ChatLevel = "enabled" | "commandsOnly" | "disabled";
export type ViewDistance = "far" | "normal" | "short" | "tiny";
export type MainHands = "left" | "right";

export interface PluginOptions {
  [plugin: string]: boolean | Plugin;
}

export type Plugin = (bot: Bot, options: BotOptions) => void;

interface BotEvents {
  chat: (
      username: string,
      message: string,
      translate: string | null,
      jsonMsg: string,
      matches: Array<string> | null
    ) => void;
  whisper: (
      username: string,
      message: string,
      translate: string | null,
      jsonMsg: string,
      matches: Array<string> | null
    ) => void;
  actionBar: (jsonMsg: string) => void;
  error: (err: Error) => void;
  message: (jsonMsg: string, position: string) => void;
  login: () => void;
  spawn: () => void;
  respawn: () => void;
  game: () => void;
  title: (text: string) => void;
  rain: () => void;
  time: () => void;
  kicked: (reason: string, loggedIn: boolean) => void;
  end: () => void;
  spawnReset: () => void;
  death: () => void;
  health: () => void;
  entitySwingArm: (entity: Entity) => void;
  entityHurt: (entity: Entity) => void;
  entityWake: (entity: Entity) => void;
  entityEat: (entity: Entity) => void;
  entityCrouch: (entity: Entity) => void;
  entityUncrouch: (entity: Entity) => void;
  entityEquip: (entity: Entity) => void;
  entitySleep: (entity: Entity) => void;
  entitySpawn: (entity: Entity) => void;
  itemDrop: (entity: Entity) => void;
  playerCollect: (collector: Entity, collected: Entity) => void;
  entityGone: (entity: Entity) => void;
  entityMoved: (entity: Entity) => void;
  entityDetach: (entity: Entity, vehicle: Entity) => void;
  entityAttach: (entity: Entity, vehicle: Entity) => void;
  entityUpdate: (entity: Entity) => void;
  entityEffect: (entity: Entity, effect: Effect) => void;
  entityEffectEnd: (entity: Entity, effect: Effect) => void;
  playerJoined: (player: Player) => void;
  playerUpdated: (player: Player) => void;
  playerLeft: (entity: Player) => void;
  blockUpdate: (oldBlock: Block | null, newBlock: Block) => void;
  'blockUpdate:(x, y, z)': (oldBlock: Block | null, newBlock: Block) => void;
  chunkColumnLoad: (entity: Vec3) => void;
  chunkColumnUnload: (entity: Vec3) => void;
  soundEffectHeard: (
    soundName: string,
    position: Vec3,
    volume: number,
    pitch: number
  ) => void
  hardcodedSoundEffectHeard: (
    soundId: number,
    soundCategory: number,
    position: Vec3,
    volume: number,
    pitch: number
  ) => void
  noteHeard: (block: Block, instrument: Instrument, pitch: number) => void
  pistonMove: (block: Block, isPulling: number, direction: number) => void
  chestLidMove: (block: Block, isOpen: number) => void
  blockBreakProgressObserved: (block: Block, destroyStage: number) => void
  blockBreakProgressEnd: (block: Block) => void;
  diggingCompleted: (block: Block) => void;
  diggingAborted: (block: Block) => void;
  move: () => void;
  forcedMove: () => void;
  mount: () => void;
  dismount: (vehicle: Entity) => void;
  windowOpen: (vehicle: Window) => void;
  windowClose: (vehicle: Window) => void;
  sleep: () => void;
  wake: () => void;
  experience: () => void;
  physicTick: () => void;
  scoreboardCreated: (scoreboard: ScoreBoard) => void
  scoreboardDeleted: (scoreboard: ScoreBoard) => void
  scoreboardTitleChanged: (scoreboard: ScoreBoard) => void
  scoreUpdated: (scoreboard: ScoreBoard, item: number) => void
  scoreRemoved: (scoreboard: ScoreBoard, item: number) => void
  scoreboardPosition: (position: DisplaySlot, scoreboard: ScoreBoard) => void
  bossBarCreated: (bossBar: BossBar) => void;
  bossBarDeleted: (bossBar: BossBar) => void;
  bossBarUpdated: (bossBar: BossBar) => void;
}

export class Bot extends (EventEmitter as new () => TypedEmitter<BotEvents>) {
  username: string;
  protocolVersion: string;
  majorVersion: string;
  version: string;
  entity: Entity;
  entities: { [id: string]: Entity };
  spawnPoint: Vec3;
  game: GameState;
  player: Player;
  players: { [username: string]: Player };
  isRaining: boolean;
  chatPatterns: Array<ChatPattern>;
  settings: GameSettings;
  experience: Experience;
  health: number;
  food: number;
  foodSaturation: number;
  physics: PhysicsOptions;
  time: Time;
  quickBarSlot: number;
  inventory: Window;
  targetDigBlock: Block;
  isSleeping: boolean;
  scoreboards: { [name: string]: ScoreBoard };
  scoreboard: { [slot in DisplaySlot]: ScoreBoard };
  controlState: ControlStateStatus;
  void;
  creative: creativeMethods;
  world: any;
  _client: Client;

  constructor();

  connect(options: BotOptions): void;

  supportFeature(feature: string): boolean;

  end(): void;

  blockAt(point: Vec3): Block | null;

  blockInSight(maxSteps: number, vectorLength: number): Block | null;

  canSeeBlock(block: Block): boolean;

  findBlock(options: FindBlockOptions): Block;
  
  findBlocks(options: FindBlockOptions): Block[];

  canDigBlock(block: Block): boolean;

  recipesFor(
    itemType: number,
    metadata: number | null,
    minResultCount: number | null,
    craftingTable: Block | boolean | null
  ): Array<Recipe>;

  recipesAll(
    itemType: number,
    metadata: number | null,
    craftingTable: Block | boolean | null
  ): Array<Recipe>;

  quit(reason?: string): void;

  tabComplete(
    str: string,
    cb: (matches: Array<string>) => void,
    assumeCommand?: boolean,
    sendBlockInSight?: boolean
  ): void;

  chat(message: string): void;

  whisper(username: string, message: string): void;

  chatAddPattern(pattern: RegExp, chatType: string, description?: string): void;

  setSettings(options: Partial<GameSettings>): void;

  loadPlugin(plugin: Plugin): void;

  loadPlugins(plugins: Array<Plugin>): void;

  hasPlugin(plugin: Plugin): boolean;

  sleep(bedBlock: Block, cb?: (err?: Error) => void): void;

  isABed(bedBlock: Block): void;

  wake(cb?: (err?: Error) => void): void;

  setControlState(control: ControlState, state: boolean): void;

  clearControlStates(): void;

  lookAt(point: Vec3, force?: boolean, callback?: () => void): void;

  look(
    yaw: number,
    pitch: number,
    force?: boolean,
    callback?: () => void
  ): void;

  updateSign(block: Block, text: string): void;

  equip(
    item: Item,
    destination: EquipmentDestination | null,
    callback?: (error?: Error) => void
  ): void;

  unequip(
    destination: EquipmentDestination | null,
    callback?: () => void
  ): void;

  tossStack(item: Item, callback?: (error?: Error) => void): void;

  toss(
    itemType: number,
    metadata: number | null,
    count: number | null,
    callback?: (err?: Error) => void
  ): void;

  dig(block: Block, callback?: (err?: Error) => void): void;

  stopDigging(): void;

  digTime(block: Block): number;

  placeBlock(referenceBlock: Block, faceVector: Vec3, cb: () => void): void;

  activateBlock(block: Block, callback?: (err?: Error) => void): void;

  activateEntity(block: Entity, callback?: (err?: Error) => void): void;

  activateEntityAt(block: Entity, position: Vec3, callback?: (err?: Error) => void): void;

  consume(callback: (err?: Error) => void): void;

  fish(callback: (err?: Error) => void): void;

  activateItem(offhand?: boolean): void;

  deactivateItem(): void;

  useOn(targetEntity: Entity): void;

  attack(entity: Entity): void;

  swingArm(hand?: "left" | "right"): void;

  mount(entity: Entity): void;

  dismount(): void;

  moveVehicle(left: number, forward: number): void;

  setQuickBarSlot(slot: number): void;

  craft(
    recipe: Recipe,
    count: number | null,
    craftingTable: Block,
    callback?: () => void
  ): void;

  writeBook(
    slot: number,
    pages: Array<string>,
    callback?: (err?: Error) => void
  ): void;

  openChest(chest: Block | Entity): Chest;

  openFurnace(furnace: Block): Furnace;

  openDispenser(dispenser: Block): Dispenser;

  openEnchantmentTable(enchantmentTable: Block): EnchantmentTable;

  openVillager(
    villager: Entity,
    cb?: (err: null, villager: Villager) => void
  ): Villager;

  trade(
    villagerInstance: Villager,
    tradeIndex: string | number,
    times?: number,
    cb?: (err?: Error) => void
  ): void;

  setCommandBlock(pos: Vec3, command: string, trackOutput: boolean): void;

  clickWindow(
    slot: number,
    mouseButton: number,
    mode: number,
    cb?: (err?: Error) => void
  ): void;

  putSelectedItemRange(
    start: number,
    end: number,
    window: Window,
    slot: any,
    cb?: (err?: Error) => void
  ): void;

  putAway(slot: number, cb?: (err?: Error) => void): void;

  closeWindow(window: Window): void;

  transfer(options: TransferOptions, cb?: (err?: Error) => void): void;

  openBlock(block: Block, Class: new () => EventEmitter): void;

  openEntity(block: Entity, Class: new () => EventEmitter): void;

  moveSlotItem(
    sourceSlot: number,
    destSlot: number,
    cb?: (err?: Error) => void
  ): void;

  updateHeldItem();

  getEquipmentDestSlot(destination: string): number;

  waitForChunksToLoad(cb?: (err?: Error) => void): void;

  nearestEntity(filter?: (entity: Entity) => boolean): Entity | null;
}

export interface GameState {
  levelType: LevelType;
  gameMode: GameMode;
  hardcore: boolean;
  dimension: Dimension;
  difficulty: Difficulty;
  maxPlayers: number;
}

export type LevelType =
  | "default"
  | "flat"
  | "largeBiomes"
  | "amplified"
  | "customized"
  | "buffet"
  | "default_1_1";
export type GameMode = "survival" | "creative" | "adventure";
export type Dimension = "minecraft:nether" | "minecraft:overworld" | "minecraft:end";
export type Difficulty = "peaceful" | "easy" | "normal" | "hard";

export interface Player {
  uuid: string;
  username: string;
  displayName: ChatMessage;
  gamemode: number;
  ping: number;
  entity: Entity;
}

export class ChatMessage {
  json: object;
  text?: string;
  translate?: string;
  with?: Array<ChatMessage>;
  extra?: Array<ChatMessage>;
  bold: boolean;
  italic: boolean;
  underlined: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
  color: string;
  clickEvent: object;
  hoverEvent: object;

  constructor(message);

  parse(): void;

  length(): number;

  getText(idx: number, lang?: { [key: string]: string }): string;

  toString(lang?: { [key: string]: string }): string;

  valueOf(): string;

  toMotd(lang?: { [key: string]: string }): string;

  toAnsi(lang: { [key: string]: string }): string;
}

export interface ChatPattern {
  pattern: RegExp;
  type: string;
  description: string;
}

export interface SkinParts {
    showCape: boolean;
    showJacket: boolean;
    showLeftSleeve: boolean;
    showRightSleeve: boolean;
    showLeftPants: boolean;
    showRightPants: boolean;
    showHat: boolean;
}

export interface GameSettings {
  chat: ChatLevel;
  colorsEnabled: boolean;
  viewDistance: ViewDistance;
  difficulty: number;
  skinParts: SkinParts;
  mainHand: MainHands;
}

export interface Experience {
  level: number;
  points: number;
  progress: number;
}

export interface PhysicsOptions {
  maxGroundSpeed: number;
  terminalVelocity: number;
  walkingAcceleration: number;
  gravity: number;
  groundFriction: number;
  playerApothem: number;
  playerHeight: number;
  jumpSpeed: number;
  yawSpeed: number;
  sprintSpeed: number;
  maxGroundSpeedSoulSand: number;
  maxGroundSpeedWater: number;
}

export interface Time {
  time: number;
  timeOfDay: number;
  day: number;
  isDay: boolean;
  moonPhase: number;
  age: number;
}

export interface ControlStateStatus {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  sneak: boolean;
}

export type ControlState =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "jump"
  | "sprint"
  | "sneak";

export interface Effect {
  id: number;
  amplifier: number;
  duration: number;
}

export interface Instrument {
  id: number;
  name: "harp" | "doubleBass" | "snareDrum" | "sticks" | "bassDrum";
}

export interface FindBlockOptions {
  point?: Vec3;
  matching: number | Array<number> | ((block: Block) => boolean);
  maxDistance?: number;
  count?: number;
  useExtraInfo?: boolean;
}

export type EquipmentDestination = "hand" | "head" | "torso" | "legs" | "feet" | "off-hand";

export interface TransferOptions {
  window: Window;
  itemType: number;
  metadata: number | null;
  sourceStart: number;
  sourceEnd: number;
  destStart: number;
  destEnd: number;
}

export interface creativeMethods {
  setInventorySlot(
    slot: number,
    item: Item | null,
    callback?: (error?: Error) => void
  ): void;

  flyTo(destination: Vec3, cb?: () => void): void;

  startFlying(): void;

  stopFlying(): void;
}

export class Location {
  floored: Vec3;
  blockPoint: Vec3;
  chunkCorner: Vec3;
  blockIndex: number;
  biomeBlockIndex: number;
  chunkYIndex: number;

  constructor(absoluteVector: Vec3);
}

export class Painting {
  id: number;
  position: Vec3;
  name: string;
  direction: Vec3;

  constructor(id: number, position: Vec3, name: string, direction: Vec3);
}

interface StorageEvents {
  open: () => void;
  close: () => void;
  updateSlot: (oldItem: Item | null, newItem: Item) => void;
}

interface FurnaceEvents extends StorageEvents {
  update: () => void;
}

interface ConditionalStorageEvents extends StorageEvents {
  ready: () => void;
}

export class Chest extends (EventEmitter as new () => TypedEmitter<StorageEvents>) {
  window: object | /*prismarine-windows ChestWindow*/ null;

  constructor();

  close(): void;

  deposit(
    itemType: number,
    metadata: number | null,
    count: number | null,
    cb?: (err?: Error) => void
  ): void;

  withdraw(
    itemType: number,
    metadata: number | null,
    count: number | null,
    cb?: (err?: Error) => void
  ): void;

  count(itemType: number, metadata: number | null): number;

  items(): Array<Item>;
}

export class Furnace extends (EventEmitter as new () => TypedEmitter<FurnaceEvents>) {
  fuel: number;
  progress: number;

  constructor();

  close(): void;

  takeInput(cb: (err: Error | null, item: Item) => void): void;

  takeFuel(cb: (err: Error | null, item: Item) => void): void;

  takeOutput(cb: (err: Error | null, item: Item) => void): void;

  putInput(
    itemType: number,
    metadata: number | null,
    count: number,
    cb?: (err?: Error) => void
  ): void;

  putFuel(
    itemType: number,
    metadata: number | null,
    count: number,
    cb?: (err?: Error) => void
  ): void;

  inputItem(): Item;

  fuelItem(): Item;

  outputItem(): Item;
}

export class Dispenser extends (EventEmitter as new () => TypedEmitter<StorageEvents>) {
  constructor();

  close(): void;

  deposit(
    itemType: number,
    metadata: number | null,
    count: number | null
  ): void;

  withdraw(
    itemType: number,
    metadata: number | null,
    count: number | null
  ): void;

  count(itemType: number, metadata: number | null): number;

  items(): Array<Item>;
}

export class EnchantmentTable extends (EventEmitter as new () => TypedEmitter<ConditionalStorageEvents>) {
  enchantments: Array<Enchantment>;

  constructor();

  close(): void;

  targetItem(): Item;

  enchant(
    choice: string | number,
    cb?: (err: Error | null, item: Item) => void
  ): void;

  takeTargetItem(cb?: (err: Error | null, item: Item) => void): void;

  putTargetItem(item: Item, cb?: (err: Error | null, item: Item) => void): void;

  putLapis(item: Item, cb?: (err: Error | null, item: Item) => void): void;
}

export type Enchantment = {
  level: number;
};

export class Villager extends (EventEmitter as new () => TypedEmitter<ConditionalStorageEvents>) {
  trades: Array<VillagerTrade>;

  constructor();

  close(): void;
}

export type VillagerTrade = {
  firstInput: Item;
  output: Item;
  hasSecondItem: boolean;
  secondaryInput: Item | null;
  disabled: boolean;
  tooluses: number;
  maxTradeuses: number;
};

export class ScoreBoard {
  name: string;
  title: string;
  itemsMap: { [name: string]: ScoreBoardItem };
  items: Array<ScoreBoardItem>;

  constructor(packet: object);

  setTitle(title: string);

  add(name: string, value: number): ScoreBoardItem;

  remove(name: string): ScoreBoardItem;
}

export type ScoreBoardItem = {
  name: string;
  value: number;
};

export type DisplaySlot =
  | "list"
  | "sidebar"
  | "belowName"
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
  | 18;

export class BossBar {
  entityUUID: string;
  title: ChatMessage;
  health: number;
  dividers: number;
  color: "pink" | "blue" | "red" | "green" | "yellow" | "purple" | "white";
  shouldDarkenSky: boolean;
  isDragonBar: boolean;
  shouldCreateFog: boolean;

  constructor(
    uuid: string,
    title: string,
    health: number,
    dividers: number,
    color: number,
    flags: number
  );
}

export var supportedVersions: Array<string>;
export var testedVersions: Array<string>;

export function supportFeature(feature: string, version: string): boolean;
