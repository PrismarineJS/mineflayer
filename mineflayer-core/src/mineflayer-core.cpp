#include "mineflayer-core.h"
#include "Game.h"
#include "GameListener.h"
#include "Util.h"
#include "Vector3D.h"
#include "MetaTypes.h"
#include "Item.h"

#include <QUrl>
#include <QMutex>
#include <QThread>
#include <QObject>
#include <QCoreApplication>

bool _mineflayer_doneInitializing = false;

mineflayer_GamePtr mineflayer_createGame(mineflayer_Url url, bool auto_physics_loop) {
    if (! _mineflayer_doneInitializing) {
        _mineflayer_doneInitializing = true;
        CoreMetaTypes::coreRegisterMetaTypes();
        Item::initializeStaticData();

        if (QCoreApplication::instance() == NULL) {
            int argc = 0;
            new QCoreApplication(argc, NULL);
        }
    }

    QUrl qurl;
    qurl.setUserName(Util::toQString(url.username));
    if (url.password.byte_count > 0)
        qurl.setPassword(Util::toQString(url.password));
    if (url.hostname.byte_count > 0)
        qurl.setHost(Util::toQString(url.hostname));
    else
        qurl.setHost("localhost");
    if (url.port > 0)
        qurl.setPort(url.port);

    Game * game = new Game(qurl);
    GameListener * game_listener = new GameListener(game, auto_physics_loop, game);

    return reinterpret_cast<mineflayer_GamePtr>(game_listener);
}

extern "C" void * go(void *arg);

class MyThread
{
public:
    pthread_t thread;
    QMutex m_mutex;

    Game * game;
    GameListener * game_listener;

    mineflayer_Callbacks m_cb;
    void *m_ctx;
    mineflayer_Url m_url;

public:
    MyThread(mineflayer_Url url, mineflayer_Callbacks cbs, void *ctx) :
    m_mutex(),
    m_cb(cbs),
    m_ctx(ctx),
    m_url(url)
    {
	m_mutex.lock();

        // Need to use a pthread here in order to fool Qt
        // that this is the main thread or it gets upset.
        pthread_create(&thread, NULL, &go, this);
    }

    void run() {
        if (! _mineflayer_doneInitializing) {
            _mineflayer_doneInitializing = true;
            CoreMetaTypes::coreRegisterMetaTypes();
            Item::initializeStaticData();

            if (QCoreApplication::instance() == NULL) {
                int argc = 0;
                new QCoreApplication(argc, NULL);
            }
        }

        QUrl qurl;
        qurl.setUserName(Util::toQString(m_url.username));
        if (m_url.password.byte_count > 0)
            qurl.setPassword(Util::toQString(m_url.password));
        if (m_url.hostname.byte_count > 0)
            qurl.setHost(Util::toQString(m_url.hostname));
        else
            qurl.setHost("localhost");
        if (m_url.port > 0)
            qurl.setPort(m_url.port);

        game = new Game(qurl);
        game_listener = new GameListener(game, 1, game);

        game_listener->batcher = new Batcher();
        game_listener->batcher->update(&m_cb, &game_listener->s_cb);
        game_listener->context = game_listener->batcher;
        game_listener->s_batchCb = m_cb;
        game_listener->s_batchContext = m_ctx;

        game->start();

        m_mutex.unlock();

        QCoreApplication::instance()->exec();
    }

    void waitTillStarted()
    {
        m_mutex.lock();
        m_mutex.unlock();
    }
};

extern "C" void * go(void *arg)
{
    MyThread *mt = reinterpret_cast<MyThread*>(arg);
    mt->run();
    return NULL;
}

mineflayer_GamePtr mineflayer_createGamePullCallbacks(mineflayer_Url url, mineflayer_Callbacks cbs, void *ctx) {
    MyThread *t = new MyThread(url, cbs, ctx);

    t->waitTillStarted();

    return reinterpret_cast<mineflayer_GamePtr>(t->game_listener);
}

