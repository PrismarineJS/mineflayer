#include "Server.h"

#include <QDir>
#include <QCoreApplication>

#include <cmath>

#include <OGRE/OgreMath.h>

Server::Server(QUrl connection_info) :
    m_connection_info(connection_info),
    m_socket_thread(NULL),
    m_parser(NULL),
    m_position_update_timer(NULL),
    m_login_state(Disconnected)
{
    // we run in m_socket_thread
    m_socket_thread = new QThread(this);
    m_socket_thread->start();
    this->moveToThread(m_socket_thread);

    bool success;
    success = QMetaObject::invokeMethod(this, "initialize", Qt::QueuedConnection);
    Q_ASSERT(success);
}

Server::~Server()
{
    delete m_parser;
    delete m_position_update_timer;
}

void Server::initialize()
{
    Q_ASSERT(QThread::currentThread() == m_socket_thread);

    m_socket = new QTcpSocket(this);

    bool success;

    success = connect(m_socket, SIGNAL(connected()), this, SLOT(handleConnected()));
    Q_ASSERT(success);

    success = connect(m_socket, SIGNAL(disconnected()), this, SLOT(cleanUpAfterDisconnect()));
    Q_ASSERT(success);

    success = connect(m_socket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(handleSocketError(QAbstractSocket::SocketError)));
    Q_ASSERT(success);
}

void Server::socketConnect()
{
    if (QThread::currentThread() != m_socket_thread) {
        bool success = QMetaObject::invokeMethod(this, "socketConnect", Qt::QueuedConnection);
        Q_ASSERT(success);
        return;
    }
    Q_ASSERT(m_socket);

    changeLoginState(Connecting);
    m_socket->connectToHost(m_connection_info.host(), m_connection_info.port(25565));
}

void Server::socketDisconnect()
{
    if (QThread::currentThread() != m_socket_thread) {
        bool success = QMetaObject::invokeMethod(this, "socketDisconnect", Qt::QueuedConnection);
        Q_ASSERT(success);
        return;
    }

    if (m_socket->isOpen())
        m_socket->disconnectFromHost();
}

void Server::sendMessage(QSharedPointer<OutgoingRequest> msg)
{
    qDebug() << "sending message 0x" << QString::number(msg.data()->messageType, 16).toStdString().c_str();
    if (msg.data()->messageType == Message::DummyDisconnect) {
        socketDisconnect();
        return;
    }
    if (m_socket->isOpen()) {
        QDataStream stream(m_socket);
        msg.data()->writeToStream(stream);
    }
}

void Server::handleConnected()
{
    delete m_parser;
    m_parser = new IncomingMessageParser(m_socket);

    bool success;
    success = connect(m_parser, SIGNAL(messageReceived(QSharedPointer<IncomingResponse>)), this, SLOT(processIncomingMessage(QSharedPointer<IncomingResponse>)));
    Q_ASSERT(success);

    changeLoginState(WaitingForHandshakeResponse);
    sendMessage(QSharedPointer<OutgoingRequest>(new HandshakeRequest(m_connection_info.userName())));
}

void Server::cleanUpAfterDisconnect()
{
    qDebug() << "Cleaning up, disconnected";
    m_socket_thread->exit();
    this->moveToThread(QCoreApplication::instance()->thread());
    bool success;
    success = QMetaObject::invokeMethod(this, "terminate", Qt::QueuedConnection);
    Q_ASSERT(success);
}

void Server::terminate()
{
    Q_ASSERT(QThread::currentThread() == QCoreApplication::instance()->thread());
    m_socket_thread->exit();
    m_socket_thread->wait();

    changeLoginState(Disconnected);
    emit socketDisconnected();
}

