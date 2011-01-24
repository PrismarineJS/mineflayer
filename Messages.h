#ifndef MESSAGES_H
#define MESSAGES_H

#include "Chunk.h"

#include <QString>
#include <QDataStream>

class Message {
public:
    enum MessageType {
        KeepAlive=0x00,
        Login=0x01,
        Handshake=0x02,
        Chat=0x03,
        TimeUpdate=0x04,
        EntityEquipment=0x05,
        SpawnPosition=0x06,
        UseEntity=0x07,
        UpdateHealth=0x08,
        Respawn=0x09,
        Player=0x0A,
        PlayerPosition=0x0B,
        PlayerLook=0x0C,
        PlayerPositionAndLook=0x0D,
        PlayerDigging=0x0E,
        PlayerBlockPlacement=0x0F,
        HoldingChange=0x10,
        Animation=0x12,
        EntityAction=0x13,
        NamedEntitySpawn=0x14,
        PickupSpawn=0x15,
        CollectItem=0x16,
        AddObjectOrVehicle=0x17,
        MobSpawn=0x18,
        EntityPainting=0x19,
        EntityVelocity=0x1C,
        DestroyEntity=0x1D,
        Entity=0x1E,
        EntityRelativeMove=0x1F,
        EntityLook=0x20,
        EntityLookAndRelativeMove=0x21,
        EntityTeleport=0x22,
        EntityStatus=0x26,
        AttachEntity=0x27,
        EntityMetadata=0x28,
        PreChunk=0x32,
        MapChunk=0x33,
        MultiBlockChange=0x34,
        BlockChange=0x35,
        PlayNoteBlock=0x36,
        Explosion=0x3C,
        OpenWindow=0x64,
        CloseWindow=0x65,
        WindowClick=0x66,
        SetSlot=0x67,
        WindowItems=0x68,
        UpdateProgressBar=0x69,
        Transaction=0x6A,
        UpdateSign=0x82,
        DisconnectOrKick=0xFF,

        DummyDisconnect=-1,
    };

    enum ItemType {
        NoItem=-1,
        Air=0x00,
        Stone=0x01,
        Grass=0x02,
        Dirt=0x03,
        Cobblestone=0x04,
        WoodenPlank=0x05,
        Sapling=0x06,
        Bedrock=0x07,
        Water=0x08,
        StationaryWater=0x09,
        Lava=0x0A,
        StationaryLava=0x0B,
        Sand=0x0C,
        Gravel=0x0D,
        GoldOre=0x0E,
        IronOre=0x0F,
        CoalOre=0x10,
        Wood=0x11,
        Leaves=0x12,
        Sponge=0x13,
        Glass=0x14,
        LapisLazuliOre=0x15,
        LapisLazuliBlock=0x16,
        Dispenser=0x17,
        Sandstone=0x18,
        NoteBlock=0x19,
        Wool=0x23,
        YellowFlower=0x25,
        RedRose=0x26,
        BrownMushroom=0x27,
        RedMushroom=0x28,
        GoldBlock=0x29,
        IronBlock=0x2A,
        DoubleStoneSlab=0x2B,
        StoneSlab=0x2C,
        Brick=0x2D,
        TNT=0x2E,
        Bookshelf=0x2F,
        MossStone=0x30,
        Obsidian=0x31,
        Torch=0x32,
        Fire=0x33,
        MonsterSpawner=0x34,
        WoodenStairs=0x35,
        Chest=0x36,
        RedstoneWire_placed=0x37,
        DiamondOre=0x38,
        DiamondBlock=0x39,
        Workbench=0x3A,
        Crops=0x3B,
        Farmland=0x3C,
        Furnace=0x3D,
        BurningFurnace=0x3E,
        SignPost_placed=0x3F,
        WoodenDoor_placed=0x40,
        Ladder=0x41,
        MinecartTracks=0x42,
        CobblestoneStairs=0x43,
        WallSign_placed=0x44,
        Lever=0x45,
        StonePressurePlate=0x46,
        IronDoor_placed=0x47,
        WoodenPressurePlate=0x48,
        RedstoneOre=0x49,
        GlowingRedstoneOre=0x4A,
        RedstoneTorchOff_placed=0x4B,
        RedstoneTorchOn=0x4C,
        StoneButton=0x4D,
        Snow=0x4E,
        Ice=0x4F,
        SnowBlock=0x50,
        Cactus=0x51,
        Clay=0x52,
        SugarCane_place=0x53,
        Jukebox=0x54,
        Fence=0x55,
        Pumpkin=0x56,
        Netherrack=0x57,
        SoulSand=0x58,
        Glowstone=0x59,
        Portal=0x5A,
        JackOLantern=0x5B,
        CakeBlock=0x5C,

