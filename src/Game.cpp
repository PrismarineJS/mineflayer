#include "Game.h"

#include <QApplication>

#include <OGRE/OgreVector3.h>
#include <OGRE/OgreVector2.h>

#include <cmath>

const float Game::c_standard_max_ground_speed = 4.27; // according to the internet
const float Game::c_standard_terminal_velocity = 20.0; // guess
const float Game::c_standard_walking_acceleration = 35.0; // guess
const float Game::c_standard_gravity = 9.81;
const float Game::c_standard_ground_friction = Game::c_standard_walking_acceleration / 4.0; // guess
const float Game::c_player_apothem = 0.3; // measured
const float Game::c_player_height = 1.62; // according to spawn stance
const float Game::c_player_half_height = Game::c_player_height / 2;
const float Game::c_jump_speed = 8.0f;

const int Game::c_notchian_tick_ms = 200;
const Int3D Game::c_chunk_size(16, 16, 128);
const Block Game::c_air(Block::Air, 0, 0, 0);

Game::Game(QUrl connection_info) :
    m_server(connection_info),
    m_userName(connection_info.userName()),
    m_position_update_timer(NULL),
    m_max_ground_speed(c_standard_max_ground_speed),
    m_terminal_velocity(c_standard_terminal_velocity),
    m_input_acceleration(c_standard_walking_acceleration),
    m_gravity(c_standard_gravity),
    m_ground_friction(c_standard_ground_friction)
{
    bool success;
    success = connect(&m_server, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusChanged(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(playerPositionAndLookUpdated(Server::EntityPosition)), this, SLOT(handlePlayerPositionAndLookUpdated(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(handleMapChunkUpdated(QSharedPointer<Chunk>)));
    Q_ASSERT(success);

    m_control_state.fill(false, (int)ControlCount);
}

Game::~Game()
{
    delete m_position_update_timer;
}

void Game::setControlActivated(Control control, bool activated)
{
    m_control_state[control] = activated;
}

void Game::start()
{
    m_server.socketConnect();
}

Block Game::blockAt(const Int3D & absolute_location)
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

void Game::doPhysics(float delta_seconds)
{
    // derive xy movement vector from controls
    int movement_right = 0;
    if (m_control_state.at(Right))
        movement_right += 1;
    if (m_control_state.at(Left))
        movement_right -= 1;
    int movement_forward = 0;
    if (m_control_state.at(Forward))
        movement_forward += 1;
    if (m_control_state.at(Back))
        movement_forward -= 1;

    // acceleration is m/s/s
    Ogre::Vector3 acceleration = Ogre::Vector3::ZERO;
    if (movement_forward || movement_right) {
        // input acceleration
        float rotation_from_input = std::atan2(movement_forward, movement_right) + Util::half_pi;
        float input_yaw = m_player_position.yaw + rotation_from_input;
        acceleration.x += Ogre::Math::Cos(input_yaw) * m_input_acceleration;
        acceleration.y += Ogre::Math::Sin(input_yaw) * m_input_acceleration;
    }

    // jumping
    if (m_control_state.at(Jump) && m_player_position.on_ground) {
        m_player_position.on_ground = false;
        m_player_position.dz = c_jump_speed;
    }

    // gravity
    acceleration.z -= m_gravity;

    float old_ground_speed_squared = groundSpeedSquared();
    if (old_ground_speed_squared < std::numeric_limits<float>::epsilon()) {
        // stopped
        m_player_position.dx = 0;
        m_player_position.dy = 0;
    } else {
        // non-zero ground speed
        if (m_player_position.on_ground) {
            // friction
            float old_ground_speed = std::sqrt(old_ground_speed_squared);
            float friction_magnitude;
            if (m_ground_friction > old_ground_speed / delta_seconds) {
                // friction will stop the motion
                friction_magnitude = old_ground_speed / delta_seconds;
            } else {
                friction_magnitude = m_ground_friction;
            }
            acceleration.x += -m_player_position.dx / old_ground_speed * friction_magnitude;
            acceleration.y += -m_player_position.dy / old_ground_speed * friction_magnitude;
        }
    }

    // calculate new speed
    m_player_position.dx += acceleration.x * delta_seconds;
    m_player_position.dy += acceleration.y * delta_seconds;
    m_player_position.dz += acceleration.z * delta_seconds;


    // limit speed
    double ground_speed_squared = groundSpeedSquared();
    if (ground_speed_squared > m_max_ground_speed * m_max_ground_speed) {
        float ground_speed = std::sqrt(ground_speed_squared);
        float correction_scale = m_max_ground_speed / ground_speed;
        m_player_position.dx *= correction_scale;
        m_player_position.dy *= correction_scale;
    }
    if (m_player_position.dz < -m_terminal_velocity)
        m_player_position.dz = -m_terminal_velocity;
    else if (m_player_position.dz > m_terminal_velocity)
        m_player_position.dz = m_terminal_velocity;


    // calculate new positions and resolve collisions
    Int3D boundingBoxMin, boundingBoxMax;
    getPlayerBoundingBox(boundingBoxMin, boundingBoxMax);

    bool x = false, y = false, z = false;
    if (m_player_position.dx != 0) {
        m_player_position.x += m_player_position.dx * delta_seconds;
        int block_x = (int)std::floor(m_player_position.x + Util::sign(m_player_position.dx) * c_player_apothem);
        if (collisionInRange(Int3D(block_x, boundingBoxMin.y, boundingBoxMin.z), Int3D(block_x, boundingBoxMax.y, boundingBoxMax.z))) {
            x = true;
            m_player_position.x = block_x + (m_player_position.dx < 0 ? 1 + c_player_apothem : -c_player_apothem);
            m_player_position.dx = 0;
            getPlayerBoundingBox(boundingBoxMin, boundingBoxMax);
        }
    }

    if (m_player_position.dy != 0) {
        m_player_position.y += m_player_position.dy * delta_seconds;
        int block_y = (int)std::floor(m_player_position.y + Util::sign(m_player_position.dy) * c_player_apothem);
        if (collisionInRange(Int3D(boundingBoxMin.x, block_y, boundingBoxMin.z), Int3D(boundingBoxMax.x, block_y, boundingBoxMax.z))) {
            y = true;
            m_player_position.y = block_y + (m_player_position.dy < 0 ? 1 + c_player_apothem : -c_player_apothem);
            m_player_position.dy = 0;
            getPlayerBoundingBox(boundingBoxMin, boundingBoxMax);
        }
    }

    if (m_player_position.dz != 0) {
        m_player_position.z += m_player_position.dz * delta_seconds;
        int block_z = (int)std::floor(m_player_position.z + c_player_half_height + Util::sign(m_player_position.dz) * c_player_half_height);
        if (collisionInRange(Int3D(boundingBoxMin.x, boundingBoxMin.y, block_z), Int3D(boundingBoxMax.x, boundingBoxMax.y, block_z))) {
            z = true;
            m_player_position.z = block_z + (m_player_position.dz < 0 ? 1 : -c_player_height);
            m_player_position.dz = 0;
            m_player_position.on_ground = true;
        } else {
            m_player_position.on_ground = false;
        }
    }

    // always emit update
    emit playerPositionUpdated(m_player_position);
}

void Game::getPlayerBoundingBox(Int3D & boundingBoxMin, Int3D & boundingBoxMax)
{
    boundingBoxMin.x = (int)std::floor(m_player_position.x - c_player_apothem);
    boundingBoxMin.y = (int)std::floor(m_player_position.y - c_player_apothem);
    boundingBoxMin.z = (int)std::floor(m_player_position.z - 0);
    boundingBoxMax.x = (int)std::floor(m_player_position.x + c_player_apothem);
    boundingBoxMax.y = (int)std::floor(m_player_position.y + c_player_apothem);
    boundingBoxMax.z = (int)std::floor(m_player_position.z + c_player_height);
}

// TODO: check partial blocks
bool Game::collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax)
{
    Int3D cursor;
    for (cursor.x = boundingBoxMin.x; cursor.x <= boundingBoxMax.x; cursor.x++)
        for (cursor.y = boundingBoxMin.y; cursor.y <= boundingBoxMax.y; cursor.y++)
            for (cursor.z = boundingBoxMin.z; cursor.z <= boundingBoxMax.z; cursor.z++)
                if (blockAt(cursor).type() != Block::Air)
                    return true;
    return false;
}