void mineflayer_doCallbacks(mineflayer_GamePtr _game)
{
    GameListener * game_listener = reinterpret_cast<GameListener *>(_game);
    if (game_listener->batcher)
        game_listener->batcher->msgEmit(&game_listener->s_batchCb, game_listener->s_batchContext);
}

int mineflayer_runEventLoop() {
    return QCoreApplication::instance()->exec();
}

void mineflayer_destroyGame(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    delete game;
}

void mineflayer_destroyEntity(mineflayer_Entity * entity) {
    if (entity == NULL)
        return;

    if (entity->type == mineflayer_NamedPlayerEntity)
        mineflayer_destroyUtf8(entity->username);

    delete entity;
}

void mineflayer_destroyUtf8(mineflayer_Utf8 utf8) {
    delete[] utf8.utf8_bytes;
    utf8.utf8_bytes = NULL;
}


void mineflayer_setCallbacks(mineflayer_GamePtr _game, mineflayer_Callbacks callbacks, void * context)
{
    GameListener * game_listener = reinterpret_cast<GameListener *>(_game);
    if (!game_listener->batcher) {
        game_listener->s_cb = callbacks;
        game_listener->context = context;
    }
}

void mineflayer_start(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->start();
}

// call every frame passing it the amount of time since the last frame
void mineflayer_doPhysics(mineflayer_GamePtr _game, float delta_seconds) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->doPhysics(delta_seconds);
}

// equivalent to pressing a button.
void mineflayer_setControlActivated(mineflayer_GamePtr _game, mineflayer_Control control, bool activated) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->setControlActivated(control, activated);
}

// immediately emits a position update
void mineflayer_updatePlayerLook(mineflayer_GamePtr _game, float delta_yaw, float delta_pitch) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->updatePlayerLook(delta_yaw, delta_pitch);
}
void mineflayer_setPlayerLook(mineflayer_GamePtr _game, float yaw, float pitch, bool force) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->setPlayerLook(yaw, pitch, force);
}

// left-clicks an entity. no support for right-clicking entities yet.
void mineflayer_attackEntity(mineflayer_GamePtr _game, int entity_id) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->attackEntity(entity_id);
}

// only valid to call this after you die
void mineflayer_respawn(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->respawn();
}

int mineflayer_playerEntityId(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->playerEntityId();
}

mineflayer_EntityPosition mineflayer_playerPosition(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->playerPosition();
}
mineflayer_Entity * mineflayer_entity(mineflayer_GamePtr _game, int entity_id) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->entity(entity_id);
}

mineflayer_Block mineflayer_blockAt(mineflayer_GamePtr _game, mineflayer_Int3D absolute_location) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->blockAt(Int3D(absolute_location.x, absolute_location.y, absolute_location.z)).data;
}
bool mineflayer_isBlockLoaded(mineflayer_GamePtr _game, mineflayer_Int3D absolute_location) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->isBlockLoaded(Int3D(absolute_location.x, absolute_location.y, absolute_location.z));
}
void mineflayer_getMapData(mineflayer_GamePtr _game, mineflayer_Int3D min_corner, mineflayer_Int3D size, unsigned char * buffer) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->getMapData(Int3D(min_corner.x, min_corner.y, min_corner.z), Int3D(size.x, size.y, size.z), buffer);
}


mineflayer_Utf8 mineflayer_signTextAt(mineflayer_GamePtr _game, mineflayer_Int3D absolute_location) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return Util::toNewMfUtf8(game->signTextAt(Int3D(absolute_location.x, absolute_location.y, absolute_location.z)));

}
int mineflayer_playerHealth(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->playerHealth();
}

void mineflayer_startDigging(mineflayer_GamePtr _game, mineflayer_Int3D block) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->startDigging(Int3D(block.x, block.y, block.z));
}
void mineflayer_stopDigging(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->stopDigging();
}