        IronShovel=0x100,
        IronPickaxe=0x101,
        IronAxe=0x102,
        FlintAndSteel=0x103,
        Apple=0x104,
        Bow=0x105,
        Arrow=0x106,
        Coal=0x107,
        Diamond=0x108,
        IronIngot=0x109,
        GoldIngot=0x10A,
        IronSword=0x10B,
        WoodenSword=0x10C,
        WoodenShovel=0x10D,
        WoodenPickaxe=0x10E,
        WoodenAxe=0x10F,
        StoneSword=0x110,
        StoneShovel=0x111,
        StonePickaxe=0x112,
        StoneAxe=0x113,
        DiamondSword=0x114,
        DiamondShovel=0x115,
        DiamondPickaxe=0x116,
        DiamondAxe=0x117,
        Stick=0x118,
        Bowl=0x119,
        MushroomSoup=0x11A,
        GoldSword=0x11B,
        GoldShovel=0x11C,
        GoldPickaxe=0x11D,
        GoldAxe=0x11E,
        String=0x11F,
        Feather=0x120,
        Sulphur=0x121,
        WoodenHoe=0x122,
        StoneHoe=0x123,
        IronHoe=0x124,
        DiamondHoe=0x125,
        GoldHoe=0x126,
        Seeds=0x127,
        Wheat=0x128,
        Bread=0x129,
        LeatherHelmet=0x12A,
        LeatherChestplate=0x12B,
        LeatherLeggings=0x12C,
        LeatherBoots=0x12D,
        ChainmailHelmet=0x12E,
        ChainmailChestplate=0x12F,
        ChainmailLeggings=0x130,
        ChainmailBoots=0x131,
        IronHelmet=0x132,
        IronChestplate=0x133,
        IronLeggings=0x134,
        IronBoots=0x135,
        DiamondHelmet=0x136,
        DiamondChestplate=0x137,
        DiamondLeggings=0x138,
        DiamondBoots=0x139,
        GoldHelmet=0x13A,
        GoldChestplate=0x13B,
        GoldLeggings=0x13C,
        GoldBoots=0x13D,
        Flint=0x13E,
        RawPorkchop=0x13F,
        CookedPorkchop=0x140,
        Paintings=0x141,
        GoldenApple=0x142,
        Sign=0x143,
        WoodenDoor=0x144,
        Bucket=0x145,
        WaterBucket=0x146,
        LavaBucket=0x147,
        Minecart=0x148,
        Saddle=0x149,
        IronDoor=0x14A,
        Redstone=0x14B,
        Snowball=0x14C,
        Boat=0x14D,
        Leather=0x14E,
        Milk=0x14F,
        ClayBrick=0x150,
        ClayBalls=0x151,
        SugarCane=0x152,
        Paper=0x153,
        Book=0x154,
        Slimeball=0x155,
        StorageMinecart=0x156,
        PoweredMinecart=0x157,
        Egg=0x158,
        Compass=0x159,
        FishingRod=0x15A,
        Clock=0x15B,
        GlowstoneDust=0x15C,
        RawFish=0x15D,
        CookedFish=0x15E,
        InkSac=0x15F,
        Bone=0x160,
        Sugar=0x161,
        Cake=0x162,
        GoldMusicDisc=0x8D0,
        GreenMusicDisc=0x8D1,
    };

    struct Item {
        ItemType type;
        qint8 count;
        qint16 uses;
    };

    MessageType messageType;

protected:
    Message(MessageType messageType) : messageType(messageType) {}
};

class OutgoingRequest : public Message {
public:
    static const qint32 c_protocol_version;
    virtual ~OutgoingRequest() {}
    void writeToStream(QDataStream & stream);
protected:
    OutgoingRequest(MessageType messageType) : Message(messageType) {}
    virtual void writeMessageBody(QDataStream & stream) = 0;

