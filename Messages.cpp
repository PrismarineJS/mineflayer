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
    if ((index = parseInt8(buffer, index, dimension)) == -1)
        return -1;
    return index;
}

int HandshakeResponseMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseString(buffer, index, connectionHash)) == -1)
        return -1;
    return index;
}

