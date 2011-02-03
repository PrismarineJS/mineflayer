#include "Messages.h"

const qint32 OutgoingRequest::c_protocol_version = 8;

void OutgoingRequest::writeToStream(QDataStream &stream)
{
    stream << (qint8)messageType;
    writeMessageBody(stream);
}

void OutgoingRequest::writeString(QDataStream & stream, QString string)
{
    QByteArray utf8_data = string.toUtf8();
    stream << (qint16)utf8_data.size();
    stream.device()->write(utf8_data);
}

void OutgoingRequest::writeItem(QDataStream &stream, Item item)
{
    stream << (qint16)item.type;
    if (item.type == NoItem)
        return;
    stream << item.count;
    stream << item.uses;
}

void LoginRequest::writeMessageBody(QDataStream &stream)
{
    stream << c_protocol_version;
    writeString(stream, username);
    writeString(stream, password);
    stream << (qint64)0; // map seed
    stream << (qint8)0; // dimension
}

void HandshakeRequest::writeMessageBody(QDataStream &stream)
{
    writeString(stream, username);
}

void ChatRequest::writeMessageBody(QDataStream &stream)
{
    writeString(stream, message);
}

void PlayerPositionAndLookRequest::writeMessageBody(QDataStream &stream)
{
    stream << x;
    stream << stance;
    stream << y;
    stream << z;
    stream << yaw;
    stream << pitch;
    stream << (qint8)on_ground;
}

void PlayerDiggingRequest::writeMessageBody(QDataStream &stream)
{
    stream << (qint8)digging_type;
    stream << x;
    stream << y;
    stream << z;
    stream << (qint8)block_face;
}

void PlayerBlockPlacementRequest::writeMessageBody(QDataStream &stream)
{
    stream << meters_x;
    stream << meters_y;
    stream << meters_z;
    stream << (qint8)block_face;
    writeItem(stream, item);
}

void OpenWindowRequest::writeMessageBody(QDataStream &stream)
{
    stream << window_id;
    stream << (qint8)inventory_type;
    writeString(stream, window_title);
    stream << number_of_slots;
}

void CloseWindowRequest::writeMessageBody(QDataStream &stream)
{
    stream << window_id;
}

void WindowClickRequest::writeMessageBody(QDataStream &stream)
{
    stream << window_id;
    stream << slot;
    stream << is_right_click;
    stream << action_id;
    writeItem(stream, item);
}

void DummyDisconnectRequest::writeMessageBody(QDataStream &)
{
}

int IncomingResponse::parseValue(QByteArray buffer, int index, bool &value)
{
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    value = tmp;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, qint8 &value)
{
    const int size = 1;
    if (!(index + size <= buffer.size()))
        return -1;
    value = buffer.at(index);
    index += size;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, qint16 &value)
{
    const int size = 2;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, qint32 &value)
{
    const int size = 4;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, qint64 &value)
{
    const int size = 8;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, float &value)
{
    const int size = 4;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, double &value)
{
    const int size = 8;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, QString &value)
{
    qint16 length;
    if ((index = parseValue(buffer, index, length)) == -1)
        return -1;
    if (!(index + length <= buffer.size()))
        return -1;
    value = QString::fromUtf8(buffer.mid(index, length).constData(), length);
    index += length;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, Item &item)
{
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    item.type = (ItemType)tmp;
    if (item.type != NoItem) {
        if ((index = parseValue(buffer, index, item.count)) == -1)
            return -1;
        if ((index = parseValue(buffer, index, item.uses)) == -1)
            return -1;
    }
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, QByteArray &value)
{
    // find the 0x7f
    int i = index;
    while (true) {
        if (i >= buffer.size())
            return -1; // didn't find it
        if (buffer.at(i) == 0x7f)
            break;
        i++;
    }
    i++; // include the terminator
    value = buffer.mid(index, i - index);
    index = i;
    return index;
}

int LoginResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, _unknown_1)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, _unknown_2)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, map_seed)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    dimension = (Dimension)tmp;
    return index;
}

const QString HandshakeResponse::AuthenticationRequired = "+";
const QString HandshakeResponse::AuthenticationNotRequired = "-";
int HandshakeResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, connectionHash)) == -1)
        return -1;
    return index;
}

int ChatResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, content)) == -1)
        return -1;
    return index;
}

int TimeUpdateResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, game_time_in_twentieths_of_a_second)) == -1)
        return -1;
    return index;
}

int EntityEquipmentResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, slot)) == -1)
        return -1;
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    item_type = (ItemType)tmp;
    if ((index = parseValue(buffer, index, unknown)) == -1)
        return -1;
    return index;
}

int SpawnPositionResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    return index;
}

int UseEntityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, user_entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, target_entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, is_left_click)) == -1)
        return -1;
    return index;
}

int UpdateHealthResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, health)) == -1)
        return -1;
    return index;
}

int RespawnResponse::parse(QByteArray)
{
    int index = 1;
    return index;
}

int PlayerPositionAndLookResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, stance)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, on_ground)) == -1)
        return -1;
    return index;
}

int PlayerDiggingResponse::parse(QByteArray buffer)
{
    int index = 1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    digging_type = (DiggingType)tmp;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    block_face = (BlockFaceDirection)tmp;
    return index;
}

int PlayerBlockPlacementResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    block_face = (BlockFaceDirection)tmp;
    if ((index = parseValue(buffer, index, item)) == -1)
        return -1;
    return index;
}

int HoldingChangeResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, slot)) == -1)
        return -1;
    return index;
}

int AnimationResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    animation_type = (AnimationType)tmp;
    return index;
}

int EntityActionResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    entity_action_type = (EntityActionType)tmp;
    return index;
}

int NamedEntitySpawnResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, player_name)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch)) == -1)
        return -1;
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    held_item = (ItemType)tmp;
    return index;
}

int PickupSpawnResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    item_type = (ItemType)tmp;
    if ((index = parseValue(buffer, index, count)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, damage)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, rotation)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, roll)) == -1)
        return -1;
    return index;
}

int CollectItemResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, collected_entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, collector_entity_id)) == -1)
        return -1;
    return index;
}

int AddObjectOrVehicleResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    object_or_vehicle_type = (ObjectOrVehicleType)tmp;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    return index;
}

int MobSpawnResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    mob_type = (MobType)tmp;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, metadata)) == -1)
        return -1;
    return index;
}

int EntityPaintingResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, name)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, type)) == -1)
        return -1;
    return index;
}

int EntityVelocityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, velocity_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, velocity_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, velocity_z)) == -1)
        return -1;
    return index;
}

int DestroyEntityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    return index;
}

int EntityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    return index;
}

int EntityRelativeMoveResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_dx)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_dy)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_dz)) == -1)
        return -1;
    return index;
}

int EntityLookResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    return index;
}

int EntityLookAndRelativeMoveResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_dx)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_dy)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_dz)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    return index;
}

int EntityTeleportResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    return index;
}

int EntityStatusResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, status)) == -1)
        return -1;
    return index;
}

int AttachEntityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, rider_entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, vehicle_entity_id)) == -1)
        return -1;
    return index;
}

int EntityMetadataResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, metadata)) == -1)
        return -1;
    return index;
}

int PreChunkResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    mode = (Mode)tmp;
    return index;
}

int MapChunkResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, size_x_minus_one)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, size_y_minus_one)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, size_z_minus_one)) == -1)
        return -1;
    qint32 compressed_data_size;
    if ((index = parseValue(buffer, index, compressed_data_size)) == -1)
        return -1;
    if (!(index + compressed_data_size <= buffer.size()))
        return -1; // this might be common. optimize?
    compressed_data = buffer.mid(index, compressed_data_size);
    index += compressed_data_size;
    return index;
}

int MultiBlockChangeResponse::parse(QByteArray buffer)
{
    // optimize size checking?
    int index = 1;
    if ((index = parseValue(buffer, index, chunk_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, chunk_z)) == -1)
        return -1;
    qint16 block_count;
    if ((index = parseValue(buffer, index, block_count)) == -1)
        return -1;
    block_coords.clear();
    block_coords.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 x_and_z;
        if ((index = parseValue(buffer, index, x_and_z)) == -1)
            return -1;
        qint8 y;
        if ((index = parseValue(buffer, index, y)) == -1)
            return -1;
        block_coords.replace(i, Int3D((x_and_z >> 4) & 0xf, y, x_and_z & 0xf));
    }
    new_block_types.clear();
    new_block_types.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 block_type;
        if ((index = parseValue(buffer, index, block_type)) == -1)
            return -1;
        new_block_types.replace(i, (ItemType)block_type);
    }
    new_block_metadatas.clear();
    new_block_metadatas.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 metadata;
        if ((index = parseValue(buffer, index, metadata)) == -1)
            return -1;
        new_block_metadatas.replace(i, metadata);
    }
    return index;
}

int BlockChangeResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    new_block_type = (ItemType)tmp;
    if ((index = parseValue(buffer, index, metadata)) == -1)
        return -1;
    return index;
}

int PlayNoteBlockResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    instrument_type = (InstrumentType)tmp;
    if ((index = parseValue(buffer, index, pitch)) == -1)
        return -1;
    return index;
}

int ExplosionResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown)) == -1)
        return -1;
    qint32 record_count;
    if ((index = parseValue(buffer, index, record_count)) == -1)
        return -1;
    offsets_to_affected_blocks.clear();
    offsets_to_affected_blocks.resize(record_count);
    for (int i = 0; i < record_count; i++) {
        qint8 local_x;
        if ((index = parseValue(buffer, index, local_x)) == -1)
            return -1;
        qint8 local_y;
        if ((index = parseValue(buffer, index, local_y)) == -1)
            return -1;
        qint8 local_z;
        if ((index = parseValue(buffer, index, local_z)) == -1)
            return -1;
        offsets_to_affected_blocks.replace(i, Int3D(local_x, local_y, local_z));
    }
    return index;
}

int OpenWindowResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    inventory_type = (InventoryType)tmp;
    if ((index = parseValue(buffer, index, window_title)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, number_of_slots)) == -1)
        return -1;
    return index;
}

int SetSlotResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, slot)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, item)) == -1)
        return -1;
    return index;
}

int UpdateProgressBarResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, progress_bar_type)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, value)) == -1)
        return -1;
    return index;
}

int TransactionResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, action_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, is_accepted)) == -1)
        return -1;
    return index;
}

int WindowItemsResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
        return -1;
    qint16 count;
    if ((index = parseValue(buffer, index, count)) == -1)
        return -1;
    items.clear();
    items.resize(count);
    for (int i = 0; i < count; i++) {
        Item item;
        if ((index = parseValue(buffer, index, item)) == -1)
            return -1;
        items.replace(i, item);
    }
    return index;
}

int UpdateSignResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, absolute_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, line_1)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, line_2)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, line_3)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, line_4)) == -1)
        return -1;
    return index;
}

int DisconnectOrKickResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, reason)) == -1)
        return -1;
    return index;
}
