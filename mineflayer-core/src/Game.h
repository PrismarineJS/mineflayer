#ifndef GAME_H
#define GAME_H

#include "Server.h"
#include "Block.h"
#include "mineflayer-core.h"

#include <QMutex>
#include <QMutexLocker>
#include <QQueue>
#include <QWaitCondition>
#include <QTime>
#include <QSet>

class Digger;

// This class is thread-safe.
class Game : public QObject
{
    Q_OBJECT
public:
    Game(QUrl connection_info);

    void start();

    // call every frame passing it the amount of time since the last frame
    void doPhysics(float delta_seconds);

    // equivalent to pressing a button.
    void setControlActivated(mineflayer_Control control, bool activated = true);

    // immediately emits a position update
    void updatePlayerLook(float delta_yaw, float delta_pitch);
    void setPlayerLook(float yaw, float pitch, bool force);

    // left-clicks an entity. no support for right-clicking entities yet.
    void attackEntity(int entity_id);

    // only valid to call this after you die
    void respawn();

    int playerEntityId() const { QMutexLocker locker(&m_mutex); return m_player.entity_id; }
    mineflayer_EntityPosition playerPosition();

    // you must call mineflayer_destroyEntity when done with this.
    mineflayer_Entity * entity(int entity_id);

    Block blockAt(const Int3D & absolute_location);
    bool isBlockLoaded(const Int3D & absolute_location);
    QString signTextAt(const Int3D & absolute_location);
    int playerHealth() { return m_player_health; }

    void startDigging(const Int3D &block);
    void stopDigging();

    // returns whether you're equipped with a proper item
    bool placeBlock(const Int3D &block, mineflayer_BlockFaceDirection face);
    // returns whether you're equipped with a proper item
    bool activateItem();
    bool canPlaceBlock(const Int3D &block, mineflayer_BlockFaceDirection face);
    void activateBlock(const Int3D &block);

    void sendChat(QString message);
    double timeOfDay();

    int selectedEquipSlot() const { QMutexLocker locker(&m_mutex); return m_equipped_slot_id; }
    void selectEquipSlot(int slot_id); // [27, 35]

    // blocks and returns success
    bool clickInventorySlot(int slot_id, bool right_click); // slot_id [0, 35]
    bool clickUniqueSlot(int slot_id, bool right_click); // slot_id range depends on window
    bool clickOutsideWindow(bool right_click);

    void openInventoryWindow();
    void closeWindow();
    mineflayer_WindowType getOpenWindow();

    Item inventoryItem(int slot_id) const; // [0, 35]
    Item uniqueWindowItem(int slot_id) const;

    // if you want you can cheat and override the default physics settings:
    void setInputAcceleration(float value) { QMutexLocker locker(&m_mutex); m_input_acceleration = value; }
    void setGravity(float value) { QMutexLocker locker(&m_mutex); m_gravity = value; }
    void setMaxGroundSpeed(float value) { QMutexLocker locker(&m_mutex); m_max_ground_speed = value; }

    // this one is cheating
    void setPlayerPosition(const Double3D & pt);

    mineflayer_Dimension dimension() const { return m_player_dimension; }


    static const float c_standard_gravity; // m/s/s

signals:
    void chatReceived(QString username, QString message);
    void timeUpdated(double seconds);
    void nonSpokenChatReceived(QString message);

    void entitySpawned(mineflayer_Entity * entity);
    void entityDespawned(mineflayer_Entity * entity);
    void entityMoved(mineflayer_Entity * entity);
    void animation(mineflayer_Entity * entity, mineflayer_AnimationType animation_type);

    void chunkUpdated(const Int3D &start, const Int3D &size);
    void unloadChunk(const Int3D &coord);
    void signUpdated(const Int3D &location, QString text);
    void playerPositionUpdated();
    void playerHealthUpdated();
    void playerDied();
    void playerSpawned(int world);
    void stoppedDigging(mineflayer_StoppedDiggingReason reason);
    void loginStatusUpdated(mineflayer_LoginStatus status);

    void windowOpened(mineflayer_WindowType);

    void inventoryUpdated();
    void equippedItemChanged();

private:
    mutable QMutex m_mutex;

    static const Int3D c_chunk_size;
    static const Block c_air;
    static const Int3D c_side_offset[];


    static const float c_standard_max_ground_speed; // m/s
    static const float c_standard_terminal_velocity; // m/s
    static const float c_standard_walking_acceleration; // m/s/s
    static const float c_standard_ground_friction; // m/s/s
    static const float c_player_apothem;
    static const float c_player_height;
    static const float c_player_half_height;
    static const float c_jump_speed;
    static const float c_yaw_speed; // rad/s
    static const int c_chat_length_limit;
    static const int c_position_update_interval_ms;

    static const int c_inventory_count;
    static const int c_inventory_window_unique_count;

    static const int c_outside_window_slot;


