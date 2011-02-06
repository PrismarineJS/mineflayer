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

signals:
    void chatReceived(QString username, QString message);
    void chunkUpdated(Int3D start, Int3D size);
    void playerPositionUpdated(Server::EntityPosition position);

private:
    static const float c_walking_speed; // m/s
    static const int c_notchian_tick_ms;
    static const int c_physics_fps;
    static const float c_gravity; // m/s^2
    static const Int3D c_chunk_size;
    static const Chunk::Block c_air;
    static Int3D chunkKey(const Int3D & coord);

    Server m_server;
    QString m_userName;

    QTimer * m_position_update_timer;

    QTimer * m_physics_timer;
    Server::EntityPosition m_player_position;
    QHash<Int3D, QSharedPointer<Chunk> > m_chunks;

    void gotFirstPlayerPositionAndLookResponse();

private slots:
    void handleLoginStatusChanged(Server::LoginStatus status);
    void handleChatReceived(QString content);
    void handlePlayerPositionAndLookUpdated(Server::EntityPosition position);
    void handleMapChunkUpdated(QSharedPointer<Chunk> update);

    void sendPosition();
    void doPhysics();
};

#endif // GAME_H
