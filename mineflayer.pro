# -------------------------------------------------
# Project created by QtCreator 2011-01-23T00:47:29
# -------------------------------------------------
# TODO: use cmake.

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
    src/Int3D.h \
    src/Util.h \
    src/ScriptRunner.h \
    src/Game.h \
    src/Block.h \
    src/ItemTypeEnum.h \
    src/BlockingPriorityQueue.h \
    src/SubChunkMeshGenerator.h
RESOURCES += mineflayer.qrc
LIBS += \
    -lOgreMain \
    -lOIS
DEFINES += MINEFLAYER_3D_ON


# ---------if you want 3D off, uncomment ----------
# LIBS -= -lOgreMain -lOIS
# DEFINES -= MINEFLAYER_3D_ON
# SOURCES -= src/MainWindow.cpp src/SubChunkMeshGenerator.cpp
# HEADERS -= src/MainWindow.h src/BlockingPriorityQueue.h src/SubChunkMeshGenerator.h
# --------------------------------------
