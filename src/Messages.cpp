#include "Messages.h"

#include <QDebug>

const qint32 OutgoingRequest::c_protocol_version = 22;

void OutgoingRequest::writeToStream(QDataStream &stream)
{
    if (false) {
        // for printing outgoing binary
        QByteArray buffer;
        QDataStream fake_stream(&buffer, QIODevice::WriteOnly);

        fake_stream << (qint8)messageType;
        writeMessageBody(fake_stream);

        qDebug() << "sending message: " << buffer.toHex();
        // use python 3 to see ascii:
        // >>> hexstr_to_str = lambda h: b"".join(bytes(((int(b[0], 16) << 4) + int(b[1], 16),)) for b in zip(*[iter(h)]*2))
        // >>> hexstr_to_str("0200087375706572626f74")
        // b'\x02\x00\x08superbot'

        stream.device()->write(buffer);
    } else {
        // production mode
        stream << (qint8)messageType;
        writeMessageBody(stream);
    }
}

void OutgoingRequest::writeValue(QDataStream &stream, bool value) { writeValue(stream, (qint8)value); }
void OutgoingRequest::writeValue(QDataStream &stream, qint8 value) { stream << value; }
void OutgoingRequest::writeValue(QDataStream &stream, qint16 value) { stream << value; }
void OutgoingRequest::writeValue(QDataStream &stream, qint32 value) { stream << value; }
void OutgoingRequest::writeValue(QDataStream &stream, qint64 value) { stream << value; }
void OutgoingRequest::writeValue(QDataStream &stream, float value)
{
    stream.setFloatingPointPrecision(QDataStream::SinglePrecision);
    stream << value;
}
void OutgoingRequest::writeValue(QDataStream &stream, double value)
{
    stream.setFloatingPointPrecision(QDataStream::DoublePrecision);
    stream << value;
}
void OutgoingRequest::writeValue(QDataStream & stream, QString value)
{
    writeValue(stream, (qint16)value.length());
    const char * char_buffer = reinterpret_cast<const char *>(value.utf16());
#if Q_BYTE_ORDER == Q_LITTLE_ENDIAN
    // swap endian
    for (int i = 0; i < value.length(); i++) {
        int char_index = i * 2;
        stream.device()->write(char_buffer + char_index + 1, 1);
        stream.device()->write(char_buffer + char_index, 1);
    }
#else
    stream.device()->write(char_buffer, value.length()*2);
#endif
}
void OutgoingRequest::writeStringUtf8(QDataStream & stream, QString value)
{
    QByteArray utf8_data = value.toUtf8();
    writeValue(stream, (qint16)utf8_data.size());
    stream.device()->write(utf8_data);
}
void OutgoingRequest::writeValue(QDataStream &stream, Item value)
{
    writeValue(stream, (qint16)value.type);
    if (value.type == Item::NoItem)
        return;
    writeValue(stream, (qint8) value.count);
    writeValue(stream, (qint16) value.metadata);
}

void LoginRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, c_protocol_version);
    writeValue(stream, username);
    writeValue(stream, (qint64)0); // map seed
    writeValue(stream, (qint32)0); // game mode
    writeValue(stream, (qint8)0); // dimension
    writeValue(stream, (qint8)0); // difficulty
    writeValue(stream, (qint8)0); // world height
    writeValue(stream, (qint8)0); // max players
}

void HandshakeRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, username);
}

void ChatRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, message);
}

void UseEntityRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, self_entity_id);
    writeValue(stream, target_entity_id);
    writeValue(stream, left_click);
}

void RespawnRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, world);
    writeValue(stream, (qint8)0); // difficulty
    writeValue(stream, (qint8)0); // game_mode
    writeValue(stream, (qint16)0); // world_height
    writeValue(stream, (qint64)0); // seed
}

void PlayerPositionAndLookRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, x);
    writeValue(stream, y);
    writeValue(stream, stance);
    writeValue(stream, z);
    writeValue(stream, yaw);
    writeValue(stream, pitch);
    writeValue(stream, on_ground);
}

void PlayerDiggingRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, (qint8)status);
    writeValue(stream, x);
    writeValue(stream, y);
    writeValue(stream, z);
    writeValue(stream, (qint8)block_face);
}

void PlayerBlockPlacementRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, meters_x);
    writeValue(stream, meters_y);
    writeValue(stream, meters_z);
    writeValue(stream, (qint8)block_face);
    writeValue(stream, item);
}

void AnimationRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, entity_id);
    writeValue(stream, (qint8)animation_type);
}

void CloseWindowRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, window_id);
}

void WindowClickRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, window_id);
    writeValue(stream, slot);
    writeValue(stream, is_right_click);
    writeValue(stream, action_id);
    writeValue(stream, is_shift);
    writeValue(stream, item);
}

void HoldingChangeRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, slot);
}

void UpdateSignRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, meters_x);
    writeValue(stream, meters_y);
    writeValue(stream, meters_z);
    writeValue(stream, line_1);
    writeValue(stream, line_2);
    writeValue(stream, line_3);
    writeValue(stream, line_4);
}

void DisconnectRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, reason);
}

void IncrementStatisticRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, statistic_id);
    writeValue(stream, amount);
}

void EnchantItemRequest::writeMessageBody(QDataStream &stream)
{
    writeValue(stream, window_id);
    writeValue(stream, enchant_index);
}

int IncomingResponse::parseValue(QByteArray buffer, int index, bool &value)
{
    qint8 tmp = 0;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    value = tmp;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, quint8 &value)
{
    qint8 tmp;
    int result = parseValue(buffer, index, tmp);
    value = tmp;
    return result;
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
    if (!(index + length * 2 <= buffer.size()))
        return -1;

    char * char_buffer = buffer.data() + index;
#if Q_BYTE_ORDER == Q_LITTLE_ENDIAN
    // swap endian
    for (int i = 0; i < length; i++) {
        int char_index = i * 2;
        char tmp = char_buffer[char_index];
        char_buffer[char_index] = char_buffer[char_index + 1];
        char_buffer[char_index + 1] = tmp;
    }
#endif
    ushort * short_buffer = reinterpret_cast<ushort*>(char_buffer);
    value = QString::fromUtf16(short_buffer, length);

    index += length*2;
    return index;
}
int IncomingResponse::parseStringAscii(QByteArray buffer, int index, QString &value)
{
    qint8 length;
    if ((index = parseValue(buffer, index, length)) == -1)
        return -1;
    if (!(index + length <= buffer.size()))
        return -1;
    value = QString::fromUtf8(buffer.mid(index, length).constData(), length);
    index += length;
    return index;
}
int IncomingResponse::parseValue(QByteArray buffer, int index, QByteArray &value, qint16 length)
{
    qint8 tmp;
    for (qint16 i = 0; i < length; i++) {
        if ((index = parseValue(buffer, index, tmp)) == -1)
            return -1;
        value.push_back(tmp);
    }
    return index;
}
int IncomingResponse::parseSlot(QByteArray buffer, int index, Item &item, bool force_complete_structure)
{
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    item.type = (Item::ItemType)tmp;
    if (force_complete_structure || item.type != Item::NoItem) {
        if ((index = parseValue(buffer, index, item.count)) == -1)
            return -1;
        if ((index = parseValue(buffer, index, item.metadata)) == -1)
            return -1;
        if ((index = parseValue(buffer, index, tmp)) == -1)
            return -1;
        QByteArray enchantments;
        if ((index = parseValue(buffer, index, enchantments, tmp)) == -1)
            return -1;
    } else {
        item.count = 0;
        item.metadata = 0;
    }
    return index;

}
int IncomingResponse::parseItem(QByteArray buffer, int index, Item &item, bool force_complete_structure)
{
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    item.type = (Item::ItemType)tmp;
    if (force_complete_structure || item.type != Item::NoItem) {
        if ((index = parseValue(buffer, index, item.count)) == -1)
            return -1;
        if ((index = parseValue(buffer, index, item.metadata)) == -1)
            return -1;
    } else {
        item.count = 0;
        item.metadata = 0;
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

int KeepAliveResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, keep_alive_id)) == -1)
        return -1;
    return index;
}

int LoginResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, _unused)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, map_seed)) == -1)
        return -1;
    qint32 tmp32;
    if ((index = parseValue(buffer, index, tmp32)) == -1)
        return -1;
    server_mode = (ServerMode)tmp32;
    qint8 tmp8;
    if ((index = parseValue(buffer, index, tmp8)) == -1)
        return -1;
    dimension = (Dimension)tmp8;
    if ((index = parseValue(buffer, index, tmp8)) == -1)
        return -1;
    difficulty = (Difficulty)tmp8;
    if ((index = parseValue(buffer, index, world_height)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, max_players)) == -1)
        return -1;
    return index;
}

const QString HandshakeResponse::PasswordAuthenticationRequired = "+";
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
    item_type = (Item::ItemType)tmp;
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
    if ((index = parseValue(buffer, index, food)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, food_saturation)) == -1)
        return -1;
    return index;
}

int RespawnResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, world)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, difficulty)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, game_mode)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, world_height)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, seed)) == -1)
        return -1;
    return index;
}

int BedAnimationResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, unknown_1)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_2)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_3)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_4)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_5)) == -1)
        return -1;

    return index;
}

int PlayerPositionAndLookResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, stance)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
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
    qint8 tmp = 0;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    status = (DiggingStatus)tmp;
    if ((index = parseValue(buffer, index, meters_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    block_face = (BlockFaceDirection)tmp;
    return index;
}

int PlayerBlockPlacementResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, meters_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    block_face = (BlockFaceDirection)tmp;
    if ((index = parseItem(buffer, index, item)) == -1)
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
    if ((index = parseValue(buffer, index, pixels_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    qint16 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    held_item = (Item::ItemType)tmp;
    return index;
}

int PickupSpawnResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseItem(buffer, index, item)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, yaw_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pitch_out_of_256)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, roll_out_of_256)) == -1)
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
    if ((index = parseValue(buffer, index, pixels_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_z)) == -1)
        return -1;

    if ((index = parseValue(buffer, index, unknown_flag)) == -1)
        return -1;
    if (unknown_flag == 0)
        return index;
    if ((index = parseValue(buffer, index, unknown_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_z)) == -1)
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
    if ((index = parseValue(buffer, index, pixels_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_z)) == -1)
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

int ExperienceOrbResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, count)) == -1)
        return -1;
    return index;
}

int Unknown1BResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, unknown_1)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_2)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_3)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_4)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_5)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_6)) == -1)
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
    if ((index = parseValue(buffer, index, pixels_dx)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_dy)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_dz)) == -1)
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
    if ((index = parseValue(buffer, index, pixels_dx)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_dy)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_dz)) == -1)
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
    if ((index = parseValue(buffer, index, pixels_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, pixels_z)) == -1)
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

int EntityEffectResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, effect_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, amplifier)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, duration)) == -1)
        return -1;
    return index;
}

int RemoveEntityEffectResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, effect_id)) == -1)
        return -1;
    return index;
}

int ExperienceResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, experience_relative_to_current_level)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, level)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, total_experience)) == -1)
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
    qint16 block_count = 0;
    if ((index = parseValue(buffer, index, block_count)) == -1)
        return -1;
    block_coords.clear();
    block_coords.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 x_and_z = 0;
        if ((index = parseValue(buffer, index, x_and_z)) == -1)
            return -1;
        qint8 y = 0;
        if ((index = parseValue(buffer, index, y)) == -1)
            return -1;
        block_coords.replace(i, Int3D((x_and_z >> 4) & 0xf, y, x_and_z & 0xf));
    }
    new_block_types.clear();
    new_block_types.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 block_type = 0;
        if ((index = parseValue(buffer, index, block_type)) == -1)
            return -1;
        new_block_types.replace(i, (Item::ItemType)block_type);
    }
    new_block_metadatas.clear();
    new_block_metadatas.resize(block_count);
    for (int i = 0; i < block_count; i++) {
        qint8 metadata = 0;
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
    new_block_type = (Item::ItemType)tmp;
    if ((index = parseValue(buffer, index, metadata)) == -1)
        return -1;
    return index;
}

int PlayNoteBlockResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, meters_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_z)) == -1)
        return -1;
    qint8 tmp;
    if ((index = parseValue(buffer, index, tmp)) == -1)
        return -1;
    instrument_type = (InstrumentType)tmp;
    if ((index = parseValue(buffer, index, pitch)) == -1)
        return -1;
    return index;
}

int DoorChangeResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, unknown_1)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_z)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_2)) == -1)
        return -1;
    return index;
}

int InvalidBedOrStateChangeResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, reason)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, game_mode)) == -1)
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
        qint8 local_x = 0;
        if ((index = parseValue(buffer, index, local_x)) == -1)
            return -1;
        qint8 local_y = 0;
        if ((index = parseValue(buffer, index, local_y)) == -1)
            return -1;
        qint8 local_z = 0;
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
    inventory_type = (WindowType)tmp;
    if ((index = parseValue(buffer, index, window_title)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, number_of_slots)) == -1)
        return -1;
    return index;
}

int CloseWindowResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, window_id)) == -1)
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
    if ((index = parseItem(buffer, index, item)) == -1)
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

int CreativeInventoryActionResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, slot)) == -1)
        return -1;
    if ((index = parseItem(buffer, index, item, true)) == -1)
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
        if ((index = parseItem(buffer, index, item)) == -1)
            return -1;
        items.replace(i, item);
    }
    return index;
}

int UpdateSignResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, meters_x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, meters_z)) == -1)
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

int MapDataResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, unknown_1)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, unknown_2)) == -1)
        return -1;
    if ((index = parseStringAscii(buffer, index, text)) == -1)
        return -1;
    return index;
}

int IncrementStatisticResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, statistic_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, amount)) == -1)
        return -1;
    return index;
}

int PlayerOnlineStatusResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, name)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, online)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, ping_milliseconds)) == -1)
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

int LightningBoltResponse::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseValue(buffer, index, entity_id)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, always_true)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, x)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, y)) == -1)
        return -1;
    if ((index = parseValue(buffer, index, z)) == -1)
        return -1;

    return index;
}
