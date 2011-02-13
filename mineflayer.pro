# -------------------------------------------------
# Project created by QtCreator 2011-01-23T00:47:29
# -------------------------------------------------
# TODO: use better build system.

QT += core \
    network \
    script \
    scripttools \
    gui
TARGET = mineflayer
TEMPLATE = app
SOURCES += src/main.cpp \
    src/Server.cpp \
    src/Messages.cpp \
    src/IncomingMessageParser.cpp \
    src/Chunk.cpp \
    src/MainWindow.cpp \
    src/Util.cpp \
    src/ScriptRunner.cpp \
    src/Game.cpp \
    src/SubChunkMeshGenerator.cpp
HEADERS += src/Server.h \
    src/Messages.h \
    src/Chunk.h \
    src/IncomingMessageParser.h \
    src/MetaTypes.h \
    src/MainWindow.h \
    src/Vector3D.h \
    src/Util.h \
    src/ScriptRunner.h \
    src/Game.h \
    src/Block.h \
    src/ItemTypeEnum.h \
    src/SubChunkMeshGenerator.h
RESOURCES += mineflayer.qrc
LIBS += \
    -lOgreMain \
    -lOIS
DEFINES += MINEFLAYER_3D_ON MINEFLAYER_GUI_ON

CONFIG += $$(EXTRA_CONFIG)

# if you want to run in headless mode, set environment variable EXTRA_CONFIG=headless or uncomment next line
#CONFIG += headless
headless {
    CONFIG += no_3d
    DEFINES -= MINEFLAYER_GUI_ON
    QT -= gui
}

# if you want to run without depending on the 3D client but still have the
# debugging features set environment variable EXTRA_CONFIG=no_3d or uncomment next line
#CONFIG += no_3d
no_3d {
    LIBS -= -lOgreMain -lOIS
    DEFINES -= MINEFLAYER_3D_ON
    SOURCES -= src/MainWindow.cpp src/SubChunkMeshGenerator.cpp
    HEADERS -= src/MainWindow.h src/SubChunkMeshGenerator.h
}
