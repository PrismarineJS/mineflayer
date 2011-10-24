#ifndef METATYPES_H
#define METATYPES_H

#include "Server.h"
#include "Vector3D.h"
#include "Game.h"

#include <QMetaType>
#include <QAbstractSocket>

namespace MetaTypes {
    void registerMetaTypes() {
        qRegisterMetaType<mineflayer_LoginStatus>("mineflayer_LoginStatus");
        qRegisterMetaType<mineflayer_EntityPosition>("mineflayer_EntityPosition");
        qRegisterMetaType<mineflayer_MobType>("mineflayer_MobType");
        qRegisterMetaType<mineflayer_ItemType>("mineflayer_ItemType");
        qRegisterMetaType<mineflayer_Entity*>("mineflayer_Entity*");
        qRegisterMetaType<mineflayer_StoppedDiggingReason>("mineflayer_StoppedDiggingReason");
        qRegisterMetaType<mineflayer_AnimationType>("mineflayer_AnimationType");
        qRegisterMetaType<mineflayer_WindowType>("mineflayer_WindowType");
        qRegisterMetaType<mineflayer_Int3D>("mineflayer_Int3D");
        qRegisterMetaType<mineflayer_Dimension>("mineflayer_Dimension");

        qRegisterMetaType<QSharedPointer<IncomingResponse> >("QSharedPointer<IncomingResponse>");
        qRegisterMetaType<QSharedPointer<OutgoingRequest> >("QSharedPointer<OutgoingRequest>");
        qRegisterMetaType<QSharedPointer<Chunk> >("QSharedPointer<Chunk>");
        qRegisterMetaType<QAbstractSocket::SocketError>("QAbstractSocket::SocketError");
        qRegisterMetaType<Int3D>("Int3D");
        qRegisterMetaType<Block>("Block");
        qRegisterMetaType<QHash<Int3D,Block> >("QHash<Int3D,Block>");
        qRegisterMetaType<Item>("Item");
        qRegisterMetaType<QVector<Item> >("QVector<Item>");
    }
}


#endif // METATYPES_H
