#-------------------------------------------------
#
# Project created by QtCreator 2011-05-11T16:15:16
#
#-------------------------------------------------

QT += core \
    network

TARGET = mineflayer-core
TEMPLATE = lib

DEFINES += MINEFLAYERCORE_LIBRARY

SOURCES += \
    src/Server.cpp \
    src/Messages.cpp \
    src/IncomingMessageParser.cpp \
    src/Chunk.cpp \
    src/Util.cpp \
    src/Game.cpp \
    src/Item.cpp \
    src/Digger.cpp \
    src/mineflayer-core.cpp \
    src/GameListener.cpp \
    src/PhysicsDoer.cpp

HEADERS += \
    src/mineflayer-core.h \
    src/Server.h \
    src/Messages.h \
    src/Chunk.h \
    src/IncomingMessageParser.h \
    src/MetaTypes.h \
    src/Vector3D.h \
    src/Util.h \
    src/Game.h \
    src/Block.h \
    src/Item.h \
    src/Digger.h \
    src/GameListener.h \
    src/PhysicsDoer.h

RESOURCES += mineflayer-core.qrc
CONFIG += $$(EXTRA_CONFIG)

unix {
    target.path = /lib
    INSTALLS += target
}
