#include "Messages.h"

const qint32 OutgoingMessage::c_protocol_version = 8;

void OutgoingMessage::writeToStream(QDataStream &stream)
{
    stream << (qint8)messageType;
    writeMessageBody(stream);
}

void OutgoingMessage::writeString(QDataStream & stream, QString string)
{
    QByteArray utf8_data = string.toUtf8();
    stream << (qint16)utf8_data.size();
    stream.device()->write(utf8_data);
}

void LoginRequestMessage::writeMessageBody(QDataStream &stream)
{
    stream << c_protocol_version;
    writeString(stream, username);
    writeString(stream, password);
    stream << (qint64)0; // map seed
    stream << (qint8)0; // dimension
}

void HandshakeRequestMessage::writeMessageBody(QDataStream &stream)
{
    writeString(stream, username);
}

int IncomingMessage::parseBool(QByteArray buffer, int index, bool &value)
{
    qint8 tmp;
    if ((index = parseInt8(buffer, index, tmp)) == -1)
        return -1;
    value = tmp;
    return index;
}
int IncomingMessage::parseInt8(QByteArray buffer, int index, qint8 &value)
{
    const int size = 1;
    if (!(index + size <= buffer.size()))
        return -1;
    value = buffer.at(index);
    index += size;
    return index;
}
int IncomingMessage::parseInt16(QByteArray buffer, int index, qint16 &value)
{
    const int size = 2;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingMessage::parseInt32(QByteArray buffer, int index, qint32 &value)
{
    const int size = 4;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingMessage::parseInt64(QByteArray buffer, int index, qint64 &value)
{
    const int size = 8;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingMessage::parseFloat(QByteArray buffer, int index, float &value)
{
    const int size = 4;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingMessage::parseDouble(QByteArray buffer, int index, double &value)
{
    const int size = 8;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
    index += size;
    return index;
}
int IncomingMessage::parseString(QByteArray buffer, int index, QString &value)
{
    qint16 length;
    if ((index = parseInt16(buffer, index, length)) == -1)
        return -1;
    if (!(index + length <= buffer.size()))
        return -1;
    value = QString::fromUtf8(buffer.mid(index, length).constData(), length);
    index += length;
    return index;
}
int IncomingMessage::parseItem(QByteArray buffer, int index, Item &item)
{
    qint16 tmp;
    if ((index = parseInt16(buffer, index, tmp)) == -1)
        return -1;
    item.type = (ItemType)tmp;
    if (item.type != NoItem) {
        if ((index = parseInt8(buffer, index, item.count)) == -1)
            return -1;
        if ((index = parseInt16(buffer, index, item.uses)) == -1)
            return -1;
    }
    return index;
}

int LoginRespsonseMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseString(buffer, index, _unknown_1)) == -1)
        return -1;
    if ((index = parseString(buffer, index, _unknown_2)) == -1)
        return -1;
    if ((index = parseInt64(buffer, index, map_seed)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseInt8(buffer, index, tmp)) == -1)
        return -1;
    dimension = (Dimension)tmp;
    return index;
}

const QString HandshakeResponseMessage::AuthenticationRequired = "+";
const QString HandshakeResponseMessage::AuthenticationNotRequired = "-";
int HandshakeResponseMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseString(buffer, index, connectionHash)) == -1)
        return -1;
    return index;
}

int TimeUpdateMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt64(buffer, index, game_time_in_twentieths_of_a_second)) == -1)
        return -1;
    return index;
}

int SpawnPositionMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, x)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, y)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, z)) == -1)
        return -1;
    return index;
}

int PlayerPositionAndLookResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseDouble(buffer, index, x)) == -1)
        return -1;
    if ((index = parseDouble(buffer, index, y)) == -1)
        return -1;
    if ((index = parseDouble(buffer, index, stance)) == -1)
        return -1;
    if ((index = parseDouble(buffer, index, z)) == -1)
        return -1;
    if ((index = parseFloat(buffer, index, yaw)) == -1)
        return -1;
    if ((index = parseFloat(buffer, index, pitch)) == -1)
        return -1;
    if ((index = parseBool(buffer, index, on_ground)) == -1)
        return -1;
    return index;
}

int PickupSpawnResponseMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    qint16 tmp;
    if ((index = parseInt16(buffer, index, tmp)) == -1)
        return -1;
    item_type = (ItemType)tmp;
    if ((index = parseInt8(buffer, index, count)) == -1)
        return -1;
    if ((index = parseInt16(buffer, index, damage)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, x)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, y)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, z)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, rotation)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, pitch)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, roll)) == -1)
        return -1;
    return index;
}

int MobSpawnMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseInt8(buffer, index, tmp)) == -1)
        return -1;
    mob_type = (MobType)tmp;
    if ((index = parseInt32(buffer, index, absolute_x)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, absolute_y)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, absolute_z)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, pitch_out_of_256)) == -1)
        return -1;
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
    metadata = buffer.mid(index, i - index);
    index = i;
    return index;
}

int EntityVelocityMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseInt16(buffer, index, velocity_x)) == -1)
        return -1;
    if ((index = parseInt16(buffer, index, velocity_y)) == -1)
        return -1;
    if ((index = parseInt16(buffer, index, velocity_z)) == -1)
        return -1;
    return index;
}

int DestroyEntityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    return index;
}

int EntityResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    return index;
}

int EntityRelativeMoveResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, absolute_dx)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, absolute_dy)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, absolute_dz)) == -1)
        return -1;
    return index;
}

int EntityLookResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    return index;
}

int EntityLookAndRelativeMoveResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, absolute_dx)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, absolute_dy)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, absolute_dz)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    return index;
}

int EntityStatusResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, status)) == -1)
        return -1;
    return index;
}

int PreChunkMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, x)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseInt8(buffer, index, tmp)) == -1)
        return -1;
    mode = (Mode)tmp;
    return index;
}

int MapChunkMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, x)) == -1)
        return -1;
    if ((index = parseInt16(buffer, index, y)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, z)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, size_x_minus_one)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, size_y_minus_one)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, size_z_minus_one)) == -1)
        return -1;
    qint32 compressed_data_size;
    if ((index = parseInt32(buffer, index, compressed_data_size)) == -1)
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
    if ((index = parseInt32(buffer, index, chunk_x)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, chunk_z)) == -1)
        return -1;
    qint16 block_count;
    if ((index = parseInt16(buffer, index, block_count)) == -1)
        return -1;
    block_coords.clear();
    block_coords.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 x_and_z;
        if ((index = parseInt8(buffer, index, x_and_z)) == -1)
            return -1;
        qint8 y;
        if ((index = parseInt8(buffer, index, y)) == -1)
            return -1;
        block_coords.replace(i, Chunk::Coord((x_and_z >> 4) & 0xf, y, x_and_z & 0xf));
    }
    new_block_types.clear();
    new_block_types.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 block_type;
        if ((index = parseInt8(buffer, index, block_type)) == -1)
            return -1;
        new_block_types.replace(i, (ItemType)block_type);
    }
    new_block_metadatas.clear();
    new_block_metadatas.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 metadata;
        if ((index = parseInt8(buffer, index, metadata)) == -1)
            return -1;
        new_block_metadatas.replace(i, metadata);
    }
    return index;
}

int BlockChangeResposne::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt32(buffer, index, x)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, y)) == -1)
        return -1;
    if ((index = parseInt32(buffer, index, z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseInt8(buffer, index, tmp)) == -1)
        return -1;
    new_block_type = (ItemType)tmp;
    if ((index = parseInt8(buffer, index, metadata)) == -1)
        return -1;
    return index;
}

int SetSlotResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt8(buffer, index, window_id)) == -1)
        return -1;
    if ((index = parseInt16(buffer, index, slot)) == -1)
        return -1;
    if ((index = parseItem(buffer, index, item)) == -1)
        return -1;
    return index;
}

int WindowItemsMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseInt8(buffer, index, window_id)) == -1)
        return -1;
    qint16 count;
    if ((index = parseInt16(buffer, index, count)) == -1)
        return -1;
    items.clear();
    for (int i = 0; i < count; i++) {
        Item item;
        if ((index = parseItem(buffer, index, item)) == -1)
            return -1;
        items.append(item);
    }
    return index;
}

int DisconnectOrKickMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseString(buffer, index, reason)) == -1)
        return -1;
    return index;
}
