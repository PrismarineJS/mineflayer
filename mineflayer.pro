QT += core \
    network \
    script \
    scripttools \
    gui
TARGET = mineflayer
TEMPLATE = app
SOURCES += src/main.cpp \
    src/ScriptRunner.cpp \
    src/StdinReader.cpp \
    src/Util.cpp \
    src/Server.cpp \
    src/Messages.cpp \
    src/IncomingMessageParser.cpp \
    src/Chunk.cpp \
    src/Util.cpp \
    src/Game.cpp \
    src/Item.cpp \
    src/Digger.cpp \
    src/GameListener.cpp \
    src/PhysicsDoer.cpp

HEADERS += \
    src/ScriptRunner.h \
    src/StdinReader.h \
    src/Util.h \
    src/MetaTypes.h \
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

RESOURCES += mineflayer.qrc
DEFINES += MINEFLAYER_GUI_ON
mac:CONFIG -= app_bundle
win32:CONFIG += console

unix {
    target.path = /bin
    INSTALLS += target
}

# if you want to run in headless mode, uncomment the next line or put it
# uncommented in config.pro
# CONFIG += headless
exists(config.pro) {
    include(config.pro)
}
headless {
    DEFINES -= MINEFLAYER_GUI_ON
    QT -= gui scripttools
}
