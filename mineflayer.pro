# -------------------------------------------------
# Project created by QtCreator 2011-01-23T00:47:29
# -------------------------------------------------
QT += core \
    gui \
    opengl \
    network
TARGET = mineflayer
TEMPLATE = app
SOURCES += main.cpp \
    MainWindow.cpp \
    ConnectDialog.cpp \
    GameWidget.cpp \
    Server.cpp \
    ConnectionSettings.cpp \
    Messages.cpp \
    IncomingMessageParser.cpp \
    RingBuffer.cpp \
    Camera.cpp \
    Util.cpp \
    Mesh.cpp \
    MeshInstance.cpp \
    Texture.cpp \
    Drawable.cpp \
    Bitmap.cpp \
    Chunk.cpp

HEADERS += MainWindow.h \
    ConnectDialog.h \
    GameWidget.h \
    Server.h \
    Messages.h \
    ConnectionSettings.h \
<<<<<<< HEAD
    Camera.h \
    Util.h \
    Mesh.h \
    MeshInstance.h \
    Texture.h \
    Drawable.h \
    Bitmap.h \
    Chunk.h \
    Constants.h \
    IncomingMessageParser.h \
    RingBuffer.h
FORMS += MainWindow.ui \
    ConnectDialog.ui
