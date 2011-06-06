#include "mineflayer-core.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#include "MsgBatcher.h"

#include "Util.h"

Batcher::Batcher() :
m_mutex(QMutex::Recursive),
m_first(NULL),
m_last(NULL)
{

}

msg_Base * Batcher::msgGet()
{
    msg_Base *ret;

    QMutexLocker locker(&m_mutex);

    ret = m_first;
    m_first = NULL;
    m_last = NULL;

    return ret;
}




msg_Base * Batcher::msgNew()
{
	return (msg_Base *)calloc(1, sizeof(msg_Union));
}

void Batcher::msgDone(msg_Base *msg)
{
	QMutexLocker locker(&m_mutex);

	if (!m_first) {
		m_first = msg;
		m_last = msg;
	} else {
		m_last->next = msg;
		m_last = msg;
	}
}

void Batcher::msgFree(msg_Base *msg)
{
    free(msg);
}

/**
 * Dispatch a single message
 */
static void dispatchMsg(Batcher *batcher, msg_Base *base,
			mineflayer_Callbacks *callbacks, void *ctx);

void Batcher::msgEmit(mineflayer_Callbacks *callbacks,
                      void *ctx)
{
    msg_Base *m = NULL, *next = NULL;

    for(m = msgGet(); m; m = next) {
        next = m->next;
        dispatchMsg(this, m, callbacks, ctx);
    }
}


/*
 *
 * Callback functions
 *
 */


/**
 * chatReceived
 */
