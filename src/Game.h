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
        DiggingAborted,
        DiggingCompleted,
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
    // only valid to call this after you die
    void respawn();

    Server::EntityPosition playerPosition() const { return m_player_position; }

    Block blockAt(const Int3D & absolute_location);
    bool isBlockLoaded(const Int3D & absolute_location);
    int playerHealth() { return m_player_health; }

    void startDigging(const Int3D &block);
    void stopDigging();

    void sendChat(QString message);

    static int itemStackHeight(Block::ItemType item);

    // if you want you can cheat and override the default physics settings:
    void setInputAcceleration(float value) { m_input_acceleration = value; }
    void setGravity(float value) { m_gravity = value; }
    void setMaxGroundSpeed(float value) { m_max_ground_speed = value; }

signals:
    void chatReceived(QString username, QString message);
    void chunkUpdated(const Int3D &start, const Int3D &size);
    void unloadChunk(const Int3D & coord);
    void playerPositionUpdated();
    void playerHealthUpdated();
    void playerDied();
    void stoppedDigging(Game::StoppedDiggingReason reason);
    void loginStatusUpdated(Server::LoginStatus status);

private:
    QMutex m_mutex;

    static const int c_notchian_tick_ms;
    static const Int3D c_chunk_size;
    static const Block c_air;
    static Int3D chunkKey(const Int3D & coord);
    static QHash<Block::ItemType, int> s_item_stack_height;

    Server m_server;
    QString m_userName;

    QTimer * m_position_update_timer;
    QTimer * m_digging_timer;
    Int3D m_digging_location;
    int m_digging_counter;

    Server::EntityPosition m_player_position;
    int m_player_health;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;

    float m_max_ground_speed;
    float m_terminal_velocity;
    float m_input_acceleration;
    float m_gravity;
    float m_ground_friction;

    QVector<bool> m_control_state;

    static bool s_initialized;

    int m_return_code;

private:
    void gotFirstPlayerPositionAndLookResponse();
    float groundSpeedSquared() { return m_player_position.dx * m_player_position.dx + m_player_position.dy * m_player_position.dy; }
    void getPlayerBoundingBox(Int3D & boundingBoxMin, Int3D & boundingBoxMax);
    bool collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax);

    static void initializeStaticData();

private slots:
    void handleLoginStatusChanged(Server::LoginStatus status);
    void handleChatReceived(QString content);
    void handlePlayerPositionAndLookUpdated(Server::EntityPosition position);
    void handlePlayerHealthUpdated(int new_health);
    void handleMapChunkUpdated(QSharedPointer<Chunk> update);
    void handleUnloadChunk(const Int3D & coord);

    void sendPosition();
    void timeToContinueDigging();
};

#endif // GAME_H
