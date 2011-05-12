#ifndef GAMELISTENER_H
#define GAMELISTENER_H

#include "mineflayer-core.h"

#include "Game.h"
#include <QObject>

class GameListener : public QObject
{
    Q_OBJECT
public:
    explicit GameListener(Game * game, QObject *parent = 0);

    static mineflayer_Callbacks s_cb;

    Game * game;
    void * context;

public slots:
    void chatReceived(QString username, QString message);
    void timeUpdated(double seconds);
    void nonSpokenChatReceived(QString message);

    void entitySpawned(mineflayer_Entity * mineflayer_entity);
    void entityDespawned(mineflayer_Entity * mineflayer_entity);
    void entityMoved(mineflayer_Entity * mineflayer_entity);
    void animation(mineflayer_Entity * mineflayer_entity, mineflayer_AnimationType animation_type);

    void chunkUpdated(const Int3D &start, const Int3D &size);
    void unloadChunk(const Int3D &coord);
    void signUpdated(const Int3D &location, QString text);
    void playerPositionUpdated();
    void playerHealthUpdated();
    void playerDied();
    void playerSpawned();
    void stoppedDigging(mineflayer_StoppedDiggingReason reason);
    void loginStatusUpdated(mineflayer_LoginStatus status);

    void windowOpened(mineflayer_WindowType);

    void inventoryUpdated();
    void equippedItemChanged();


};

#endif // GAMELISTENER_H
