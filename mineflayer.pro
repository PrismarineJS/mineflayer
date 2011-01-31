# -------------------------------------------------
# Project created by QtCreator 2011-01-23T00:47:29
# -------------------------------------------------
QT += core \
    network
QT -= gui
TARGET = mineflayer
TEMPLATE = app
SOURCES += main.cpp \
    Server.cpp \
    Messages.cpp \
    IncomingMessageParser.cpp \
    Chunk.cpp \
    MainWindow.cpp
HEADERS += Server.h \
    Messages.h \
    Chunk.h \
    IncomingMessageParser.h \
    MetaTypes.h \
    MainWindow.h \
    Int3D.h
RESOURCES += mineflayer.qrc
LIBS += -lOgreMain \
    -lOIS
