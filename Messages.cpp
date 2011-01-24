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


int IncomingMessage::parseInt8(QByteArray buffer, int index, qint8 &value)
{
    const int size = 1;
    if (!(index + size <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, size));
    stream >> value;
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
    if ((index = parseInt8(buffer, index, yaw_out_of_255)) == -1)
        return -1;
    if ((index = parseInt8(buffer, index, pitch_out_of_255)) == -1)
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

int DisconnectOrKickMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseString(buffer, index, reason)) == -1)
        return -1;
    return index;
}
