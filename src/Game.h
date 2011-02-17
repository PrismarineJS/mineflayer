#ifndef GAME_H
#define GAME_H

#include "Server.h"
#include "Block.h"

#include <QMutex>
#include <QMutexLocker>

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
        const int entity_id;
        Server::EntityPosition position;
        virtual ~Entity() {}
        virtual Entity * clone() = 0;
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
    };
    class MobEntity : public Entity {
    public:
        const MobSpawnResponse::MobType mob_type;
        MobEntity(int entity_id, Server::EntityPosition position, MobSpawnResponse::MobType mob_type) :
                Entity(Mob, entity_id, position), mob_type(mob_type) {}
        Entity * clone() { return new MobEntity(entity_id, position, mob_type); }
    };
    class PickupEntity : public Entity {
    public:
        const Item item;
        PickupEntity(int entity_id, Server::EntityPosition position, Item item) :
                Entity(Pickup, entity_id, position), item(item) {}
        Entity * clone() { return new PickupEntity(entity_id, position, item); }
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
    static const int c_chat_length_limit;

public:
    Game(QUrl connection_info);
    ~Game();


    // call every frame passing it the amount of time since the last frame
    void start();
    void shutdown(int return_code);
    void doPhysics(float delta_seconds);

    // equivalent to pressing a button.
    void setControlActivated(Control control, bool activated = true);
    // immediately emits a position update
    void updatePlayerLook(float delta_yaw, float delta_pitch);
    void setPlayerLook(float yaw, float pitch);
    // this one is cheating
    void setPlayerPosition(const Double3D & pt);
    // only valid to call this after you die
    void respawn();

    int playerEntityId() const { return m_player_entity_id; }
    Server::EntityPosition playerPosition();
    QSharedPointer<Entity> entity(int entity_id);

    Block blockAt(const Int3D & absolute_location);
    bool isBlockLoaded(const Int3D & absolute_location);
    int playerHealth() { return m_player_health; }

    void startDigging(const Int3D &block);
    void stopDigging();

    void sendChat(QString message);


    // if you want you can cheat and override the default physics settings:
    void setInputAcceleration(float value) { m_input_acceleration = value; }
    void setGravity(float value) { m_gravity = value; }
    void setMaxGroundSpeed(float value) { m_max_ground_speed = value; }

signals:
    void chatReceived(QString username, QString message);

    void entitySpawned(QSharedPointer<Game::Entity> entity);
    void entityDespawned(QSharedPointer<Game::Entity> entity);
    void entityMoved(QSharedPointer<Game::Entity> entity);

    void chunkUpdated(const Int3D &start, const Int3D &size);
    void unloadChunk(const Int3D & coord);
    void playerPositionUpdated();
    void playerHealthUpdated();
    void playerDied();
    void stoppedDigging(Game::StoppedDiggingReason reason);
    void loginStatusUpdated(Server::LoginStatus status);

private:

    QMutex m_mutex;

    static const int c_position_update_interval_ms;
    static const Int3D c_chunk_size;
    static const Block c_air;
    static Int3D chunkKey(const Int3D & coord);

    Server m_server;
    QString m_userName;

    QTimer * m_position_update_timer;
    QTimer * m_digging_timer;
    Int3D m_digging_location;
    int m_digging_counter;

    Server::EntityPosition m_player_position;
    int m_player_health;
    int m_player_entity_id;
    Item::ItemType m_player_held_item;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;
    QHash<int, QSharedPointer<Entity> > m_entities;

    float m_max_ground_speed;
    float m_terminal_velocity;
    float m_input_acceleration;
    float m_gravity;
    float m_ground_friction;

    QVector<bool> m_control_state;
    bool m_jump_was_pressed;

    int m_return_code;

private:
    void gotFirstPlayerPositionAndLookResponse();
    float groundSpeedSquared() { return m_player_position.vel.x * m_player_position.vel.x +
                                 m_player_position.vel.y * m_player_position.vel.y; }
    void getPlayerBoundingBox(Int3D & boundingBoxMin, Int3D & boundingBoxMax);
    bool collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax);

private slots:
    void handleLoginStatusChanged(Server::LoginStatus status);
    void handleLoginCompleted(int entity_id);
    void handleChatReceived(QString content);
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


    void handleMapChunkUpdated(QSharedPointer<Chunk> update);
    void handleMultiBlockUpdate(Int3D chunk_key, QHash<Int3D,Block> new_blocks);
    void handleBlockUpdate(Int3D absolute_location, Block new_block);

    void sendPosition();
    void timeToContinueDigging();
};

#endif // GAME_H
