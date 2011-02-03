#ifndef METATYPES_H
#define METATYPES_H

#include "Server.h"

#include <QMetaType>
#include <QAbstractSocket>

namespace MetaTypes {
    void registerMetaTypes() {
        qRegisterMetaType<QSharedPointer<IncomingResponse> >("QSharedPointer<IncomingResponse>");
        qRegisterMetaType<QSharedPointer<OutgoingRequest> >("QSharedPointer<OutgoingRequest>");
        qRegisterMetaType<QSharedPointer<Chunk> >("QSharedPointer<Chunk>");
        qRegisterMetaType<Server::LoginStatus>("ServerTypes::LoginStatus");
        qRegisterMetaType<QAbstractSocket::SocketError>("QAbstractSocket::SocketError");
        qRegisterMetaType<Server::EntityPosition>("Server::EntityPosition");
    }
}


#endif // METATYPES_H
