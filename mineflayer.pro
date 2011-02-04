# -------------------------------------------------
# Project created by QtCreator 2011-01-23T00:47:29
# -------------------------------------------------
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
    src/ScriptRunner.cpp
HEADERS += src/Server.h \
    src/Messages.h \
    src/Chunk.h \
    src/IncomingMessageParser.h \
    src/MetaTypes.h \
    src/MainWindow.h \
    src/Int3D.h \
    src/Util.h \
    src/ScriptRunner.h
RESOURCES += mineflayer.qrc
LIBS += -lOgreMain \
    -lOIS
