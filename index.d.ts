/// <reference types="minecraft-protocol" />
/// <reference types="node" />
/// <reference types="vec3" />
/// <reference types="prismarine-item" />
/// <reference types="prismarine-windows" />
/// <reference types="prismarine-recipe" />
/// <reference types="prismarine-block" />
/// <reference types="prismarine-entity" />

import {EventEmitter} from 'events';
import {Client, ClientOptions} from 'minecraft-protocol';
import {Vec3} from 'vec3';
import {Item} from 'prismarine-item';
import {Window} from 'prismarine-windows';
import {Recipe} from 'prismarine-recipe';
import {Block} from 'prismarine-block';
import {Entity} from 'prismarine-entity';

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
        _client: Client;

        constructor();

        connect(options: BotOptions): void;

        supportFeature(feature: string): boolean;

        end(): void;

        blockAt(point: Vec3): Block | null;

        blockInSight(maxSteps: number, vectorLength: number): Block | null;

        canSeeBlock(block: Block): boolean;

        findBlock(options: FindBlockOptions): Block;

        canDigBlock(block: Block): boolean;

        recipesFor(itemType: number, metadata: number | null, minResultCount: number | null, craftingTable: Block | null): Array<Recipe>;

        recipesAll(itemType: number, metadata: number | null, craftingTable: Block | null): Array<Recipe>;

        quit(reason?: string): void;

        tabComplete(str: string, cb: (matches: Array<string>) => void, assumeCommand?: boolean, sendBlockInSight?: boolean): void;

        chat(message: string): void;

        whisper(username: string, message: string): void;

        chatAddPattern(pattern: RegExp, chatType: string, description?: string): void;

        setSettings(options: Partial<GameSettings>): void;

        loadPlugin(plugin: Plugin): void;

        loadPlugins(plugins: Array<Plugin>): void;

        sleep(bedBlock: Block, cb?: (err?: Error) => void): void;

        isABd(bedBlock: Block): void;

        wake(cb?: (err?: Error) => void): void;

        setControlState(control: ControlState, state: boolean): void;

        clearControlStates(): void;

        lookAt(point: Vec3, force?: boolean, callback?: () => void): void;

        look(yaw: number, pitch: number, force?: boolean, callback?: () => void): void;

        updateSign(block: Block, text: string): void;

        equip(item: Item, destination: EquipmentDestination | null, callback?: (error?: Error) => void): void;

        unequip(destination: EquipmentDestination | null, callback?: () => void): void;

        tossStack(item: Item, callback?: (error?: Error) => void): void;

        toss(itemType: number, metadata: number | null, count: number | null, callback?: (err?: Error) => void): void;

        dig(block: Block, callback?: (err?: Error) => void): void;

        stopDigging(): void;

        digTime(block: Block): number;

        placeBlock(referenceBlock: Block, faceVector: Vec3, cb: () => void): void;

        activateBlock(block: Block, callback?: (err?: Error) => void): void;

        activateEntity(block: Entity, callback?: (err?: Error) => void): void;

        consume(callback: (err?: Error) => void): void;

        fish(callback: (err?: Error) => void): void;

        activateItem(): void;

        deactivateItem(): void;

        useOn(targetEntity: Entity): void;

        attack(entity: Entity): void;

        swingArm(hand?: 'left' | 'right'): void;

        mount(entity: Entity): void;

        dismount(): void;

        moveVehicle(left: number, forward: number): void;

        setQuickBarSlot(slot: number): void;

        craft(recipe: Recipe, count: number | null, craftingTable: Block, callback?: () => void): void;

        writeBook(slot: number, pages: Array<String>, callback?: (err?: Error) => void): void;

        openChest(chest: Block | Entity): Chest;

        openFurnace(furnace: Block): Furnace;

        openDispenser(dispenser: Block): Dispenser;

        openEnchantmentTable(enchantmentTable: Block): EnchantmentTable;

        openVillager(villager: Entity, cb?: (err: null, villager: Villager) => void): Villager;

        trade(villagerInstance: Villager, tradeIndex: string | number, times?: number, cb?: (err?: Error) => void): void;

        setCommandBlock(pos: Vec3, command: string, trackOutput: boolean): void;

        clickWindow(slot: number, mouseButton: number, mode: number, cb?: (err?: Error) => void): void;

        putSelectedItemRange(start: number, end: number, window: Window, slot: any, cb?: (err?: Error) => void): void;

        putAway(slot: number, cb?: (err?: Error) => void): void;

        closeWindow(window: Window): void;

        transfer(options: TransferOptions, cb?: (err?: Error) => void): void;

        openBlock(block: Block, Class: new() => EventEmitter): void;

        openEntity(block: Entity, Class: new() => EventEmitter): void;

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

        on(event: 'entitySwingArm', listener: (entity: Entity) => void): this;

        on(event: 'entityHurt', listener: (entity: Entity) => void): this;

        on(event: 'entityWake', listener: (entity: Entity) => void): this;

        on(event: 'entityEat', listener: (entity: Entity) => void): this;

        on(event: 'entityCrouch', listener: (entity: Entity) => void): this;

        on(event: 'entityUncrouch', listener: (entity: Entity) => void): this;

        on(event: 'entityEquipmentChange', listener: (entity: Entity) => void): this;

        on(event: 'entitySleep', listener: (entity: Entity) => void): this;

        on(event: 'entitySpawn', listener: (entity: Entity) => void): this;

        on(event: 'playerCollect', listener: (collector: Entity, collected: Entity) => void): this;

        on(event: 'entityGone', listener: (entity: Entity) => void): this;

        on(event: 'entityMoved', listener: (entity: Entity) => void): this;

        on(event: 'entityDetach', listener: (entity: Entity, vehicle: Entity) => void): this;

        on(event: 'entityAttach', listener: (entity: Entity, vehicle: Entity) => void): this;

        on(event: 'entityUpdate', listener: (entity: Entity) => void): this;

        on(event: 'entityEffect', listener: (entity: Entity, effect: Effect) => void): this;

        on(event: 'entityEffectEnd', listener: (entity: Entity, effect: Effect) => void): this;

        on(event: 'playerJoined', listener: (player: Player) => void): this;

        on(event: 'playerLeft', listener: (entity: Player) => void): this;

        on(event: 'blockUpdate', listener: (oldBlock: Block | null, newBlock: Block) => void): this;

        on(event: 'blockUpdate:(x, y, z)', listener: (oldBlock: Block | null, newBlock: Block) => void): this;

        on(event: 'chunkColumnLoad', listener: (entity: Vec3) => void): this;

        on(event: 'chunkColumnUnload', listener: (entity: Vec3) => void): this;

        on(event: 'soundEffectHeard', listener: (soundName: string, position: Vec3, volume: number, pitch: number) => void): this;

        on(event: 'hardcodedSoundEffectHeard', listener: (soundId: number, soundCategory: number, position: Vec3, volume: number, pitch: number) => void): this;

        on(event: 'noteHeard', listener: (block: Block, instrument: Instrument, pitch: number) => void): this;

        on(event: 'pistonMove', listener: (block: Block, isPulling: number, direction: number) => void): this;

        on(event: 'chestLidMove', listener: (block: Block, isOpen: number) => void): this;

        on(event: 'blockBreakProgressObserved', listener: (block: Block, destroyStage: number) => void): this;

        on(event: 'blockBreakProgressEnd', listener: (block: Block) => void): this;

        on(event: 'diggingCompleted', listener: (block: Block) => void): this;

        on(event: 'diggingAborted', listener: (block: Block) => void): this;

        on(event: 'move', listener: () => void): this;

        on(event: 'forcedMove', listener: () => void): this;

        on(event: 'mount', listener: () => void): this;

        on(event: 'dismount', listener: (vehicle: Entity) => void): this;

        on(event: 'windowOpen', listener: (vehicle: Window) => void): this;

        on(event: 'windowClose', listener: (vehicle: Window) => void): this;

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
        point: Vec3;
        matching: (block: Block) => boolean | number | Array<number>;
        maxDistance?: number;
    }

    export type EquipmentDestination = 'hand' | 'head' | 'torso' | 'legs' | 'feet';

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
        setInventorySlot(slot: number, item: Item | null, callback?: (error?: Error) => void): void;

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

        constructor(id: number, position: Vec3, name: String, direction: Vec3);
    }

    export class Chest extends EventEmitter {
        window: object /*prismarine-windows ChestWindow*/ | null;

        constructor();

        close(): void;

        deposit(itemType: number, metadata: number | null, count: number | null): void;

        withdraw(itemType: number, metadata: number | null, count: number | null): void;

        count(itemType: number, metadata: number | null): number;

        items(): Array<Item>;

        on(event: 'open', listener: () => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'updateSlot', listener: (oldItem: Item | null, newItem: Item) => void): this;
    }

    export class Furnace extends EventEmitter {
        fuel: number;
        progress: number;

        constructor();

        close(): void;

        takeInput(cb: (err: Error | null, item: Item) => void): void;

        takeFuel(cb: (err: Error | null, item: Item) => void): void;

        takeOutput(cb: (err: Error | null, item: Item) => void): void;

        putInput(itemType: number, metadata: number | null, cb?: (err?: Error) => void): void;

        putFuel(itemType: number, metadata: number | null, cb?: (err?: Error) => void): void;

        inputItem(): Item;

        fuelItem(): Item;

        outputItem(): Item;

        on(event: 'open', listener: () => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'update', listener: () => void): this;
        on(event: 'updateSlot', listener: (oldItem: Item | null, newItem: Item) => void): this;
    }

    export class Dispenser extends EventEmitter {
        onstructor();

        close(): void;

        deposit(itemType: number, metadata: number | null, count: number | null): void;

        withdraw(itemType: number, metadata: number | null, count: number | null): void;

        count(itemType: number, metadata: number | null): number;

        items(): Array<Item>;

        on(event: 'open', listener: () => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'updateSlot', listener: (oldItem: Item | null, newItem: Item) => void): this;
    }

    export class EnchantmentTable extends EventEmitter {
        enchantments: Array<Enchantment>;

        constructor();

        close(): void;

        targetItem(): Item;

        enchant(choice: string | number, cb?: (err: Error | null, item: Item) => void): void;

        takeTargetItem(cb?: (err: Error | null, item: Item) => void): void;

        putTargetItem(item: Item, cb?: (err: Error | null, item: Item) => void): void;

        putLapis(item: Item, cb?: (err: Error | null, item: Item) => void): void;

        on(event: 'open', listener: () => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'ready', listener: () => void): this;
        on(event: 'updateSlot', listener: (oldItem: Item | null, newItem: Item) => void): this;
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
        on(event: 'updateSlot', listener: (oldItem: Item | null, newItem: Item) => void): this;
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
