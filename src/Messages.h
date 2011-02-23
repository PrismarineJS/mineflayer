#ifndef MESSAGES_H
#define MESSAGES_H

#include "Block.h"
#include "Item.h"
#include "Vector3D.h"

#include <QString>
#include <QDataStream>

class Message {
public:
    enum MessageType {
        DummyDisconnect=-2,

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
        BedAnimation=0x11,
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
        Unknown1B=0x1B,
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

    enum DiggingStatus {
        StartDigging=0,
        ContinueDigging=1,
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

    enum WindowType {
        // ours
        Inventory=-1,

        // notch's
        Chest=0,
        CraftingTable=1,
        Furnace=2,
        Dispenser=3,
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

class UseEntityRequest : public OutgoingRequest {
public:
    qint32 self_entity_id;
    qint32 target_entity_id;
    bool left_click;
    UseEntityRequest(qint32 self_entity_id, qint32 target_entity_id, bool left_click) : OutgoingRequest(UseEntity),
        self_entity_id(self_entity_id), target_entity_id(target_entity_id), left_click(left_click) {}
    virtual void writeMessageBody(QDataStream &stream);
};

class RespawnRequest : public OutgoingRequest {
public:
    RespawnRequest() : OutgoingRequest(Respawn) {}
    virtual void writeMessageBody(QDataStream &) {}
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
    DiggingStatus status;
    qint32 x;
    qint8 y;
    qint32 z;
    BlockFaceDirection block_face;
    PlayerDiggingRequest(DiggingStatus status, qint32 x, qint8 y, qint32 z, BlockFaceDirection block_face) : OutgoingRequest(PlayerDigging),
        status(status), x(x), y(y), z(z), block_face(block_face) {}
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

class DummyDisconnectMessage : public OutgoingRequest {
public:
    DummyDisconnectMessage() : OutgoingRequest(DummyDisconnect) {}
    virtual void writeMessageBody(QDataStream &) {}
};


class HoldingChangeRequest : public OutgoingRequest {
public:
    qint16 slot;
    HoldingChangeRequest(qint16 slot) : OutgoingRequest(HoldingChange), slot(slot) {}
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
    static const QString PasswordAuthenticationRequired;
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
    Item::ItemType item_type;
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

class BedAnimationResponse : public IncomingResponse {
public:
    qint32 unknown_1;
    qint8 unknown_2;
    qint32 unknown_3;
    qint8 unknown_4;
    qint32 unknown_5;
    BedAnimationResponse() : IncomingResponse(BedAnimation) {}
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
    DiggingStatus status;
    qint32 meters_x;
    qint8 meters_y;
    qint32 meters_z;
    BlockFaceDirection block_face;
    PlayerDiggingResponse() : IncomingResponse(PlayerDigging) {}
    virtual int parse(QByteArray buffer);
};

class PlayerBlockPlacementResponse : public IncomingResponse {
public:
    qint32 meters_x;
    qint8 meters_y;
    qint32 meters_z;
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
    qint32 pixels_x;
    qint32 pixels_y;
    qint32 pixels_z;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    Item::ItemType held_item;
    NamedEntitySpawnResponse() : IncomingResponse(NamedEntitySpawn) {}
    virtual int parse(QByteArray buffer);
};

class PickupSpawnResponse : public IncomingResponse {
public:
    qint32 entity_id;
    Item item;
    qint32 pixels_x;
    qint32 pixels_y;
    qint32 pixels_z;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    qint8 roll_out_of_256;
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
    qint32 pixels_x;
    qint32 pixels_y;
    qint32 pixels_z;
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
        Chicken=93,
    };
    qint32 entity_id;
    MobType mob_type;
    qint32 pixels_x;
    qint32 pixels_y;
    qint32 pixels_z;
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

class Unknown1BResponse : public IncomingResponse {
public:
    float unknown_1;
    float unknown_2;
    float unknown_3;
    float unknown_4;
    bool unknown_5;
    bool unknown_6;
    Unknown1BResponse() : IncomingResponse(Unknown1B) {}
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
    qint8 pixels_dx;
    qint8 pixels_dy;
    qint8 pixels_dz;
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
    qint8 pixels_dx;
    qint8 pixels_dy;
    qint8 pixels_dz;
    qint8 yaw_out_of_256;
    qint8 pitch_out_of_256;
    EntityLookAndRelativeMoveResponse() : IncomingResponse(EntityLookAndRelativeMove) {}
    virtual int parse(QByteArray buffer);
};

class EntityTeleportResponse : public IncomingResponse {
public:
    qint32 entity_id;
    qint32 pixels_x;
    qint32 pixels_y;
    qint32 pixels_z;
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
    QVector<Item::ItemType> new_block_types;
    QVector<qint8> new_block_metadatas;
    MultiBlockChangeResponse() : IncomingResponse(MultiBlockChange) {}
    virtual int parse(QByteArray buffer);
};

class BlockChangeResponse : public IncomingResponse {
public:
    qint32 x;
    qint8 y;
    qint32 z;
    Item::ItemType new_block_type;
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
    qint32 meters_x;
    qint16 meters_y;
    qint32 meters_z;
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
    WindowType inventory_type;
    QString window_title;
    qint8 number_of_slots;
    OpenWindowResponse() : IncomingResponse(OpenWindow) {}
    virtual int parse(QByteArray buffer);
};

class CloseWindowResponse : public IncomingResponse {
public:
    qint8 window_id;
    CloseWindowResponse() : IncomingResponse(CloseWindow) {}
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
    qint32 meters_x;
    qint16 meters_y;
    qint32 meters_z;
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
