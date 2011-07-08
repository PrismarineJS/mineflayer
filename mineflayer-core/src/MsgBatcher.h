#ifndef MSGBATCHER_H
#define MSGBATCHER_H

#include "mineflayer-core.h"

#if defined(__cplusplus)
extern "C" {
#endif

typedef enum {
	msg_TypeChatReceived,
	msg_TypeTimeUpdated,
	msg_TypeNonSpokenChatReceived,
	msg_TypeEntitySpawned,
	msg_TypeEntityDespawned,
	msg_TypeEntityMoved,
	msg_TypeAnimation,
	msg_TypeChunkUpdated,
	msg_TypeUnloadChunk,
	msg_TypeSignUpdated,
	msg_TypePlayerPositionUpdated,
	msg_TypePlayerHealthUpdated,
	msg_TypePlayerDied,
	msg_TypePlayerSpawned,
	msg_TypeStoppedDigging,
	msg_TypeLoginStatusUpdated,
	msg_TypeWindowOpened,
	msg_TypeInventoryUpdated,
	msg_TypeEquippedItemChanged,
} msg_Type;

typedef struct msg_Base {
	msg_Type type;
	struct msg_Base *next;
} msg_Base;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Utf8 username;
	mineflayer_Utf8 message;
} msg_ChatReceived;

typedef struct {
	msg_Type type;
	msg_Base *next;
	double seconds;
} msg_TimeUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Utf8 message;
} msg_NonSpokenChatReceived;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Entity mineflayer_entity;
} msg_EntitySpawned;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Entity mineflayer_entity;
} msg_EntityDespawned;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Entity mineflayer_entity;
} msg_EntityMoved;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Entity mineflayer_entity;
	mineflayer_AnimationType animation_type;
} msg_Animation;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Int3D start;
	mineflayer_Int3D size;
} msg_ChunkUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Int3D coord;
} msg_UnloadChunk;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_Int3D location;
	mineflayer_Utf8 text;
} msg_SignUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;

} msg_PlayerPositionUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;
} msg_PlayerHealthUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;
} msg_PlayerDied;

typedef struct {
	msg_Type type;
	msg_Base *next;
	int world;
} msg_PlayerSpawned;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_StoppedDiggingReason reason;
} msg_StoppedDigging;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_LoginStatus status;
} msg_LoginStatusUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;
	mineflayer_WindowType window_type;
} msg_WindowOpened;

typedef struct {
	msg_Type type;
	msg_Base *next;
} msg_InventoryUpdated;

typedef struct {
	msg_Type type;
	msg_Base *next;
} msg_EquippedItemChanged;

typedef union {
	msg_Base base;
	msg_ChatReceived chatReceived;
	msg_TimeUpdated timeUpdated;
	msg_NonSpokenChatReceived nonSpokenChatReceived;
	msg_EntitySpawned entitySpawned;
	msg_EntityDespawned entityDespawned;
	msg_EntityMoved entityMoved;
	msg_Animation animation;
	msg_ChunkUpdated chunkUpdated;
	msg_UnloadChunk unloadChunk;
	msg_SignUpdated signUpdated;
	msg_PlayerPositionUpdated playerPositionUpdated;
	msg_PlayerHealthUpdated playerHealthUpdated;
	msg_PlayerDied playerDied;
	msg_PlayerSpawned playerSpawned;
	msg_StoppedDigging stoppedDigging;
	msg_LoginStatusUpdated loginStatusUpdated;
	msg_WindowOpened windowOpened;
	msg_InventoryUpdated inventoryUpdated;
	msg_EquippedItemChanged equippedItemChanged;
} msg_Union;

#if defined(__cplusplus)
}
#endif


#include <QMutex>
#include <QMutexLocker>

class Batcher
{
private:
    mutable QMutex m_mutex;
    msg_Base *m_first;
    msg_Base *m_last;

public:
    Batcher();

    void msgEmit(mineflayer_Callbacks *callbacks, void *ctx);
    void update(const mineflayer_Callbacks *filter,
                mineflayer_Callbacks *out);

    msg_Base * msgNew();
    void msgDone(msg_Base *msg);
    void msgFree(msg_Base *msg);

private:
    msg_Base * msgGet();
};


#endif // MSGBATCHER_H