void chatReceived(void * context, mineflayer_Utf8 username,
        mineflayer_Utf8 message)
{
    Batcher *batcher = (Batcher*)context;
    msg_ChatReceived *msg;

    msg = (msg_ChatReceived *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeChatReceived;
    msg->username = Util::copyMfUtf8(username);
    msg->message = Util::copyMfUtf8(message);
}

/**
 * timeUpdated
 */
void timeUpdated(void * context, double seconds)
{
    Batcher *batcher = (Batcher*)context;
    msg_TimeUpdated *msg;

    msg = (msg_TimeUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeTimeUpdated;
    msg->seconds = seconds;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * nonSpokenChatReceived
 */
void nonSpokenChatReceived(void * context, mineflayer_Utf8 message)
{
    Batcher *batcher = (Batcher*)context;
    msg_NonSpokenChatReceived *msg;

    msg = (msg_NonSpokenChatReceived *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeNonSpokenChatReceived;
    msg->message = Util::copyMfUtf8(message);

    batcher->msgDone((msg_Base *)msg);
}

/**
 * entitySpawned
 */
void entitySpawned(void * context, mineflayer_Entity * mineflayer_entity)
{
    Batcher *batcher = (Batcher*)context;
    msg_EntitySpawned *msg;

    msg = (msg_EntitySpawned *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeEntitySpawned;
    msg->mineflayer_entity = *mineflayer_entity;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * entityDespawned
 */
void entityDespawned(void * context, mineflayer_Entity * mineflayer_entity)
{
    Batcher *batcher = (Batcher*)context;
    msg_EntityDespawned *msg;

    msg = (msg_EntityDespawned *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeEntityDespawned;
    msg->mineflayer_entity = *mineflayer_entity;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * entityMoved
 */
void entityMoved(void * context, mineflayer_Entity * mineflayer_entity)
{
    Batcher *batcher = (Batcher*)context;
    msg_EntityMoved *msg;

    msg = (msg_EntityMoved *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeEntityMoved;
    msg->mineflayer_entity = *mineflayer_entity;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * animation
 */
void animation(void * context,
        mineflayer_Entity * mineflayer_entity,
        mineflayer_AnimationType animation_type)
{
    Batcher *batcher = (Batcher*)context;
    msg_Animation *msg;

    msg = (msg_Animation *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeAnimation;
    msg->mineflayer_entity = *mineflayer_entity;
    msg->animation_type = animation_type;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * chunkUpdated
 */
void chunkUpdated(void * context, mineflayer_Int3D start, mineflayer_Int3D size)
{
    Batcher *batcher = (Batcher*)context;
    msg_ChunkUpdated *msg;

    msg = (msg_ChunkUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeChunkUpdated;
    msg->start = start;
    msg->size = size;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * unloadChunk
 */
void unloadChunk(void * context, mineflayer_Int3D coord)
{
    Batcher *batcher = (Batcher*)context;
    msg_UnloadChunk *msg;

    msg = (msg_UnloadChunk *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeUnloadChunk;
    msg->coord = coord;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * signUpdated
 */
void signUpdated(void * context, mineflayer_Int3D location, mineflayer_Utf8 text)
{
    Batcher *batcher = (Batcher*)context;
    msg_SignUpdated *msg;

    msg = (msg_SignUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeSignUpdated;
    msg->location = location;
    msg->text = Util::copyMfUtf8(text);

    batcher->msgDone((msg_Base *)msg);
}

/**
 * playerPositionUpdated
 */
void playerPositionUpdated(void * context)
{
    Batcher *batcher = (Batcher*)context;
    msg_PlayerPositionUpdated *msg;

    msg = (msg_PlayerPositionUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypePlayerPositionUpdated;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * playerHealthUpdated
 */
void playerHealthUpdated(void * context)
{
    Batcher *batcher = (Batcher*)context;
    msg_PlayerHealthUpdated *msg;

    msg = (msg_PlayerHealthUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypePlayerHealthUpdated;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * playerDied
 */
void playerDied(void * context)
{
    Batcher *batcher = (Batcher*)context;
    msg_PlayerDied *msg;

    msg = (msg_PlayerDied *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypePlayerDied;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * playerSpawned
 */
void playerSpawned(void * context, int world)
{
    Batcher *batcher = (Batcher*)context;
    msg_PlayerSpawned *msg;

    msg = (msg_PlayerSpawned *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypePlayerSpawned;
    msg->world = world;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * stoppedDigging
 */
void stoppedDigging(void * context, mineflayer_StoppedDiggingReason reason)
{
    Batcher *batcher = (Batcher*)context;
    msg_StoppedDigging *msg;

    msg = (msg_StoppedDigging *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeStoppedDigging;
    msg->reason = reason;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * loginStatusUpdated
 */
void loginStatusUpdated(void * context, mineflayer_LoginStatus status)
{
    Batcher *batcher = (Batcher*)context;
    msg_LoginStatusUpdated *msg;

    msg = (msg_LoginStatusUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeLoginStatusUpdated;
    msg->status = status;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * windowOpened
 */
void windowOpened(void * context, mineflayer_WindowType window_type)
{
    Batcher *batcher = (Batcher*)context;
    msg_WindowOpened *msg;

    msg = (msg_WindowOpened *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeWindowOpened;
    msg->window_type = window_type;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * inventoryUpdated
 */
void inventoryUpdated(void * context)
{
    Batcher *batcher = (Batcher*)context;
    msg_InventoryUpdated *msg;

    msg = (msg_InventoryUpdated *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeInventoryUpdated;

    batcher->msgDone((msg_Base *)msg);
}

/**
 * equippedItemChanged
 */
void equippedItemChanged(void * context)
{
    Batcher *batcher = (Batcher*)context;
    msg_EquippedItemChanged *msg;

    msg = (msg_EquippedItemChanged *)batcher->msgNew();
    if (!msg)
        return;

    msg->type = msg_TypeEquippedItemChanged;

    batcher->msgDone((msg_Base *)msg);
}


/*
 *
 * The rest.
 *
 */


void Batcher::update(const mineflayer_Callbacks *incb,
        mineflayer_Callbacks *outcb)
{
    if (!outcb)
        return;

    memset(outcb, 0, sizeof(mineflayer_Callbacks));

    if (!incb)
        return;

    if (incb->chatReceived)
        outcb->chatReceived = chatReceived;
    if (incb->timeUpdated)
        outcb->timeUpdated = timeUpdated;
    if (incb->nonSpokenChatReceived)
        outcb->nonSpokenChatReceived = nonSpokenChatReceived;
    if (incb->entitySpawned)
        outcb->entitySpawned = entitySpawned;
    if (incb->entityDespawned)
        outcb->entityDespawned = entityDespawned;
    if (incb->entityMoved)
        outcb->entityMoved = entityMoved;
    if (incb->animation)
        outcb->animation = animation;
    if (incb->chunkUpdated)
        outcb->chunkUpdated = chunkUpdated;
    if (incb->unloadChunk)
        outcb->unloadChunk = unloadChunk;
    if (incb->signUpdated)
        outcb->signUpdated = signUpdated;
    if (incb->playerPositionUpdated)
        outcb->playerPositionUpdated = playerPositionUpdated;
    if (incb->playerHealthUpdated)
        outcb->playerHealthUpdated = playerHealthUpdated;
    if (incb->playerDied)
        outcb->playerDied = playerDied;
    if (incb->playerSpawned)
        outcb->playerSpawned = playerSpawned;
    if (incb->stoppedDigging)
        outcb->stoppedDigging = stoppedDigging;
    if (incb->loginStatusUpdated)
        outcb->loginStatusUpdated = loginStatusUpdated;
    if (incb->windowOpened)
        outcb->windowOpened = windowOpened;
    if (incb->inventoryUpdated)
        outcb->inventoryUpdated = inventoryUpdated;
    if (incb->equippedItemChanged)
        outcb->equippedItemChanged = equippedItemChanged;
}

static void dispatchMsg(Batcher *batcher, msg_Base *base,
			mineflayer_Callbacks *callbacks, void *ctx)
{
    switch(base->type) {
        case msg_TypeChatReceived: {
            msg_ChatReceived *msg = (msg_ChatReceived *)base;
            callbacks->chatReceived(ctx, msg->username, msg->message);
            mineflayer_destroyUtf8(msg->username);
            mineflayer_destroyUtf8(msg->message);
            break;
        }
        case msg_TypeTimeUpdated: {
            msg_TimeUpdated *msg = (msg_TimeUpdated *)base;
            callbacks->timeUpdated(ctx, msg->seconds);
            break;
        }
        case msg_TypeNonSpokenChatReceived: {
            msg_NonSpokenChatReceived *msg = (msg_NonSpokenChatReceived *)base;
            callbacks->nonSpokenChatReceived(ctx, msg->message);
            mineflayer_destroyUtf8(msg->message);
            assert(0);
            break;
        }
        case msg_TypeEntitySpawned: {
            msg_EntitySpawned *msg = (msg_EntitySpawned *)base;
            callbacks->entitySpawned(ctx, &msg->mineflayer_entity);
            break;
        }
        case msg_TypeEntityDespawned: {
            msg_EntityDespawned *msg = (msg_EntityDespawned *)base;
            callbacks->entityDespawned(ctx, &msg->mineflayer_entity);
            break;
        }
        case msg_TypeEntityMoved: {
            msg_EntityMoved *msg = (msg_EntityMoved *)base;
            callbacks->entityMoved(ctx, &msg->mineflayer_entity);
            break;
        }
        case msg_TypeAnimation: {
            msg_Animation *msg = (msg_Animation *)base;
            callbacks->animation(ctx, &msg->mineflayer_entity, msg->animation_type);
            break;
        }
        case msg_TypeChunkUpdated: {
            msg_ChunkUpdated *msg = (msg_ChunkUpdated *)base;
            callbacks->chunkUpdated(ctx, msg->start, msg->size);
            break;
        }
        case msg_TypeUnloadChunk: {
            msg_UnloadChunk *msg = (msg_UnloadChunk *)base;
            callbacks->unloadChunk(ctx, msg->coord);
            break;
        }
        case msg_TypeSignUpdated: {
            msg_SignUpdated *msg = (msg_SignUpdated *)base;
            callbacks->signUpdated(ctx, msg->location, msg->text);
            mineflayer_destroyUtf8(msg->text);
            break;
        }
        case msg_TypePlayerPositionUpdated: {
            msg_PlayerPositionUpdated *msg = (msg_PlayerPositionUpdated *)base;
            (void)msg;
            callbacks->playerPositionUpdated(ctx);
            break;
        }
        case msg_TypePlayerHealthUpdated: {
            msg_PlayerHealthUpdated *msg = (msg_PlayerHealthUpdated *)base;
            (void)msg;
            callbacks->playerHealthUpdated(ctx);
            break;
        }
        case msg_TypePlayerDied: {
            msg_PlayerDied *msg = (msg_PlayerDied *)base;
            (void)msg;
            callbacks->playerDied(ctx);
            break;
        }
        case msg_TypePlayerSpawned: {
            msg_PlayerSpawned *msg = (msg_PlayerSpawned *)base;
            callbacks->playerSpawned(ctx, msg->world);
            break;
        }
        case msg_TypeStoppedDigging: {
            msg_StoppedDigging *msg = (msg_StoppedDigging *)base;
            callbacks->stoppedDigging(ctx, msg->reason);
            break;
        }
        case msg_TypeLoginStatusUpdated: {
            msg_LoginStatusUpdated *msg = (msg_LoginStatusUpdated *)base;
            callbacks->loginStatusUpdated(ctx, msg->status);
            break;
        }
        case msg_TypeWindowOpened: {
            msg_WindowOpened *msg = (msg_WindowOpened *)base;
            callbacks->windowOpened(ctx, msg->window_type);
            break;
        }
        case msg_TypeInventoryUpdated: {
            msg_InventoryUpdated *msg = (msg_InventoryUpdated *)base;
            (void)msg;
            callbacks->inventoryUpdated(ctx);
            break;
        }
        case msg_TypeEquippedItemChanged: {
            msg_EquippedItemChanged *msg = (msg_EquippedItemChanged *)base;
            (void)msg;
            callbacks->equippedItemChanged(ctx);
            break;
        }
        default:
            assert(0);
            break;
    }

    batcher->msgFree(base);
}