    static void writeString(QDataStream & stream, QString string);
};

class KeepAliveRequest : public OutgoingRequest {
public:
    KeepAliveRequest() : OutgoingRequest(KeepAlive) {}
protected:
    virtual void writeMessageBody(QDataStream &) {}
};

class LoginRequest : public OutgoingRequest {
public:
    QString username;
    QString password;
    LoginRequest(QString username, QString password) : OutgoingRequest(Login),
        username(username), password(password) {}
protected:
    virtual void writeMessageBody(QDataStream &stream);
};

class HandshakeRequest : public OutgoingRequest {
public:
    QString username;
    HandshakeRequest(QString username) : OutgoingRequest(Handshake),
        username(username) {}
    virtual void writeMessageBody(QDataStream & stream);
};


class DummyDisconnectRequest : public OutgoingRequest {
public:
    DummyDisconnectRequest() : OutgoingRequest(DummyDisconnect) {}
    virtual void writeMessageBody(QDataStream &) {};
};

class IncomingResponse : public Message {
public:
    virtual ~IncomingResponse() {}
    // attempts to parse entire message from the beginning of the buffer.
    // returns length of message parsed, or -1 if message is not compelte.
    virtual int parse(QByteArray buffer) = 0;
protected:
    IncomingResponse(MessageType messageType) : Message(messageType) {}

    // parsing methods return -1 if they were unable to parse the data into the parameter.
    // if they're successful they return the index after the data.
    static int parseValue(QByteArray buffer, int index, bool &value);
    static int parseValue(QByteArray buffer, int index, qint8 &value);
    static int parseValue(QByteArray buffer, int index, qint16 &value);
    static int parseValue(QByteArray buffer, int index, qint32 &value);
    static int parseValue(QByteArray buffer, int index, qint64 &value);
    static int parseValue(QByteArray buffer, int index, float &value);
    static int parseValue(QByteArray buffer, int index, double &value);
    static int parseValue(QByteArray buffer, int index, QString &value);
    static int parseValue(QByteArray buffer, int index, Item &item);
};

class KeepAliveResponse : public IncomingResponse {
public:
    KeepAliveResponse() : IncomingResponse(KeepAlive) {}
    virtual int parse(QByteArray) { return 1; }
};

class LoginRespsonse : public IncomingResponse {
public:
    enum Dimension {
        Normal = 0,
        Nether = -1,
    };
    qint32 entity_id;
    QString _unknown_1;
    QString _unknown_2;
    qint64 map_seed;
    Dimension dimension;
    LoginRespsonse() : IncomingResponse(Login) {}
    virtual int parse(QByteArray buffer);
};

class HandshakeResponse : public IncomingResponse {
public:
    static const QString AuthenticationRequired;
    static const QString AuthenticationNotRequired;
    QString connectionHash;
    HandshakeResponse() : IncomingResponse(Handshake) {}
    virtual int parse(QByteArray buffer);
};

class TimeUpdateResponse : public IncomingResponse {
public:
    qint64 game_time_in_twentieths_of_a_second;
    TimeUpdateResponse() : IncomingResponse(TimeUpdate) {}
    virtual int parse(QByteArray buffer);
};

class SpawnPositionResponse : public IncomingResponse {
public:
    qint32 x;
    qint32 y;
    qint32 z;
    SpawnPositionResponse() : IncomingResponse(SpawnPosition) {}
    virtual int parse(QByteArray buffer);
};

class PlayerPositionAndLookResponse : public IncomingResponse {
public:
    double x;
    double y;
    double stance;
    double z;
    float yaw;
    float pitch;
    bool on_ground;
    PlayerPositionAndLookResponse() : IncomingResponse(PlayerPositionAndLook) {}
    virtual int parse(QByteArray buffer);
};

class PickupSpawnResponse : public IncomingResponse {
public:
    qint32 entity_id;
    ItemType item_type;
    qint8 count;
    qint16 damage;
    qint32 x;
    qint32 y;
    qint32 z;
    qint8 rotation;
    qint8 pitch;
    qint8 roll;
    PickupSpawnResponse() : IncomingResponse(PickupSpawn) {}
    virtual int parse(QByteArray buffer);
};

