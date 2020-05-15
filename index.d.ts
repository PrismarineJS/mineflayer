/// <reference types="minecraft-protocol" />
/// <reference types="node" />

import {EventEmitter} from 'events';
import {Client, ClientOptions} from 'minecraft-protocol';

declare module mineflayer {

	export function createBot(options: BotOptions): Bot;

	export interface BotOptions extends ClientOptions {
		logErrors?: boolean;
		loadInternalPlugins?: boolean;
		plugins?: PluginOptions;
		chat?: ChatLevel;
		colorsEnabled?: boolean;
		viewDistance?: ViewDistance;
		difficulty?: number;
		showCape?: boolean;
		chatLengthLimit?: number;
	}

	export type ChatLevel = 'enabled' | 'commandsOnly' | 'disabled';
	export type ViewDistance = 'far' | 'normal' | 'short' | 'tiny';

	export interface PluginOptions {
		[plugin: string]: boolean | Plugin;
	}

	export type Plugin = (bot: Bot, options: BotOptions) => void;

	export class Bot extends EventEmitter {
		username: string;
		protocolVersion: string;
		majorVersion: string;
		version: string;
		entity: object; // prismarine-entity Entity
		entities: object; // map of prismarine-entity Entities
		spawnPoint: object; // vec3 Vec3
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
		inventory: object; // prismarine-windows Window
		targetDigBlock: object; // prismarine-block Block
		isSleeping: boolean;
		scoreboards: { [name: string]: ScoreBoard };
		scoreboard: { [slot in DisplaySlot]: ScoreBoard };
		controlState: ControlStateStatus;
		void;
		creative: creativeMethods;
		_client: Client;

		constructor();

		connect(options: BotOptions): void;

		supportFeature(feature: string): boolean;

		end(): void;

		blockAt(point: object /*vec3 Vec3*/): object /*prismarine-block Block*/ | null;

		blockInSight(maxSteps: number, vectorLength: number): object /*prismarine-block Block*/ | null;

		canSeeBlock(block: object /*prismarine-block Block*/): boolean;

		findBlock(options: FindBlockOptions): object /*prismarine-block Block*/;

		canDigBlock(block: object /*prismarine-block Block*/): boolean;

		recipesFor(itemType: number, metadata: number | null, minResultCount: number | null, craftingTable: object /*prismarine-block Block*/ | null): Array<object /*prismarine-recipe Recipe*/>;

		recipesAll(itemType: number, metadata: number | null, craftingTable: object /*prismarine-block Block*/ | null): Array<object /*prismarine-recipe Recipe*/>;

		quit(reason?: string): void;

		tabComplete(str: string, cb: (matches: Array<string>) => void, assumeCommand?: boolean, sendBlockInSight?: boolean): void;

		chat(message: string): void;

		whisper(username: string, message: string): void;

		chatAddPattern(pattern: RegExp, chatType: string, description?: string): void;

		setSettings(options: Partial<GameSettings>): void;

		loadPlugin(plugin: Plugin): void;

		loadPlugins(plugins: Array<Plugin>): void;

		sleep(bedBlock: object /*prismarine-block Block*/, cb?: (err?: Error) => void): void;

		isABd(bedBlock: object /*prismarine-block Block*/): void;

		wake(cb?: (err?: Error) => void): void;

		setControlState(control: ControlState, state: boolean): void;

		clearControlStates(): void;

		lookAt(point: object /*vec3 Vec3*/, force?: boolean, callback?: () => void): void;

		look(yaw: number, pitch: number, force?: boolean, callback?: () => void): void;

		updateSign(block: object /*prismarine-block Block*/, text: string): void;

		equip(item: object /*prismarine-item Item*/, destination: EquipmentDestination | null, callback?: (error?: Error) => void): void;

		unequip(destination: EquipmentDestination | null, callback?: () => void): void;

		tossStack(item: object /*prismarine-item Item*/, callback?: (error?: Error) => void): void;

		toss(itemType: number, metadata: number | null, count: number | null, callback?: (err?: Error) => void): void;

		dig(block: object /*prismarine-block Block*/, callback?: (err?: Error) => void): void;

		stopDigging(): void;

		digTime(block: object /*prismarine-block Block*/): number;

		placeBlock(referenceBlock: object /*prismarine-block Block*/, faceVector: object /*vec3 Vec3*/, cb: () => void): void;

		activateBlock(block: object /*prismarine-block Block*/, callback?: (err?: Error) => void): void;

		activateEntity(block: object /*prismarine-entity Entity*/, callback?: (err?: Error) => void): void;

		consume(callback: (err?: Error) => void): void;

		fish(callback: (err?: Error) => void): void;

		activateItem(): void;

		deactivateItem(): void;

		useOn(targetEntity: object /*prismarine-entity Entity*/): void;

