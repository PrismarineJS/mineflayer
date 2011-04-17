#ifndef GAME_H
#define GAME_H

#include "Server.h"
#include "Block.h"

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
    // must be valid array indexes
    enum Control {
        NoControl,
        Forward,
        Back,
        Left,
        Right,
        Jump,
        Crouch,
        DiscardItem,
        Action1, // left click
        Action2, // right click
        Inventory,
        Chat,

        ControlCount
    };
    enum StoppedDiggingReason {
        BlockBroken=0,
        Aborted=1,
    };
    class Entity {
    public:
        enum EntityType {
            NamedPlayer = 1,
            // TODO: ObjectOrVehicle,
            Mob = 3,
            Pickup = 4,
        };
        const EntityType type;
        int entity_id;
        Server::EntityPosition position;
        virtual ~Entity() {}
        virtual Entity * clone() = 0;
        virtual void getBoundingBox(Int3D & boundingBoxMin, Int3D & boundingBoxMax) const = 0;
    protected:
        Entity(EntityType type, int entity_id, Server::EntityPosition position) :
                type(type), entity_id(entity_id), position(position) {}
    };
    class NamedPlayerEntity : public Entity {
    public:
        const QString username;
        Item::ItemType held_item;
        NamedPlayerEntity(int entity_id, Server::EntityPosition position, QString username, Item::ItemType held_item) :
                Entity(NamedPlayer, entity_id, position), username(username), held_item(held_item) {}
        Entity * clone() { return new NamedPlayerEntity(entity_id, position, username, held_item); }
        void getBoundingBox(Int3D &boundingBoxMin, Int3D &boundingBoxMax) const;
    };
    class MobEntity : public Entity {
    public:
        const MobSpawnResponse::MobType mob_type;
        MobEntity(int entity_id, Server::EntityPosition position, MobSpawnResponse::MobType mob_type) :
                Entity(Mob, entity_id, position), mob_type(mob_type) {}
        Entity * clone() { return new MobEntity(entity_id, position, mob_type); }
        void getBoundingBox(Int3D &boundingBoxMin, Int3D &boundingBoxMax) const;
    };
    class PickupEntity : public Entity {
    public:
        const Item item;
        PickupEntity(int entity_id, Server::EntityPosition position, Item item) :
                Entity(Pickup, entity_id, position), item(item) {}
        Entity * clone() { return new PickupEntity(entity_id, position, item); }
        void getBoundingBox(Int3D &boundingBoxMin, Int3D &boundingBoxMax) const;
    };

    static const float c_standard_max_ground_speed; // m/s
    static const float c_standard_terminal_velocity; // m/s
    static const float c_standard_walking_acceleration; // m/s/s
    static const float c_standard_gravity; // m/s/s
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

public:
    Game(QUrl connection_info);

    void start();

    // call every frame passing it the amount of time since the last frame
    void doPhysics(float delta_seconds);

    // equivalent to pressing a button.
    void setControlActivated(Control control, bool activated = true);

    // immediately emits a position update
    void updatePlayerLook(float delta_yaw, float delta_pitch);
    void setPlayerLook(float yaw, float pitch, bool force);

    // left-clicks an entity. no support for right-clicking entities yet.
    void attackEntity(int entity_id);

    // only valid to call this after you die
    void respawn();

    int playerEntityId() const { QMutexLocker locker(&m_mutex); return m_player.entity_id; }
    Server::EntityPosition playerPosition();
    QSharedPointer<Entity> entity(int entity_id);

    Block blockAt(const Int3D & absolute_location);
    bool isBlockLoaded(const Int3D & absolute_location);
    QString signTextAt(const Int3D & absolute_location);
    int playerHealth() { return m_player_health; }

    void startDigging(const Int3D &block);
    void stopDigging();

    // returns whether you're equipped with a proper item
    bool placeBlock(const Int3D &block, Message::BlockFaceDirection face);
    // returns whether you're equipped with a proper item
    bool activateItem();
    bool canPlaceBlock(const Int3D &block, Message::BlockFaceDirection face);
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

    Item inventoryItem(int slot_id) const; // [0, 35]
    Item uniqueWindowItem(int slot_id) const;

    // if you want you can cheat and override the default physics settings:
    void setInputAcceleration(float value) { QMutexLocker locker(&m_mutex); m_input_acceleration = value; }
    void setGravity(float value) { QMutexLocker locker(&m_mutex); m_gravity = value; }
    void setMaxGroundSpeed(float value) { QMutexLocker locker(&m_mutex); m_max_ground_speed = value; }

    // this one is cheating
    void setPlayerPosition(const Double3D & pt);