    Server m_server;

    QSet<QChar> m_legal_chat_chars;

    QTimer * m_position_update_timer;
    Int3D m_digging_location;
    Digger * m_digger;
    bool m_waiting_for_dig_confirmation;
    QTimer * m_digging_animation_timer;

    mineflayer_Entity m_player;
    float m_last_sent_yaw;
    QTime m_last_position_sent_time;
    int m_player_health;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;
    QHash<Int3D, QString> m_signs;
    QHash<int, mineflayer_Entity * > m_entities;
    double m_current_time_seconds;
    QTime m_current_time_recorded_time;

    float m_max_ground_speed;
    float m_terminal_velocity;
    float m_input_acceleration;
    float m_gravity;
    float m_ground_friction;

    QVector<bool> m_control_state;
    bool m_jump_was_pressed;

    int m_return_code;

    QVector<Item> m_inventory; // indexed from [0, 36)
    QVector<Item> m_unique_slots; // indexing depends on which window is open
    qint16 m_next_action_id;
    int m_equipped_slot_id; // [0, 9)

    int m_open_window_id;

    // held, as in, you left clicked an item in your inventory window
    Item m_held_item;

    struct WindowClick {
        int id;
        int slot;
        bool right_click;
        Item item;

        WindowClick(): id(0), slot(0), right_click(false), item() {}
        WindowClick(int _id, int _slot, bool _right_click, Item _item) :
                id(_id), slot(_slot), right_click(_right_click), item(_item) {}
    };

    QQueue<WindowClick> m_window_click_queue;

    bool m_need_to_emit_window_opened;
    mineflayer_WindowType m_open_window_type;

    QMutex m_click_mutex;
    QWaitCondition m_click_wait_condition;
    bool m_click_success;

    mineflayer_Dimension m_player_dimension;

private:
    static Int3D chunkKey(const Int3D & coord);

    float groundSpeedSquared() const { return m_player.position.vel.x * m_player.position.vel.x +
                                 m_player.position.vel.y * m_player.position.vel.y; }
    bool collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax);

    int nextActionId();

    void updateWindowSlot(int slot_id, Item item);
    Item getWindowSlot(int slot);

    void updateBlock(const Int3D & absolute_location, Block new_block);
    bool entityCollidesWithPoint(const mineflayer_Entity * entity, const Int3D & point);

    bool doWindowClick(const WindowClick & window_click);

    _Item::Recipe buildRecipeForItems(QVector<Item> items, QSize size);

private slots:
    void handleLoginStatusChanged(mineflayer_LoginStatus status);
    void handleLoginCompleted(int entity_id);
    void handleChatReceived(QString content);
    void handleTimeUpdated(double seconds);
    void handlePlayerPositionAndLookUpdated(mineflayer_EntityPosition position);
    void handlePlayerHealthUpdated(int new_health);
    void handleUnloadChunk(const Int3D & coord);

    void handleNamedPlayerSpawned(int entity_id, QString player_name, mineflayer_EntityPosition position, mineflayer_ItemType held_item);
    void handlePickupSpawned(int entity_id, Item item, mineflayer_EntityPosition position);
    void handleMobSpawned(int entity_id, mineflayer_MobType mob_type, mineflayer_EntityPosition position);
    void handleEntityDestroyed(int entity_id);
    void handleEntityMovedRelatively(int entity_id, mineflayer_EntityPosition movement);
    void handleEntityLooked(int entity_id, mineflayer_EntityPosition look);
    void handleEntityLookedAndMovedRelatively(int entity_id, mineflayer_EntityPosition position);
    void handleEntityMoved(int entity_id, mineflayer_EntityPosition position);
    void handleAnimation(int entity_id, mineflayer_AnimationType animation_type);

    void handleMapChunkUpdated(QSharedPointer<Chunk> update);
    void handleMultiBlockUpdate(Int3D chunk_key, QHash<Int3D,Block> new_blocks);
    void handleBlockUpdate(Int3D absolute_location, Block new_block);
    void handleSignUpdate(Int3D absolute_location, QString text);

    void handleWindowItemsUpdated(int window_id, QVector<Item> items);
    void handleWindowSlotUpdated(int window_id, int slot, Item item);
    void handleHoldingChange(int slot_id);
    void handleTransaction(int window_id, int action_id, bool accepted);
    void handleOpenWindow(int window_id, mineflayer_WindowType inventory_type, int number_of_slots);

    void handleRespawn(mineflayer_Dimension world);

    void sendPosition();
    void animateDigging();

    void checkForDiggingStopped(const Int3D &start, const Int3D &size);
    void checkForDestroyedSigns(const Int3D &start, const Int3D &size);
    void sendDiggingComplete();

    void getBoundingBox(const mineflayer_Entity *player, Int3D &boundingBoxMin, Int3D &boundingBoxMax) const;

};

#endif // GAME_H
