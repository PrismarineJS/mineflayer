#ifndef GAME_H
#define GAME_H

#include "Server.h"

class Game : public QObject
{
    Q_OBJECT
public:
    Game(QUrl connection_info);
    ~Game();

    void start();
    Chunk::Block blockAt(Int3D absolute_location);

    // params are -1, 0, or 1, indicating backward/left, neutral, forward/right.
    void setMovementInput(int forward, int right) { m_movement_input_forward = forward; m_movement_input_right = right; }

    // Hax:
    void setInputAcceleration(float value) { m_input_acceleration = value; }
    void setGravity(float value) { m_gravity = value; }

signals:
    void chatReceived(QString username, QString message);
    void chunkUpdated(Int3D start, Int3D size);
    void playerPositionUpdated(Server::EntityPosition position);

private:
    static const float c_standard_max_ground_speed; // m/s
    static const float c_standard_terminal_velocity; // m/s
    static const float c_standard_walking_acceleration; // m/s/s
    static const float c_standard_gravity; // m/s/s
    static const float c_standard_ground_friction; // m/s/s
    static const float c_player_apothem;
    static const float c_player_height;
    static const float c_player_half_height;
    static const int c_notchian_tick_ms;
    static const int c_physics_fps;
    static const Int3D c_chunk_size;
    static const Chunk::Block c_air;
    static Int3D chunkKey(const Int3D & coord);

    Server m_server;
    QString m_userName;

    QTimer * m_position_update_timer;

    QTimer * m_physics_timer;
    Server::EntityPosition m_player_position;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;

    int m_movement_input_forward, m_movement_input_right;

    float m_max_ground_speed;
    float m_terminal_velocity;
    float m_input_acceleration;
    float m_gravity;
    float m_ground_friction;

    void gotFirstPlayerPositionAndLookResponse();
    float groundSpeedSquared() { return m_player_position.dx * m_player_position.dx + m_player_position.dy * m_player_position.dy; }
    bool collisionInRange(Int3D start, Int3D stop);

private slots:
    void handleLoginStatusChanged(Server::LoginStatus status);
    void handleChatReceived(QString content);
    void handlePlayerPositionAndLookUpdated(Server::EntityPosition position);
    void handleMapChunkUpdated(QSharedPointer<Chunk> update);

    void sendPosition();
    void doPhysics();
};

#endif // GAME_H
