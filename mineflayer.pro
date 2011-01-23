#-------------------------------------------------
#
# Project created by QtCreator 2011-01-23T00:47:29
#
#-------------------------------------------------

QT       += core gui opengl

TARGET = mineflayer
TEMPLATE = app


SOURCES += main.cpp\
        MainWindow.cpp \
    ConnectDialog.cpp \
    GameWidget.cpp \
    Server.cpp

HEADERS  += MainWindow.h \
    ConnectDialog.h \
    GameWidget.h \
    Server.h

FORMS    += MainWindow.ui \
    ConnectDialog.ui