signals:
    void chatReceived(QString username, QString message);
    void timeUpdated(double seconds);
    void nonSpokenChatReceived(QString message);

    void entitySpawned(QSharedPointer<Game::Entity> entity);
    void entityDespawned(QSharedPointer<Game::Entity> entity);
    void entityMoved(QSharedPointer<Game::Entity> entity);
    void animation(QSharedPointer<Game::Entity> entity, Message::AnimationType animation_type);

    void chunkUpdated(const Int3D &start, const Int3D &size);
    void unloadChunk(const Int3D & coord);
    void signUpdated(const Int3D &location, QString text);
    void playerPositionUpdated();
    void playerHealthUpdated();
    void playerDied();
    void playerSpawned();
    void stoppedDigging(Game::StoppedDiggingReason reason);
    void loginStatusUpdated(Server::LoginStatus status);

    void windowOpened(Message::WindowType);

    void inventoryUpdated();
    void equippedItemChanged();

private:
    mutable QMutex m_mutex;

    static const Int3D c_chunk_size;
    static const Block c_air;
    static const Int3D c_side_offset[];

    Server m_server;

    QSet<QChar> m_legal_chat_chars;

    QTimer * m_position_update_timer;
    Int3D m_digging_location;
    Digger * m_digger;
    bool m_waiting_for_dig_confirmation;
    QTimer * m_digging_animation_timer;

    NamedPlayerEntity m_player;
    float m_last_sent_yaw;
    QTime m_last_position_sent_time;
    int m_player_health;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;
    QHash<Int3D, QString> m_signs;
    QHash<int, QSharedPointer<Entity> > m_entities;
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
    Message::WindowType m_open_window_type;

    QMutex m_click_mutex;
    QWaitCondition m_click_wait_condition;
    bool m_click_success;

private:
    static Int3D chunkKey(const Int3D & coord);

    float groundSpeedSquared() const { return m_player.position.vel.x * m_player.position.vel.x +
                                 m_player.position.vel.y * m_player.position.vel.y; }
    bool collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax);

    int nextActionId();

    void updateWindowSlot(int slot_id, Item item);
    Item getWindowSlot(int slot);

    void updateBlock(const Int3D & absolute_location, Block new_block);
    bool entityCollidesWithPoint(const Entity * entity, const Int3D & point);

    bool doWindowClick(const WindowClick & window_click);

    _Item::Recipe buildRecipeForItems(QVector<Item> items, QSize size);

private slots:
    void handleLoginStatusChanged(Server::LoginStatus status);
    void handleLoginCompleted(int entity_id);
    void handleChatReceived(QString content);
    void handleTimeUpdated(double seconds);
    void handlePlayerPositionAndLookUpdated(Server::EntityPosition position);
    void handlePlayerHealthUpdated(int new_health);
    void handleUnloadChunk(const Int3D & coord);

    void handleNamedPlayerSpawned(int entity_id, QString player_name, Server::EntityPosition position, Item::ItemType held_item);
    void handlePickupSpawned(int entity_id, Item item, Server::EntityPosition position);
    void handleMobSpawned(int entity_id, MobSpawnResponse::MobType mob_type, Server::EntityPosition position);
    void handleEntityDestroyed(int entity_id);
    void handleEntityMovedRelatively(int entity_id, Server::EntityPosition movement);
    void handleEntityLooked(int entity_id, Server::EntityPosition look);
    void handleEntityLookedAndMovedRelatively(int entity_id, Server::EntityPosition position);
    void handleEntityMoved(int entity_id, Server::EntityPosition position);
    void handleAnimation(int entity_id, Message::AnimationType animation_type);

    void handleMapChunkUpdated(QSharedPointer<Chunk> update);
    void handleMultiBlockUpdate(Int3D chunk_key, QHash<Int3D,Block> new_blocks);
    void handleBlockUpdate(Int3D absolute_location, Block new_block);
    void handleSignUpdate(Int3D absolute_location, QString text);

    void handleWindowItemsUpdated(int window_id, QVector<Item> items);
    void handleWindowSlotUpdated(int window_id, int slot, Item item);
    void handleHoldingChange(int slot_id);
    void handleTransaction(int window_id, int action_id, bool accepted);
    void handleOpenWindow(int window_id, Message::WindowType inventory_type, int number_of_slots);

    void sendPosition();
    void animateDigging();

    void checkForDiggingStopped(const Int3D &start, const Int3D &size);
    void checkForDestroyedSigns(const Int3D &start, const Int3D &size);

};

#endif // GAME_H
