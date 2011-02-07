#ifndef GAME_H
#define GAME_H

#include "Server.h"
#include "Block.h"

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

public:
    Game(QUrl connection_info);
    ~Game();


    // call every frame passing it the amount of time since the last frame
    void start();
    void doPhysics(float delta_seconds);

    // equivalent to pressing a button.
    void setControlActivated(Control control, bool activated = true);
    // immediately emits a position update
    void updatePlayerLook(float delta_yaw, float delta_pitch);

    Block blockAt(const Int3D & absolute_location);
    int playerHealth() { return m_player_health; }

    // if you want you can cheat and override the default physics settings:
    void setInputAcceleration(float value) { m_input_acceleration = value; }
    void setGravity(float value) { m_gravity = value; }

signals:
    void chatReceived(QString username, QString message);
    void chunkUpdated(Int3D start, Int3D size);
    void playerPositionUpdated(Server::EntityPosition position);
    void playerHealthUpdated();
    void playerDied();

private:
    static const float c_standard_max_ground_speed; // m/s
    static const float c_standard_terminal_velocity; // m/s
    static const float c_standard_walking_acceleration; // m/s/s
    static const float c_standard_gravity; // m/s/s
    static const float c_standard_ground_friction; // m/s/s
    static const float c_player_apothem;
    static const float c_player_height;
    static const float c_player_half_height;
    static const float c_jump_speed;
    static const int c_notchian_tick_ms;
    static const Int3D c_chunk_size;
    static const Block c_air;
    static Int3D chunkKey(const Int3D & coord);

    Server m_server;
    QString m_userName;

    QTimer * m_position_update_timer;

    Server::EntityPosition m_player_position;
    int m_player_health;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;

    float m_max_ground_speed;
    float m_terminal_velocity;
    float m_input_acceleration;
    float m_gravity;
    float m_ground_friction;

    QVector<bool> m_control_state;

private:
    void gotFirstPlayerPositionAndLookResponse();
    float groundSpeedSquared() { return m_player_position.dx * m_player_position.dx + m_player_position.dy * m_player_position.dy; }
    void getPlayerBoundingBox(Int3D & boundingBoxMin, Int3D & boundingBoxMax);
    bool collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax);

private slots:
    void handleLoginStatusChanged(Server::LoginStatus status);
    void handleChatReceived(QString content);
    void handlePlayerPositionAndLookUpdated(Server::EntityPosition position);
    void handlePlayerHealthUpdated(int new_health);
    void handleMapChunkUpdated(QSharedPointer<Chunk> update);

    void sendPosition();
};

#endif // GAME_H