bool mineflayer_placeBlock(mineflayer_GamePtr _game, mineflayer_Int3D block, mineflayer_BlockFaceDirection face) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->placeBlock(Int3D(block.x, block.y, block.z), face);
}

bool mineflayer_activateItem(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->activateItem();
}
bool mineflayer_canPlaceBlock(mineflayer_GamePtr _game, mineflayer_Int3D block, mineflayer_BlockFaceDirection face) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->canPlaceBlock(Int3D(block.x, block.y, block.z), face);
}
void mineflayer_activateBlock(mineflayer_GamePtr _game, mineflayer_Int3D block) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->activateBlock(Int3D(block.x, block.y, block.z));
}

void mineflayer_sendChat(mineflayer_GamePtr _game, mineflayer_Utf8 message) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->sendChat(Util::toQString(message));
}
double mineflayer_timeOfDay(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->timeOfDay();
}

int mineflayer_selectedEquipSlot(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->selectedEquipSlot();
}
void mineflayer_selectEquipSlot(mineflayer_GamePtr _game, int slot_id) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->selectEquipSlot(slot_id);
}

// blocks and returns success
bool mineflayer_clickInventorySlot(mineflayer_GamePtr _game, int slot_id, bool right_click) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->clickInventorySlot(slot_id, right_click);
}

bool mineflayer_clickUniqueSlot(mineflayer_GamePtr _game, int slot_id, bool right_click) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->clickUniqueSlot(slot_id, right_click);
}

bool mineflayer_clickOutsideWindow(mineflayer_GamePtr _game, bool right_click) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->clickOutsideWindow(right_click);
}

void mineflayer_openInventoryWindow(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->openInventoryWindow();
}
void mineflayer_closeWindow(mineflayer_GamePtr _game) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->closeWindow();
}

mineflayer_Item mineflayer_inventoryItem(mineflayer_GamePtr _game, int slot_id) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->inventoryItem(slot_id).data;
}
mineflayer_Item mineflayer_uniqueWindowItem(mineflayer_GamePtr _game, int slot_id) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->uniqueWindowItem(slot_id).data;
}

// if you want you can cheat and override the default physics settings:
void mineflayer_setInputAcceleration(mineflayer_GamePtr _game, float value) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->setInputAcceleration(value);
}
void mineflayer_setGravity(mineflayer_GamePtr _game, float value) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->setGravity(value);
}
void mineflayer_setMaxGroundSpeed(mineflayer_GamePtr _game, float value) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->setMaxGroundSpeed(value);
}

// this one is cheating
void mineflayer_setPlayerPosition(mineflayer_GamePtr _game, mineflayer_Double3D pt) {
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    game->setPlayerPosition(Double3D(pt.x, pt.y, pt.z));
}

mineflayer_ItemData * mineflayer_itemData(mineflayer_ItemType item_id) {
    return Item::itemData(item_id);
}

int * mineflayer_itemIdList() {
    QList<int> ids;
    const QHash<mineflayer_ItemType, mineflayer_ItemData*> * item_data_hash = Item::itemDataHash();
    for (QHash<mineflayer_ItemType, mineflayer_ItemData*>::const_iterator it = item_data_hash->constBegin();
        it != item_data_hash->constEnd(); ++it)
    {
        ids.append(it.key());
    }
    int * return_val = new int[ids.size()+1];
    return_val[0] = ids.count();
    for (int i = 0; i < ids.size(); i++) {
        return_val[1+i] = ids.at(i);
    }
    return return_val;
}

void mineflayer_destroyItemIdList(int * item_id_list) {
    delete[] item_id_list;
}


void mineflayer_setJesusModeEnabled(bool value) {
    Item::setJesusModeEnabled(value);
}

float mineflayer_getStandardGravity() {
    return Game::c_standard_gravity;
}

mineflayer_Dimension mineflayer_currentDimension(mineflayer_GamePtr _game)
{
    Game * game = (reinterpret_cast<GameListener *>(_game))->game;
    return game->dimension();
}
