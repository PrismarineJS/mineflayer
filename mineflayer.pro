TEMPLATE = subdirs
SUBDIRS = mineflayer-core \
    mineflayer-script

mineflayer-script.depends = mineflayer-core

TARGET = mineflayer
