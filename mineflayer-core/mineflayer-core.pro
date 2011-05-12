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
    src/GameListener.cpp

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
    src/GameListener.h

RESOURCES += mineflayer.qrc
CONFIG += $$(EXTRA_CONFIG)

symbian {
    #Symbian specific definitions
    MMP_RULES += EXPORTUNFROZEN
    TARGET.UID3 = 0xE3896420
    TARGET.CAPABILITY =
    TARGET.EPOCALLOWDLLDATA = 1
    addFiles.sources = mineflayer-core.dll
    addFiles.path = !:/sys/bin
    DEPLOYMENT += addFiles
}

unix:!symbian {
    maemo5 {
        target.path = /opt/usr/lib
    } else {
        target.path = /usr/local/lib
    }
    INSTALLS += target
}
