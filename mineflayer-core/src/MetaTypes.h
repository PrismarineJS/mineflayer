#ifndef METATYPES_H
#define METATYPES_H

#include "Server.h"
#include "Vector3D.h"
#include "Game.h"

#include <QMetaType>
#include <QAbstractSocket>

namespace CoreMetaTypes {
    void coreRegisterMetaTypes() {
        qRegisterMetaType<QSharedPointer<IncomingResponse> >("QSharedPointer<IncomingResponse>");
        qRegisterMetaType<QSharedPointer<OutgoingRequest> >("QSharedPointer<OutgoingRequest>");
        qRegisterMetaType<QSharedPointer<Chunk> >("QSharedPointer<Chunk>");
        qRegisterMetaType<mineflayer_LoginStatus>("mineflayer_LoginStatus");
        qRegisterMetaType<QAbstractSocket::SocketError>("QAbstractSocket::SocketError");
        qRegisterMetaType<mineflayer_EntityPosition>("mineflayer_EntityPosition");
        qRegisterMetaType<Int3D>("Int3D");
        qRegisterMetaType<Block>("Block");
        qRegisterMetaType<QHash<Int3D,Block> >("QHash<Int3D,Block>");
        qRegisterMetaType<mineflayer_MobType>("mineflayer_MobType");
        qRegisterMetaType<mineflayer_ItemType>("mineflayer_ItemType");
        qRegisterMetaType<Item>("Item");
        qRegisterMetaType<mineflayer_Entity*>("mineflayer_Entity*");
        qRegisterMetaType<mineflayer_StoppedDiggingReason>("mineflayer_StoppedDiggingReason");
        qRegisterMetaType<mineflayer_AnimationType>("mineflayer_AnimationType");
        qRegisterMetaType<mineflayer_WindowType>("mineflayer_WindowType");
        qRegisterMetaType<QVector<Item> >("QVector<Item>");
    }
}


#endif // METATYPES_H