		attack(entity: object /*prismarine-entity Entity*/): void;

		swingArm(hand?: 'left' | 'right'): void;

		mount(entity: object /*prismarine-entity Entity*/): void;

		dismount(): void;

		moveVehicle(left: number, forward: number): void;

		setQuickBarSlot(slot: number): void;

		craft(recipe: object /*prismarine-recipe Recipe*/, count: number | null, craftingTable: object /*prismarine-block Block*/, callback?: () => void): void;

		writeBook(slot: number, pages: Array<String>, callback?: (err?: Error) => void): void;

		openChest(chest: object /*prismarine-block Block*/ | object /*prismarine-entity Entity*/): Chest;

		openFurnace(furnace: object /*prismarine-block Block*/): Furnace;

		openDispenser(dispenser: object /*prismarine-block Block*/): Dispenser;

		openEnchantmentTable(enchantmentTable: object /*prismarine-block Block*/): EnchantmentTable;

		openVillager(villager: object /*prismarine-entity Entity*/, cb?: (err: null, villager: Villager) => void): Villager;

		trade(villagerInstance: Villager, tradeIndex: string | number, times?: number, cb?: (err?: Error) => void): void;

		setCommandBlock(pos: object /*vec3 Vec3*/, command: string, trackOutput: boolean): void;

		clickWindow(slot: number, mouseButton: number, mode: number, cb?: (err?: Error) => void): void;

		putSelectedItemRange(start: number, end: number, window: object /*prismarine-windows Window*/, slot: any, cb?: (err?: Error) => void): void;

		putAway(slot: number, cb?: (err?: Error) => void): void;

		closeWindow(window: object /*prismarine-windows Window*/): void;

		transfer(options: TransferOptions, cb?: (err?: Error) => void): void;

		openBlock(block: object /*prismarine-block Block*/, Class: new() => EventEmitter): void;

		openEntity(block: object /*prismarine-entity Entity*/, Class: new() => EventEmitter): void;

		moveSlotItem(sourceSlot: number, destSlot: number, cb?: (err?: Error) => void): void;

		updateHeldItem();

		on(event: 'chat', listener: (username: string, message: string, translate: string | null, jsonMsg: string, matches: Array<String> | null) => void): this;

		on(event: 'whisper', listener: (username: string, message: string, translate: string | null, jsonMsg: string, matches: Array<String> | null) => void): this;

		on(event: 'actionBar', listener: (jsonMsg: string) => void): this;

		on(event: 'message', listener: (jsonMsg: string) => void): this;

		on(event: 'login', listener: () => void): this;

		on(event: 'spawn', listener: () => void): this;

		on(event: 'respawn', listener: () => void): this;

		on(event: 'game', listener: () => void): this;

		on(event: 'title', listener: (text: string) => void): this;

		on(event: 'rain', listener: () => void): this;

		on(event: 'time', listener: () => void): this;

		on(event: 'kicked', listener: (reason: string, loggedIn: boolean) => void): this;

		on(event: 'end', listener: () => void): this;

		on(event: 'spawnReset', listener: () => void): this;

		on(event: 'death', listener: () => void): this;

		on(event: 'health', listener: () => void): this;

