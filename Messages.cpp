#include "Messages.h"

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

void HandshakeRequestMessage::writeMessageBody(QDataStream &stream)
{
    writeString(stream, username);
}


int IncomingMessage::parseInt16(QByteArray buffer, int index, qint16 &value)
{
    if (!(index + 2 <= buffer.size()))
        return -1;
    QDataStream stream(buffer.mid(index, 2));
    stream >> value;
    index += 2;
    return index;
}

int IncomingMessage::parseString(QByteArray buffer, int index, QString &string)
{
    qint16 length;
    if ((index = parseInt16(buffer, index, length)) == -1)
        return -1;
    if (!(index + length <= buffer.size()))
        return -1;
    string = QString::fromUtf8(buffer.mid(index, length).constData(), length);
    index += length;
    return index;
}

int HandshakeResponseMessage::parse(QByteArray buffer)
{
    int index = 1;
    if ((index = parseString(buffer, index, connectionHash)) == -1)
        return -1;
    return index;
}



