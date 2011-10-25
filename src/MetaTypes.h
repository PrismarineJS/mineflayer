#ifndef METATYPES_H
#define METATYPES_H

#include "Server.h"
#include "Vector3D.h"
#include "Game.h"

#include <QMetaType>
#include <QAbstractSocket>

namespace MetaTypes {
    void registerMetaTypes() {
        qRegisterMetaType<Server::LoginStatus>("Server::LoginStatus");
        qRegisterMetaType<Server::EntityPosition>("Server::EntityPosition");
        qRegisterMetaType<MobSpawnResponse::MobType>("MobSpawnResponse::MobType");
        qRegisterMetaType<Item::ItemType>("Item::ItemType");
        qRegisterMetaType<Game::StoppedDiggingReason>("Game::StoppedDiggingReason");
        qRegisterMetaType<Message::AnimationType>("Message::AnimationType");
        qRegisterMetaType<Message::WindowType>("Message::WindowType");
        qRegisterMetaType<Game::Dimension>("Game::Dimension");

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
