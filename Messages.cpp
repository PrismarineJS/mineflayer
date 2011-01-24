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

void PlayerPositionAndLookRequest::writeMessageBody(QDataStream &stream)
{
    stream << x;
    stream << stance;
    stream << y;
    stream << z;
    stream << yaw;
    stream << pitch;
    stream << on_ground;

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

int LoginRespsonse::parse(QByteArray buffer)
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
        block_coords.replace(i, Chunk::Coord((x_and_z >> 4) & 0xf, y, x_and_z & 0xf));
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

int BlockChangeResposne::parse(QByteArray buffer)
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

int WindowItemsResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
        return -1;
    qint16 count;
    if ((index = parseValue(buffer, index, count)) == -1)
        return -1;
    items.clear();
    for (int i = 0; i < count; i++) {
        Item item;
        if ((index = parseValue(buffer, index, item)) == -1)
            return -1;
        items.append(item);
    }
    return index;
}

int DisconnectOrKickResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, reason)) == -1)
        return -1;
    return index;
}
