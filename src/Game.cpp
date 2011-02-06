#include "Game.h"

#include <QApplication>

const float Game::c_walking_speed = 4.27;
const int Game::c_notchian_tick_ms = 200;
const int Game::c_physics_fps = 60;
const float Game::c_gravity = -9.81;
const Int3D Game::c_chunk_size(16, 16, 128);
const Chunk::Block Game::c_air(Chunk::Air, 0, 0, 0);

Game::Game(QUrl connection_info) :
    m_server(connection_info),
    m_userName(connection_info.userName()),
    m_position_update_timer(NULL),
    m_physics_timer(NULL)
{
    bool success;
    success = connect(&m_server, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusChanged(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(playerPositionAndLookUpdated(Server::EntityPosition)), this, SLOT(handlePlayerPositionAndLookUpdated(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(handleMapChunkUpdated(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
}
Game::~Game()
{
    delete m_position_update_timer;
    delete m_physics_timer;
}

void Game::start()
{
    m_server.socketConnect();
}

Chunk::Block Game::blockAt(Int3D absolute_location)
{
    Int3D chunk_key = chunkKey(absolute_location);
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (chunk.isNull())
        return c_air;
    return chunk.data()->getBlock(absolute_location - chunk_key);
}

void Game::handleLoginStatusChanged(Server::LoginStatus status)
{
    switch (status) {
        case Server::SocketError:
            qWarning() << "Unable to connect to server";
            QApplication::instance()->quit();
            break;
        case Server::Disconnected:
            qWarning() << "Got disconnected from server";
            QApplication::instance()->quit();
            break;
        default:;
    }
}

void Game::handleChatReceived(QString content)
{
    if (content.startsWith("<")) {
        int pos = content.indexOf(">");
        Q_ASSERT(pos != -1);
        QString username = content.mid(1, pos-1);
        QString content = content.mid(pos+2);
        // suppress talking to yourself
        if (username != m_userName)
            emit chatReceived(username, content);
    } else {
        // TODO
    }
}

void Game::handlePlayerPositionAndLookUpdated(Server::EntityPosition position)
{
    m_player_position.x = position.x;
    m_player_position.y = position.y;
    m_player_position.z = position.z;
    m_player_position.stance = position.stance;
    m_player_position.yaw = position.yaw;
    m_player_position.pitch = position.pitch;
    m_player_position.on_ground = position.on_ground;

    // apologize to the notchian server by echoing an identical position back
    m_server.sendPositionAndLook(m_player_position);

    if (m_position_update_timer == NULL) {
        // got first 0x0D. start the clocks
        bool success;

        m_position_update_timer = new QTimer;
        m_position_update_timer->setInterval(c_notchian_tick_ms);
        success = connect(m_position_update_timer, SIGNAL(timeout()), this, SLOT(sendPosition()));
        Q_ASSERT(success);
        m_position_update_timer->start();

        m_physics_timer = new QTimer;
        m_physics_timer->setInterval(1000 / c_physics_fps);
        success = connect(m_physics_timer, SIGNAL(timeout()), this, SLOT(doPhysics()));
        Q_ASSERT(success);
        m_physics_timer->start();
    }
    emit playerPositionUpdated(m_player_position);
}

void Game::handleMapChunkUpdated(QSharedPointer<Chunk>update)
{
    // update can be smaller than a full size chunk, but cannot exceed the bounds of a chunk.
    Int3D update_position = update.data()->position();
    Int3D chunk_position = chunkKey(update_position);
    Int3D update_size = update.data()->size();
    Q_ASSERT(chunkKey(update_position + update_size - Int3D(1,1,1)) == chunk_position);
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_position, QSharedPointer<Chunk>());
    if (chunk.isNull()) {
        chunk = QSharedPointer<Chunk>(new Chunk(chunk_position, c_chunk_size));
        m_chunks.insert(chunk_position, chunk);
    }
    Int3D chunk_to_update = update_position - chunk_position;
    Int3D update_offset, chunk_offset;
    for (update_offset.x = 0, chunk_offset.x = chunk_to_update.x; update_offset.x < update_size.x; update_offset.x++, chunk_offset.x++)
        for (update_offset.y = 0, chunk_offset.y = chunk_to_update.y; update_offset.y < update_size.y; update_offset.y++, chunk_offset.y++)
            for (update_offset.z = 0, chunk_offset.z = chunk_to_update.z; update_offset.z < update_size.z; update_offset.z++, chunk_offset.z++)
                chunk.data()->setBlock(chunk_offset, update.data()->getBlock(update_offset));

    emit chunkUpdated(update_position, update_size);
}

Int3D Game::chunkKey(const Int3D &coord)
{
    return coord - (coord % c_chunk_size);
}

void Game::sendPosition()
{
    m_server.sendPositionAndLook(m_player_position);
}

void Game::doPhysics()
{
//    if (true && m_canonical_player_position.z <= 64) {
//        m_canonical_player_position.z = 64.0;
//        m_canonical_player_position.on_ground = true;
//        m_canonical_player_position.dz = 0;
//        m_canonical_player_position.x += c_walking_speed / c_physics_fps;
//    } else {
//        m_canonical_player_position.z -= 0.05;
//    }
//    m_next_player_position.x = m_canonical_player_position.x;
//    m_next_player_position.y = m_canonical_player_position.y;
//    m_next_player_position.z = m_canonical_player_position.z;
//    m_next_player_position.on_ground = m_canonical_player_position.on_ground;
//    emit playerPositionUpdated(m_canonical_player_position);
}