void Server::processIncomingMessage(QSharedPointer<IncomingResponse> incomingMessage)
{
    // possibly handle the message (only for the initial setup)
    switch (incomingMessage.data()->messageType) {
        case Message::Handshake: {
            HandshakeResponse * message = (HandshakeResponse *)incomingMessage.data();
            Q_ASSERT(m_login_state == WaitingForHandshakeResponse);
            // we don't support authenticated logging in yet.
            Q_ASSERT_X(message->connectionHash == HandshakeResponse::AuthenticationNotRequired, "",
                       (QString("unexpected connection hash: ") + message->connectionHash).toStdString().c_str());
            changeLoginState(WaitingForLoginResponse);
            changeLoginState(WaitingForPlayerPositionAndLook);
            sendMessage(QSharedPointer<OutgoingRequest>(new LoginRequest(m_connection_info.userName(), m_connection_info.password())));
            break;
        }
        case Message::PlayerPositionAndLook: {
            PlayerPositionAndLookResponse * message = (PlayerPositionAndLookResponse *) incomingMessage.data();
            EntityPosition position;
            fromNotchianXyz(position, message->x, message->z, message->y);
            position.stance = message->stance;
            fromNotchianYawPitch(position, message->yaw, message->pitch);
            position.roll = 0.0f;
            position.on_ground = message->on_ground;
            if (m_login_state == WaitingForPlayerPositionAndLook)
                gotFirstPlayerPositionAndLookResponse(position);
            emit playerPositionUpdated(position);
            break;
        }
        case Message::MapChunk: {
            MapChunkResponse * message = (MapChunkResponse *) incomingMessage.data();

            QByteArray tmp = message->compressed_data;
            // prepend a guess at the final size... or just 0.
            tmp.prepend(QByteArray("\0\0\0\0", 4));
            QByteArray decompressed = qUncompress(tmp);

            Int3D notchian_size;
            notchian_size.x = message->size_x_minus_one + 1;
            notchian_size.y = message->size_y_minus_one + 1;
            notchian_size.z = message->size_z_minus_one + 1;
            Int3D rotated_size = fromNotchianXyz(notchian_size);
            Int3D positive_size;
            positive_size.x = Ogre::Math::IAbs(rotated_size.x);
            positive_size.y = Ogre::Math::IAbs(rotated_size.y);
            positive_size.z = Ogre::Math::IAbs(rotated_size.z);

            Int3D notchian_pos(message->x, message->y, message->z);
            Int3D rotated_position = fromNotchianXyz(notchian_pos);
            Int3D position = rotated_position + (rotated_size - positive_size) / 2;

            Chunk * chunk = new Chunk(position, positive_size);

            int volume = positive_size.x * positive_size.y * positive_size.z;
            int metadata_offset = volume;
            int light_offset = volume * 3 / 2;
            int sky_light_offest = volume * 2;
            int array_index = 0;
            int nibble_shifter = 0; // start with low nibble
            Int3D notchian_relative_pos;
            // traversal order is x,z,y in notchian coordinates
            for (notchian_relative_pos.x = 0; notchian_relative_pos.x < notchian_size.x; notchian_relative_pos.x++) {
                for (notchian_relative_pos.z = 0; notchian_relative_pos.z < notchian_size.z; notchian_relative_pos.z++) {
                    for (notchian_relative_pos.y = 0; notchian_relative_pos.y < notchian_size.y; notchian_relative_pos.y++) {
                        Chunk::Block block;
                        block.type = decompressed.at(array_index);
                        block.metadata  = (decompressed.at( metadata_offset + array_index / 2) >> nibble_shifter) & 0xf;
                        block.light     = (decompressed.at(    light_offset + array_index / 2) >> nibble_shifter) & 0xf;
                        block.sky_light = (decompressed.at(sky_light_offest + array_index / 2) >> nibble_shifter) & 0xf;

                        array_index++;
                        nibble_shifter = 4 - nibble_shifter;

                        Int3D notchian_abs_pos = notchian_pos + notchian_relative_pos;
                        Int3D abs_pos = fromNotchianXyz(notchian_abs_pos);
                        Int3D relative_pos = abs_pos - position;
                        // TODO: chunk->setBlock(relative_pos, block);
                    }
                }
            }
            emit mapChunkUpdated(QSharedPointer<Chunk>(chunk));
            break;
        }
        case Message::WindowItems: {
            WindowItemsResponse * message = (WindowItemsResponse *) incomingMessage.data();
            if (message->window_id == 0) {
                // inventory
                emit inventoryUpdated(message->items);
            } else {
                // TODO: not inventory
            }
            break;
        }
        case Message::DisconnectOrKick: {
            DisconnectOrKickResponse * message = (DisconnectOrKickResponse *)incomingMessage.data();
            qDebug() << "got disconnected: " << message->reason;
            finishWritingAndDisconnect();
            break;
        }
        default: {
            // qDebug() << "ignoring message type: 0x" << QString::number(incomingMessage.data()->messageType, 16).toStdString().c_str();
            break;
        }
    }
}

