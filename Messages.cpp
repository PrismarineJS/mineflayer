#include "Messages.h"

void OutgoingMessage::writeToStream(QDataStream &stream)
{
    stream << (qint8)messageType;
    // TODO
}
