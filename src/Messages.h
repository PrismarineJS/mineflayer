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
        UpdateSign=(qint8)0x82,
        DisconnectOrKick=(qint8)0xFF,
    };


    struct Item {
        Chunk::ItemType type;
        qint8 count;
        qint16 uses;
    };

    enum DiggingType {
        StartDigging=0,
        DiggingInProgress=1,
        AbortDigging=2,
        BlockBroken=3,
        DropItem=4,
    };

    enum BlockFaceDirection {
        NoDirection=-1,
        NegativeY=0,
        PositiveY=1,
        NegativeZ=2,
        PositiveZ=3,
        NegativeX=4,
        PositiveX=5,
    };

    enum InventoryType {
        BasicInventory=0,
        WorkbenchInventory=1,
        FurnaceInventory=2,
        DispenserInventory=3,
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

    static void writeValue(QDataStream & stream, bool value);
    static void writeValue(QDataStream & stream, qint8 value);
    static void writeValue(QDataStream & stream, qint16 value);
    static void writeValue(QDataStream & stream, qint32 value);
    static void writeValue(QDataStream & stream, qint64 value);
    static void writeValue(QDataStream & stream, float value);
    static void writeValue(QDataStream & stream, double value);
    static void writeValue(QDataStream & stream, QString value);
    static void writeValue(QDataStream & stream, Item value);
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

class ChatRequest : public OutgoingRequest {
public:
    QString message;
    ChatRequest(QString message) : OutgoingRequest(Chat),
        message(message) {}
    virtual void writeMessageBody(QDataStream &stream);
};

class PlayerPositionAndLookRequest : public OutgoingRequest {
public:
    double x;
    double stance;
    double y;
    double z;
    float yaw;
    float pitch;
    bool on_ground;
    PlayerPositionAndLookRequest() : OutgoingRequest(PlayerPositionAndLook) {}
protected:
    virtual void writeMessageBody(QDataStream &stream);
};

class PlayerDiggingRequest : public OutgoingRequest {
public:
    DiggingType digging_type;
    qint32 x;
    qint8 y;
    qint32 z;
    BlockFaceDirection block_face;
    PlayerDiggingRequest(DiggingType digging_type, qint32 x, qint8 y, qint32 z, BlockFaceDirection block_face) : OutgoingRequest(PlayerDigging),
        digging_type(digging_type), x(x), y(y), z(z), block_face(block_face) {}
protected:
    virtual void writeMessageBody(QDataStream &stream);
};

class PlayerBlockPlacementRequest : public OutgoingRequest {
public:
    qint32 meters_x;
    qint8 meters_y;
    qint32 meters_z;
    BlockFaceDirection block_face;
    Item item;
    PlayerBlockPlacementRequest(qint32 meters_x, qint8 meters_y, qint32 meters_z, BlockFaceDirection block_face, Item item) : OutgoingRequest(PlayerBlockPlacement),
        meters_x(meters_x), meters_y(meters_y), meters_z(meters_z), block_face(block_face), item(item) {}
    virtual void writeMessageBody(QDataStream &stream);
};

class OpenWindowRequest : public OutgoingRequest {
public:
    qint8 window_id;
    InventoryType inventory_type;
    QString window_title;
    qint8 number_of_slots;
    OpenWindowRequest(qint8 window_id, InventoryType inventory_type, QString window_title, qint8 number_of_slots) : OutgoingRequest(OpenWindow),
            window_id(window_id), inventory_type(inventory_type), window_title(window_title), number_of_slots(number_of_slots) {}
    virtual void writeMessageBody(QDataStream &stream);
};

class CloseWindowRequest : public OutgoingRequest {
public:
    qint8 window_id;
    CloseWindowRequest(qint8 window_id) : OutgoingRequest(CloseWindow),
        window_id(window_id) {}
    virtual void writeMessageBody(QDataStream &stream);
};

class WindowClickRequest : public OutgoingRequest {
public:
    qint8 window_id;
    qint16 slot;
    bool is_right_click;
    qint16 action_id;
    Item item;
    WindowClickRequest(qint8 window_id, qint16 slot, bool is_right_click, qint16 action_id, Item item) : OutgoingRequest(WindowClick),
        window_id(window_id), slot(slot), is_right_click(is_right_click), action_id(action_id), item(item) {}
    virtual void writeMessageBody(QDataStream &stream);
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
    static int parseValue(QByteArray buffer, int index, QByteArray &value);
};

class KeepAliveResponse : public IncomingResponse {
public:
    KeepAliveResponse() : IncomingResponse(KeepAlive) {}
    virtual int parse(QByteArray) { return 1; }
};

class LoginResponse : public IncomingResponse {
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
    LoginResponse() : IncomingResponse(Login) {}
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

class ChatResponse : public IncomingResponse {
public:
    QString content;
    ChatResponse() : IncomingResponse(Chat) {}
    virtual int parse(QByteArray buffer);
};

class TimeUpdateResponse : public IncomingResponse {
public:
    qint64 game_time_in_twentieths_of_a_second;
    TimeUpdateResponse() : IncomingResponse(TimeUpdate) {}
    virtual int parse(QByteArray buffer);
};

class EntityEquipmentResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint16 slot;
    Chunk::ItemType item_type;
    qint16 unknown;
    EntityEquipmentResponse() : IncomingResponse(EntityEquipment) {}
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

class UseEntityResponse : public IncomingResponse {
public:
    qint32 user_entity_id;
    qint32 target_entity_id;
    qint8 is_left_click;
    UseEntityResponse() : IncomingResponse(UseEntity) {}
    virtual int parse(QByteArray buffer);
};

class UpdateHealthResponse : public IncomingResponse {
public:
    qint16 health;
    UpdateHealthResponse() : IncomingResponse(UpdateHealth) {}
    virtual int parse(QByteArray buffer);
};

class RespawnResponse : public IncomingResponse {
public:
    RespawnResponse() : IncomingResponse(Respawn) {}
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

class PlayerDiggingResponse : public IncomingResponse {
public:
    DiggingType digging_type;
    qint32 absolute_x;
    qint8 absolute_y;
    qint32 absolute_z;
    BlockFaceDirection block_face;
    PlayerDiggingResponse() : IncomingResponse(PlayerDigging) {}
    virtual int parse(QByteArray buffer);
};

class PlayerBlockPlacementResponse : public IncomingResponse {
public:
    qint32 absolute_x;
    qint8 absolute_y;
    qint32 absolute_z;
    BlockFaceDirection block_face;
    Item item;
    PlayerBlockPlacementResponse() : IncomingResponse(PlayerBlockPlacement) {}
    virtual int parse(QByteArray buffer);
};

class HoldingChangeResponse : public IncomingResponse {
public:
    qint16 slot;
    HoldingChangeResponse() : IncomingResponse(HoldingChange) {}
    virtual int parse(QByteArray buffer);
};

class AnimationResponse : public IncomingResponse {
public:
    enum AnimationType {
        NoAnimation=0,
        SwingArm=1,
        Damage=2,
        Crouch=104,
        Uncrouch=105,
    };
    qint32 entity_id;
    AnimationType animation_type;
    AnimationResponse() : IncomingResponse(Animation) {}
    virtual int parse(QByteArray buffer);
};

class EntityActionResponse : public IncomingResponse {
public:
    enum EntityActionType {
        Crouch=1,
        Uncrouch=2,
    };
    qint32 entity_id;
    EntityActionType entity_action_type;
    EntityActionResponse() : IncomingResponse(EntityAction) {}
    virtual int parse(QByteArray buffer);
};

class NamedEntitySpawnResponse : public IncomingResponse {
public:
    qint32 entity_id;
    QString player_name;
    qint32 x;
    qint32 y;
    qint32 z;
    qint8 yaw;
    qint8 pitch;
    Chunk::ItemType held_item;
    NamedEntitySpawnResponse() : IncomingResponse(NamedEntitySpawn) {}
    virtual int parse(QByteArray buffer);
};

class PickupSpawnResponse : public IncomingResponse {
public:
    qint32 entity_id;
    Chunk::ItemType item_type;
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

class CollectItemResponse : public IncomingResponse {
public:
    qint32 collected_entity_id;
    qint32 collector_entity_id;
    CollectItemResponse() : IncomingResponse(CollectItem) {}
    virtual int parse(QByteArray buffer);
};

class AddObjectOrVehicleResponse : public IncomingResponse {
public:
    enum ObjectOrVehicleType {
        Boat=1,
        Minecart=10,
        StorageCart=11,
        PoweredCart=12,
        ActivatedTnt=50,
        Arrow=60,
        ThrownSnowball=61,
        ThrownEgg=62,
        FallingSand=70,
        FallingGravel=71,
        FishingFloat=90,
    };
    qint32 entity_id;
    ObjectOrVehicleType object_or_vehicle_type;
    qint32 absolute_x;
    qint32 absolute_y;
    qint32 absolute_z;
    AddObjectOrVehicleResponse() : IncomingResponse(AddObjectOrVehicle) {}
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

class EntityPaintingResponse : public IncomingResponse {
public:
    qint32 entity_id;
    QString name;
    qint32 x;
    qint32 y;
    qint32 z;
    qint32 type;
    EntityPaintingResponse() : IncomingResponse(EntityPainting) {}
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

class EntityTeleportResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint32 absolute_x;
    qint32 absolute_y;
    qint32 absolute_z;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    EntityTeleportResponse() : IncomingResponse(EntityTeleport) {}
    virtual int parse(QByteArray buffer);
};

class EntityStatusResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint8 status;
    EntityStatusResponse() : IncomingResponse(EntityStatus) {}
    virtual int parse(QByteArray buffer);
};

class AttachEntityResponse : public IncomingResponse {
public:
    qint32 rider_entity_id;
    qint32 vehicle_entity_id;
    AttachEntityResponse() : IncomingResponse(AttachEntity) {}
    virtual int parse(QByteArray buffer);
};

class EntityMetadataResponse : public IncomingResponse {
public:
    qint32 entity_id;
    QByteArray metadata;
    EntityMetadataResponse() : IncomingResponse(EntityMetadata) {}
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
    QVector<Int3D> block_coords;
    QVector<Chunk::ItemType> new_block_types;
    QVector<qint8> new_block_metadatas;
    MultiBlockChangeResponse() : IncomingResponse(MultiBlockChange) {}
    virtual int parse(QByteArray buffer);
};

class BlockChangeResponse : public IncomingResponse {
public:
    qint32 x;
    qint8 y;
    qint32 z;
    Chunk::ItemType new_block_type;
    qint8 metadata;
    BlockChangeResponse() : IncomingResponse(BlockChange) {}
    virtual int parse(QByteArray buffer);
};

class PlayNoteBlockResponse : public IncomingResponse {
public:
    enum InstrumentType {
        DoubleBass=1,
        SnareDrum=2,
        Sticks=3,
        BassDrum=4,
        Harp=5,
    };
    qint32 absolute_x;
    qint16 absolute_y;
    qint32 absolute_z;
    InstrumentType instrument_type;
    qint8 pitch;
    PlayNoteBlockResponse() : IncomingResponse(PlayNoteBlock) {}
    virtual int parse(QByteArray buffer);
};

class ExplosionResponse : public IncomingResponse {
public:
    double x;
    double y;
    double z;
    float unknown;
    QVector<Int3D> offsets_to_affected_blocks;
    ExplosionResponse() : IncomingResponse(Explosion) {}
    virtual int parse(QByteArray buffer);
};

class OpenWindowResponse : public IncomingResponse {
public:
    qint8 window_id;
    InventoryType inventory_type;
    QString window_title;
    qint8 number_of_slots;
    OpenWindowResponse() : IncomingResponse(OpenWindow) {}
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

class UpdateProgressBarResponse : public IncomingResponse {
public:
    qint8 window_id;
    qint16 progress_bar_type;
    qint16 value;
    UpdateProgressBarResponse() : IncomingResponse(UpdateProgressBar) {}
    virtual int parse(QByteArray buffer);
};

class TransactionResponse : public IncomingResponse {
public:
    qint8 window_id;
    qint16 action_id;
    bool is_accepted;
    TransactionResponse() : IncomingResponse(Transaction) {}
    virtual int parse(QByteArray buffer);
};

class WindowItemsResponse : public IncomingResponse {
public:
    qint8 window_id;
    QVector<Item> items;
    WindowItemsResponse() : IncomingResponse(WindowItems) {}
    virtual int parse(QByteArray buffer);
};

class UpdateSignResponse : public IncomingResponse {
public:
    qint32 absolute_x;
    qint16 absolute_y;
    qint32 absolute_z;
    QString line_1;
    QString line_2;
    QString line_3;
    QString line_4;
    UpdateSignResponse() : IncomingResponse(UpdateSign) {}
    virtual int parse(QByteArray buffer);
};

class DisconnectOrKickResponse : public IncomingResponse {
public:
    QString reason;
    DisconnectOrKickResponse() : IncomingResponse(DisconnectOrKick) {}
    virtual int parse(QByteArray buffer);
};

#endif // MESSAGES_H
