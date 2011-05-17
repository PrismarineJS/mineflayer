#include "GameListener.h"

mineflayer_Callbacks GameListener::s_cb;

GameListener::GameListener(Game * _game, bool auto_physics, QObject *parent) :
    QObject(parent),
    game(_game),
    m_physics_doer(NULL),
    m_auto_physics(auto_physics)
{
    bool success;

    success = connect(game, SIGNAL(chatReceived(QString,QString)), this, SLOT(chatReceived(QString,QString)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(timeUpdated(double)), this, SLOT(timeUpdated(double)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(nonSpokenChatReceived(QString)), this, SLOT(nonSpokenChatReceived(QString)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(entitySpawned(mineflayer_Entity *)), this, SLOT(entitySpawned(mineflayer_Entity *)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(entityDespawned(mineflayer_Entity *)), this, SLOT(entityDespawned(mineflayer_Entity *)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(entityMoved(mineflayer_Entity *)), this, SLOT(entityMoved(mineflayer_Entity *)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(animation(mineflayer_Entity *,mineflayer_AnimationType)), this, SLOT(animation(mineflayer_Entity *,mineflayer_AnimationType)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(chunkUpdated(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(unloadChunk(Int3D)), this, SLOT(unloadChunk(Int3D)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(signUpdated(Int3D,QString)), this, SLOT(signUpdated(Int3D,QString)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(playerPositionUpdated()), this, SLOT(playerPositionUpdated()));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(playerHealthUpdated()), this, SLOT(playerHealthUpdated()));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(playerDied()), this, SLOT(playerDied()));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(playerSpawned()), this, SLOT(playerSpawned()));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(stoppedDigging(mineflayer_StoppedDiggingReason)), this, SLOT(stoppedDigging(mineflayer_StoppedDiggingReason)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(loginStatusUpdated(mineflayer_LoginStatus)), this, SLOT(loginStatusUpdated(mineflayer_LoginStatus)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(windowOpened(mineflayer_WindowType)), this, SLOT(windowOpened(mineflayer_WindowType)));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(inventoryUpdated()), this, SLOT(inventoryUpdated()));
    Q_ASSERT(success);
    success = connect(game, SIGNAL(equippedItemChanged()), this, SLOT(equippedItemChanged()));
    Q_ASSERT(success);

    if (m_auto_physics)
        m_physics_doer = new PhysicsDoer(this);
}

void GameListener::chatReceived(QString username, QString message)
{
    if (s_cb.chatReceived == NULL)
        return;

    mineflayer_Utf8 utf8username = Util::toNewMfUtf8(username);
    mineflayer_Utf8 utf8message = Util::toNewMfUtf8(message);
    s_cb.chatReceived(context, utf8username, utf8message);
    mineflayer_destroyUtf8(utf8username);
    mineflayer_destroyUtf8(utf8message);
}

void GameListener::timeUpdated(double seconds)
{
    if (s_cb.timeUpdated == NULL)
        return;

    s_cb.timeUpdated(context, seconds);
}

void GameListener::nonSpokenChatReceived(QString message)
{
    if (s_cb.nonSpokenChatReceived == NULL)
        return;

    mineflayer_Utf8 utf8message = Util::toNewMfUtf8(message);
    s_cb.nonSpokenChatReceived(context, utf8message);
    mineflayer_destroyUtf8(utf8message);

}

void GameListener::entitySpawned(mineflayer_Entity * entity)
{
    if (s_cb.entitySpawned != NULL) {
        s_cb.entitySpawned(context, entity);
    }
    mineflayer_destroyEntity(entity);
}

void GameListener::entityDespawned(mineflayer_Entity * entity)
{
    if (s_cb.entityDespawned != NULL) {
        s_cb.entityDespawned(context, entity);
    }
    mineflayer_destroyEntity(entity);
}

void GameListener::entityMoved(mineflayer_Entity * entity)
{
    if (s_cb.entityMoved != NULL) {
        s_cb.entityMoved(context, entity);
    }
    mineflayer_destroyEntity(entity);
}

void GameListener::animation(mineflayer_Entity * entity, mineflayer_AnimationType animation_type)
{
    if (s_cb.animation != NULL) {
        s_cb.animation(context, entity, animation_type);
    }

    mineflayer_destroyEntity(entity);
}

void GameListener::chunkUpdated(const Int3D &_start, const Int3D &_size)
{
    if (s_cb.chunkUpdated == NULL)
        return;

    mineflayer_Int3D start;
    start.x = _start.x;
    start.y = _start.y;
    start.z = _start.z;
    mineflayer_Int3D size;
    size.x = _size.x;
    size.y = _size.y;
    size.z = _size.z;

    s_cb.chunkUpdated(context, start, size);
}

void GameListener::unloadChunk(const Int3D &_coord)
{
    if (s_cb.unloadChunk == NULL)
        return;

    mineflayer_Int3D coord;
    coord.x = _coord.x;
    coord.y = _coord.y;
    coord.z = _coord.z;

    s_cb.unloadChunk(context, coord);
}

void GameListener::signUpdated(const Int3D &_location, QString text)
{
    if (s_cb.signUpdated == NULL)
        return;
    mineflayer_Int3D location;
    location.x = _location.x;
    location.y = _location.y;
    location.z = _location.z;

    mineflayer_Utf8 utf8text = Util::toNewMfUtf8(text);
    s_cb.signUpdated(context, location, utf8text);
    mineflayer_destroyUtf8(utf8text);

}

void GameListener::playerPositionUpdated()
{
    if (s_cb.playerPositionUpdated == NULL)
        return;

    s_cb.playerPositionUpdated(context);
}

void GameListener::playerHealthUpdated()
{
    if (s_cb.playerHealthUpdated == NULL)
        return;

    s_cb.playerHealthUpdated(context);
}

void GameListener::playerDied()
{
    if (s_cb.playerDied == NULL)
        return;

    s_cb.playerDied(context);
}

void GameListener::playerSpawned()
{
    if (s_cb.playerSpawned == NULL)
        return;

    s_cb.playerSpawned(context);
}

void GameListener::stoppedDigging(mineflayer_StoppedDiggingReason reason)
{
    if (s_cb.stoppedDigging == NULL)
        return;

    s_cb.stoppedDigging(context, reason);
}

void GameListener::loginStatusUpdated(mineflayer_LoginStatus status)
{
    if (status == mineflayer_SuccessStatus && m_auto_physics)
        m_physics_doer->start();

    if (s_cb.loginStatusUpdated == NULL)
        return;

    s_cb.loginStatusUpdated(context, status);
}

void GameListener::windowOpened(mineflayer_WindowType window_type)
{
    if (s_cb.windowOpened == NULL)
        return;

    s_cb.windowOpened(context, window_type);
}

void GameListener::inventoryUpdated()
{
    if (s_cb.inventoryUpdated == NULL)
        return;

    s_cb.inventoryUpdated(context);
}

void GameListener::equippedItemChanged()
{
    if (s_cb.equippedItemChanged == NULL)
        return;

    s_cb.equippedItemChanged(context);
}