void Server::fromNotchianXyz(EntityPosition &destination, double notchian_x, double notchian_y, double notchian_z)
{
    // east
    destination.x = notchian_z;
    // north
    destination.y = -notchian_x;
    // up
    destination.z = notchian_y;
}
Int3D Server::fromNotchianXyz(int notchian_x, int notchian_y, int notchian_z)
{
    Int3D result;
    // east
    result.x = notchian_z;
    // north
    result.y = -notchian_x;
    // up
    result.z = notchian_y;
    return result;
}
Int3D Server::fromNotchianXyz(Int3D notchian_xyz)
{
    return fromNotchianXyz(notchian_xyz.x, notchian_xyz.y, notchian_xyz.z);
}

void Server::toNotchianXyz(const EntityPosition &source, double &destination_notchian_x, double &destination_notchian_y, double &destination_notchian_z)
{
    // east
    destination_notchian_z = source.x;
    // north
    destination_notchian_x = -source.y;
    // up
    destination_notchian_y = source.z;
}


void Server::fromNotchianYawPitch(EntityPosition &destination, float notchian_yaw, float notchian_pitch)
{
    // amazingly, yaw is oriented properly.
    destination.yaw = euclideanMod(degreesToRadians(notchian_yaw), c_2pi);
    // TODO: check pitch
    destination.pitch = euclideanMod(degreesToRadians(notchian_pitch) + c_pi, c_2pi) - c_2pi;
}

void Server::toNotchianYawPitch(const EntityPosition &source, float &destination_notchian_yaw, float &destination_notchian_pitch)
{
    destination_notchian_yaw = radiansToDegrees(source.yaw);
    // TODO: check pitch
    destination_notchian_pitch = radiansToDegrees(source.pitch);
}

const float Server::c_pi = 3.14159265f;
const float Server::c_2pi = 6.28318531f;
const float Server::c_degrees_per_radian = 57.2957795f;
const float Server::c_radians_per_degree = 0.0174532925f;

float Server::degreesToRadians(float degrees)
{
    return degrees * c_radians_per_degree;
}

float Server::radiansToDegrees(float radians)
{
    return radians * c_degrees_per_radian;
}

float Server::euclideanMod(float numerator, float denominator)
{
    float result = std::fmod(numerator, denominator);
    if (result < 0)
        result += denominator;
    return result;
}

void Server::gotFirstPlayerPositionAndLookResponse(EntityPosition position)
{
    player_position = position;

    delete m_position_update_timer;
    m_position_update_timer = new QTimer();
    m_position_update_timer->setInterval(200);

    bool success;
    success = connect(m_position_update_timer, SIGNAL(timeout()), this, SLOT(sendPosition()));
    Q_ASSERT(success);

    m_position_update_timer->start();

    changeLoginState(Success);
}

void Server::sendPosition()
{
    PlayerPositionAndLookRequest * request = new PlayerPositionAndLookRequest;
    toNotchianXyz(player_position, request->x, request->y, request->z);
    request->stance = player_position.stance;
    toNotchianYawPitch(player_position, request->yaw, request->pitch);
    request->on_ground = player_position.on_ground;
    sendMessage(QSharedPointer<OutgoingRequest>(request));
}

void Server::changeLoginState(LoginStatus state)
{
    m_login_state = state;
    emit loginStatusUpdated(state);
}

void Server::handleSocketError(QAbstractSocket::SocketError error)
{
    qDebug() << "Socket error: " << error;
    changeLoginState(SocketError);
}

void Server::finishWritingAndDisconnect()
{
    // put a dummy message on the queue
    this->sendMessage(QSharedPointer<OutgoingRequest>(new DummyDisconnectRequest()));
}

Server::LoginStatus Server::loginStatus()
{
    return m_login_state;
}
