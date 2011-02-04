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
SOURCES += main.cpp \
    Server.cpp \
    Messages.cpp \
    IncomingMessageParser.cpp \
    Chunk.cpp \
    MainWindow.cpp \
    Util.cpp \
    ScriptRunner.cpp
HEADERS += Server.h \
    Messages.h \
    Chunk.h \
    IncomingMessageParser.h \
    MetaTypes.h \
    MainWindow.h \
    Int3D.h \
    Util.h \
    ScriptRunner.h
RESOURCES += mineflayer.qrc
LIBS += -lOgreMain \
    -lOIS