class MobSpawnResponse : public IncomingResponse {
public:
    enum MobType {
        Creeper=50,
        Skeleton=51,
        Spider=52,
        GiantZombie=53,
        Zombie=54,
        Slime=55,
        Ghast=56,
        ZombiePigman=57,
        Pig=90,
        Sheep=91,
        Cow=92,
        Hen=93,
    };
    qint32 entity_id;
    MobType mob_type;
    qint32 absolute_x;
    qint32 absolute_y;
    qint32 absolute_z;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    QByteArray metadata;
    MobSpawnResponse() : IncomingResponse(MobSpawn) {}
    virtual int parse(QByteArray buffer);
};

class EntityVelocityResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint16 velocity_x;
    qint16 velocity_y;
    qint16 velocity_z;
    EntityVelocityResponse() : IncomingResponse(EntityVelocity) {}
    virtual int parse(QByteArray buffer);
};

class DestroyEntityResponse : public IncomingResponse {
public:
    qint32 entity_id;
    DestroyEntityResponse() : IncomingResponse(DestroyEntity) {}
    virtual int parse(QByteArray buffer);
};

class EntityResponse : public IncomingResponse {
public:
    qint32 entity_id;
    EntityResponse() : IncomingResponse(Entity) {}
    virtual int parse(QByteArray buffer);
};

class EntityRelativeMoveResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint8 absolute_dx;
    qint8 absolute_dy;
    qint8 absolute_dz;
    EntityRelativeMoveResponse() : IncomingResponse(EntityRelativeMove) {}
    virtual int parse(QByteArray buffer);
};

class EntityLookResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    EntityLookResponse() : IncomingResponse(EntityLook) {}
    virtual int parse(QByteArray buffer);
};

class EntityLookAndRelativeMoveResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint8 absolute_dx;
    qint8 absolute_dy;
    qint8 absolute_dz;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    EntityLookAndRelativeMoveResponse() : IncomingResponse(EntityLookAndRelativeMove) {}
    virtual int parse(QByteArray buffer);
};

class EntityStatusResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint8 status;
    EntityStatusResponse() : IncomingResponse(EntityStatus) {}
    virtual int parse(QByteArray buffer);
};

class PreChunkResponse : public IncomingResponse {
public:
    enum Mode {
        Unload = 0,
        Load = 1,
    };
    qint32 x;
    qint32 z;
    Mode mode;
    PreChunkResponse() : IncomingResponse(PreChunk) {}
    virtual int parse(QByteArray buffer);
};

class MapChunkResponse : public IncomingResponse {
public:
    qint32 x;
    qint16 y;
    qint32 z;
    qint8 size_x_minus_one;
    qint8 size_y_minus_one;
    qint8 size_z_minus_one;
    QByteArray compressed_data;
    MapChunkResponse() : IncomingResponse(MapChunk) {}
    virtual int parse(QByteArray buffer);
};

class MultiBlockChangeResponse : public IncomingResponse {
public:
    qint32 chunk_x;
    qint32 chunk_z;
    QVector<Chunk::Coord> block_coords;
    QVector<ItemType> new_block_types;
    QVector<qint8> new_block_metadatas;
    MultiBlockChangeResponse() : IncomingResponse(MultiBlockChange) {}
    virtual int parse(QByteArray buffer);
};

class BlockChangeResposne : public IncomingResponse {
public:
    qint32 x;
    qint8 y;
    qint32 z;
    ItemType new_block_type;
    qint8 metadata;
    BlockChangeResposne() : IncomingResponse(BlockChange) {}
    virtual int parse(QByteArray buffer);
};

class SetSlotResponse : public IncomingResponse {
public:
    qint8 window_id;
    qint16 slot;
    Item item;
    SetSlotResponse() : IncomingResponse(SetSlot) {}
    virtual int parse(QByteArray buffer);
};

class WindowItemsResponse : public IncomingResponse {
public:
    qint8 window_id;
    QList<Item> items;
    WindowItemsResponse() : IncomingResponse(WindowItems) {}
    virtual int parse(QByteArray buffer);
};

class DisconnectOrKickResponse : public IncomingResponse {
public:
    QString reason;
    DisconnectOrKickResponse() : IncomingResponse(DisconnectOrKick) {}
    virtual int parse(QByteArray buffer);
};

#endif // MESSAGES_H