		on(event: 'entitySwingArm', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityHurt', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityWake', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityEat', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityCrouch', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityUncrouch', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityEquipmentChange', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entitySleep', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entitySpawn', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'playerCollect', listener: (collector: object /*prismarine-entity Entity*/, collected: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityGone', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityMoved', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityDetach', listener: (entity: object /*prismarine-entity Entity*/, vehicle: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityAttach', listener: (entity: object /*prismarine-entity Entity*/, vehicle: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityUpdate', listener: (entity: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'entityEffect', listener: (entity: object /*prismarine-entity Entity*/, effect: Effect) => void): this;

		on(event: 'entityEffectEnd', listener: (entity: object /*prismarine-entity Entity*/, effect: Effect) => void): this;

		on(event: 'playerJoined', listener: (player: Player) => void): this;

		on(event: 'playerLeft', listener: (entity: Player) => void): this;

		on(event: 'blockUpdate', listener: (oldBlock: object /*prismarine-block Block*/ | null, newBlock: object /*prismarine-block Block*/) => void): this;

		on(event: 'blockUpdate:(x, y, z)', listener: (oldBlock: object /*prismarine-block Block*/ | null, newBlock: object /*prismarine-block Block*/) => void): this;

		on(event: 'chunkColumnLoad', listener: (entity: object /*vec3 Vec3*/) => void): this;

		on(event: 'chunkColumnUnload', listener: (entity: object /*vec3 Vec3*/) => void): this;

		on(event: 'soundEffectHeard', listener: (soundName: string, position: object /*vec3 Vec3*/, volume: number, pitch: number) => void): this;

		on(event: 'hardcodedSoundEffectHeard', listener: (soundId: number, soundCategory: number, position: object /*vec3 Vec3*/, volume: number, pitch: number) => void): this;

		on(event: 'noteHeard', listener: (block: object /*prismarine-block Block*/, instrument: Instrument, pitch: number) => void): this;

		on(event: 'pistonMove', listener: (block: object /*prismarine-block Block*/, isPulling: number, direction: number) => void): this;

		on(event: 'chestLidMove', listener: (block: object /*prismarine-block Block*/, isOpen: number) => void): this;

		on(event: 'blockBreakProgressObserved', listener: (block: object /*prismarine-block Block*/, destroyStage: number) => void): this;

		on(event: 'blockBreakProgressEnd', listener: (block: object /*prismarine-block Block*/) => void): this;

		on(event: 'diggingCompleted', listener: (block: object /*prismarine-block Block*/) => void): this;

		on(event: 'diggingAborted', listener: (block: object /*prismarine-block Block*/) => void): this;

		on(event: 'move', listener: () => void): this;

		on(event: 'forcedMove', listener: () => void): this;

		on(event: 'mount', listener: () => void): this;

		on(event: 'dismount', listener: (vehicle: object /*prismarine-entity Entity*/) => void): this;

		on(event: 'windowOpen', listener: (vehicle: object /*prismarine-windows Window*/) => void): this;

		on(event: 'windowClose', listener: (vehicle: object /*prismarine-windows Window*/) => void): this;

		on(event: 'sleep', listener: () => void): this;

		on(event: 'wake', listener: () => void): this;

		on(event: 'experience', listener: () => void): this;

		on(event: 'scoreboardCreated', listener: (scoreboard: ScoreBoard) => void): this;

		on(event: 'scoreboardDeleted', listener: (scoreboard: ScoreBoard) => void): this;

		on(event: 'scoreboardTitleChanged', listener: (scoreboard: ScoreBoard) => void): this;

		on(event: 'scoreUpdated', listener: (scoreboard: ScoreBoard, item: number) => void): this;

		on(event: 'scoreRemoved', listener: (scoreboard: ScoreBoard, item: number) => void): this;

		on(event: 'scoreboardPosition', listener: (position: DisplaySlot, scoreboard: ScoreBoard) => void): this;

		on(event: 'bossBarCreated', listener: (bossBar: BossBar) => void): this;

		on(event: 'bossBarDeleted', listener: (bossBar: BossBar) => void): this;

		on(event: 'bossBarUpdated', listener: (bossBar: BossBar) => void): this;
	}

	export interface GameState {
		levelType: LevelType;
		gameMode: GameMode;
		hardcore: boolean;
		dimension: Dimension;
		difficulty: Difficulty;
		maxPlayers: number;
	}

	export type LevelType = 'default' | 'flat' | 'largeBiomes' | 'amplified' | 'customized' | 'buffet' | 'default_1_1';
	export type GameMode = 'survival' | 'creative' | 'adventure';
	export type Dimension = 'nether' | 'overworld' | 'end';
	export type Difficulty = 'peaceful' | 'easy' | 'normal' | 'hard';

	export interface Player {
		username: string;
		displayName: ChatMessage;
		gamemode: number;
		ping: number;
		entity: object; //prismarine-entity
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

	export interface GameSettings {
		chat: ChatLevel;
		colorsEnabled: boolean;
		viewDistance: ViewDistance;
		difficulty: number;
		showCape: boolean;
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
		day: number;
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

	export type ControlState = 'forward' | 'back' | 'left' | 'right' | 'jump' | 'sprint' | 'sneak';

	export interface Effect {
		id: number;
		amplifier: number;
		duration: number;
	}

	export interface Instrument {
		id: number;
		name: 'harp' | 'doubleBass' | 'snareDrum' | 'sticks' | 'bassDrum';
	}

	export interface FindBlockOptions {
		point: object; // vec3 Vec3
		matching: (block: object /*prismarine-block Block*/) => boolean | number | Array<number>;
		maxDistance?: number;
	}

	export type EquipmentDestination = 'hand' | 'head' | 'torso' | 'legs' | 'feet';

	export interface TransferOptions {
		window: object /*prismarine-windows Window*/
		;
		itemType: number;
		metadata: number | null;
		sourceStart: number;
		sourceEnd: number;
		destStart: number;
		destEnd: number;
	}

	export interface creativeMethods {
		setInventorySlot(slot: number, item: object /*prismarine-item Item*/ | null, callback?: (error?: Error) => void): void;

		flyTo(destination: object /*vec3 Vec3*/, cb?: () => void): void;

		startFlying(): void;

		stopFlying(): void;
	}

	export class Location {
		floored: object /*vec3 Vec3*/;
		blockPoint: object /*vec3 Vec3*/;
		chunkCorner: object /*vec3 Vec3*/;
		blockIndex: number;
		biomeBlockIndex: number;
		chunkYIndex: number;

		constructor(absoluteVector: object /*vec3 Vec3*/);
	}

	export class Painting {
		id: number;
		position: object /*vec3 Vec3*/;
		name: string;
		direction: object /*vec3 Vec3*/;

		constructor(id: number, position: object /*vec3 Vec3*/, name: String, direction: object /*vec3 Vec3*/);
	}

	export class Chest extends EventEmitter {
		window: object /*prismarine-windows ChestWindow*/ | null;

		constructor();

		close(): void;

		deposit(itemType: number, metadata: number | null, count: number | null): void;

		withdraw(itemType: number, metadata: number | null, count: number | null): void;

		count(itemType: number, metadata: number | null): number;

		items(): Array<object /*prismarine-item Item*/>;

		on(event: 'open', listener: () => void): this;
		on(event: 'close', listener: () => void): this;
		on(event: 'updateSlot', listener: (oldItem: object /*prismarine-item Item*/ | null, newItem: object /*prismarine-item Item*/) => void): this;
	}

	export class Furnace extends EventEmitter {
		fuel: number;
		progress: number;

		constructor();

		close(): void;

		takeInput(cb: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		takeFuel(cb: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		takeOutput(cb: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		putInput(itemType: number, metadata: number | null, cb?: (err?: Error) => void): void;

		putFuel(itemType: number, metadata: number | null, cb?: (err?: Error) => void): void;

		inputItem(): object /*prismarine-item Item*/;

		fuelItem(): object /*prismarine-item Item*/;

		outputItem(): object /*prismarine-item Item*/;

		on(event: 'open', listener: () => void): this;
		on(event: 'close', listener: () => void): this;
		on(event: 'update', listener: () => void): this;
		on(event: 'updateSlot', listener: (oldItem: object /*prismarine-item Item*/ | null, newItem: object /*prismarine-item Item*/) => void): this;
	}

	export class Dispenser extends EventEmitter {
		onstructor();

		close(): void;

		deposit(itemType: number, metadata: number | null, count: number | null): void;

		withdraw(itemType: number, metadata: number | null, count: number | null): void;

		count(itemType: number, metadata: number | null): number;

		items(): Array<object /*prismarine-item Item*/>;

		on(event: 'open', listener: () => void): this;
		on(event: 'close', listener: () => void): this;
		on(event: 'updateSlot', listener: (oldItem: object /*prismarine-item Item*/ | null, newItem: object /*prismarine-item Item*/) => void): this;
	}

	export class EnchantmentTable extends EventEmitter {
		enchantments: Array<Enchantment>;

		constructor();

		close(): void;

		targetItem(): object /*prismarine-item Item*/;

		enchant(choice: string | number, cb?: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		takeTargetItem(cb?: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		putTargetItem(item: object /*prismarine-item Item*/, cb?: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		putLapis(item: object /*prismarine-item Item*/, cb?: (err: Error | null, item: object /*prismarine-item Item*/) => void): void;

		on(event: 'open', listener: () => void): this;
		on(event: 'close', listener: () => void): this;
		on(event: 'ready', listener: () => void): this;
		on(event: 'updateSlot', listener: (oldItem: object /*prismarine-item Item*/ | null, newItem: object /*prismarine-item Item*/) => void): this;
	}

	export type Enchantment = {
		level: number;
	};

	export class Villager extends EventEmitter {
		trades: Array<VillagerTrade>;

		constructor();

		close(): void;

		on(event: 'open', listener: () => void): this;
		on(event: 'close', listener: () => void): this;
		on(event: 'ready', listener: () => void): this;
		on(event: 'updateSlot', listener: (oldItem: object /*prismarine-item Item*/ | null, newItem: object /*prismarine-item Item*/) => void): this;
	}

	export type VillagerTrade = {
		firstInput: object /*prismarine-item Item*/;
		output: object /*prismarine-item Item*/;
		hasSecondItem: boolean;
		secondaryInput: object /*prismarine-item Item*/ | null;
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
	}

	export type DisplaySlot =
		'list'
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
		| 18;

	export class BossBar {
		entityUUID: string;
		title: ChatMessage;
		health: number;
		dividers: number;
		color: 'pink' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'white';
		shouldDarkenSky: boolean;
		isDragonBar: boolean;
		shouldCreateFog: boolean;

		constructor(uuid: string, title: string, health: number, dividers: number, color: number, flags: number);
	}

	export var supportedVersions: Array<string>;
	export var testedVersions: Array<string>;

	export function supportFeature(feature: string, version: string): boolean;
}
