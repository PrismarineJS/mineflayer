#include "Server.h"

#include "Util.h"

#include <QDir>
#include <QCoreApplication>

const int Server::c_physics_fps = 60;
const float Server::c_gravity = -9.81;

Server::Server(QUrl connection_info) :
    m_connection_info(connection_info),
    m_socket_thread(NULL),
    m_parser(NULL),
    m_position_update_timer(NULL),
    m_physics_timer(NULL),
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
    delete m_physics_timer;
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
    if (QThread::currentThread() != m_socket_thread) {
        bool success = QMetaObject::invokeMethod(this, "sendMessage", Qt::QueuedConnection, Q_ARG(QSharedPointer<OutgoingRequest>, msg));
        Q_ASSERT(success);
        return;
    }
    if (msg.data()->messageType == Message::DummyDisconnect) {
        socketDisconnect();
        return;
    }
    if (m_socket->isOpen()) {
        QDataStream stream(m_socket);
        msg.data()->writeToStream(stream);
    }
}

void Server::sendChat(QString message)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new ChatRequest(message)));
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
    switch (incomingMessage.data()->messageType) {
        case Message::Handshake: {
            HandshakeResponse * message = (HandshakeResponse *)incomingMessage.data();
            Q_ASSERT(m_login_state == WaitingForHandshakeResponse);
            // we don't support authenticated logging in yet.
            Q_ASSERT_X(message->connectionHash == HandshakeResponse::AuthenticationNotRequired, "",
                       (QString("unexpected connection hash: ") + message->connectionHash).toStdString().c_str());
            changeLoginState(WaitingForPlayerPositionAndLook);
            sendMessage(QSharedPointer<OutgoingRequest>(new LoginRequest(m_connection_info.userName(), m_connection_info.password())));
            break;
        }
        case Message::Chat: {
            ChatResponse * message = (ChatResponse *)incomingMessage.data();
            emit chatReceived(message->content);
            break;
        }
        case Message::PlayerPositionAndLook: {
            PlayerPositionAndLookResponse * message = (PlayerPositionAndLookResponse *) incomingMessage.data();
            fromNotchianXyz(m_canonical_player_position, message->x, message->y, message->z);
            m_canonical_player_position.stance = message->stance;
            fromNotchianYawPitch(m_canonical_player_position, message->yaw, message->pitch);
            m_canonical_player_position.on_ground = message->on_ground;
            if (m_login_state == WaitingForPlayerPositionAndLook)
                gotFirstPlayerPositionAndLookResponse();
            emit playerPositionUpdated(m_canonical_player_position);
            break;
        }
        case Message::PreChunk: {
            PreChunkResponse * message = (PreChunkResponse *) incomingMessage.data();
            if (message->mode == PreChunkResponse::Unload) {
                emit unloadChunk(fromNotchianXyz(message->x, 0, message->z));
            } else {
                // don't care about Load Chunk messages
            }
            break;
        }
        case Message::MapChunk: {
            MapChunkResponse * message = (MapChunkResponse *) incomingMessage.data();

            // determin the size of the chunk
            Int3D notchian_size;
            notchian_size.x = message->size_x_minus_one + 1;
            notchian_size.y = message->size_y_minus_one + 1;
            notchian_size.z = message->size_z_minus_one + 1;
            Int3D rotated_size = fromNotchianXyz(notchian_size);
            Int3D positive_size;
            positive_size.x = Util::abs(rotated_size.x);
            positive_size.y = Util::abs(rotated_size.y);
            positive_size.z = Util::abs(rotated_size.z);
            int volume = positive_size.x * positive_size.y * positive_size.z;

            // determin the position of the chunk
            Int3D rotated_size_minus_positive_size = rotated_size - positive_size;
            // off by one corrector needs to subtract 1 from any axis that got negated
            Int3D off_by_one_corrector = rotated_size_minus_positive_size;
            off_by_one_corrector.x = Util::sign(off_by_one_corrector.x);
            off_by_one_corrector.y = Util::sign(off_by_one_corrector.y);
            off_by_one_corrector.z = Util::sign(off_by_one_corrector.z);
            Int3D notchian_pos(message->x, message->y, message->z);
            Int3D rotated_position = fromNotchianXyz(notchian_pos);
            Int3D position = rotated_position + rotated_size_minus_positive_size / 2;

            // decompress the data
            QByteArray uncrompressable_data = message->compressed_data;
            // prepend a guess of the final size. we know the final size is volume * 2.5;
            qint32 decompressed_size = volume * 5 / 2;
            QByteArray decompressed_size_array;
            QDataStream(&decompressed_size_array, QIODevice::WriteOnly) << decompressed_size;
            uncrompressable_data.prepend(decompressed_size_array);
            QByteArray decompressed = qUncompress(uncrompressable_data);
            Q_ASSERT(decompressed.size() == decompressed_size);

            // parse and store the data
            Chunk * chunk = new Chunk(position, positive_size);
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
                        // grab all the fields for each block at once even though they're strewn accross the data structure.
                        Chunk::Block block;
                        block.type = (Chunk::ItemType) decompressed.at(array_index);
                        block.metadata  = (decompressed.at( metadata_offset + array_index / 2) >> nibble_shifter) & 0xf;
                        block.light     = (decompressed.at(    light_offset + array_index / 2) >> nibble_shifter) & 0xf;
                        block.sky_light = (decompressed.at(sky_light_offest + array_index / 2) >> nibble_shifter) & 0xf;

                        array_index++;
                        nibble_shifter = 4 - nibble_shifter; // toggle between 0 and 4.

                        Int3D notchian_absolute_pos = notchian_pos + notchian_relative_pos;
                        Int3D absolute_pos = fromNotchianXyz(notchian_absolute_pos) + off_by_one_corrector;
                        Int3D relative_pos = absolute_pos - position;
                        chunk->setBlock(relative_pos, block);
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
                qDebug() << "why'd we get a WindowItems?";
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
//            qDebug() << "ignoring message type: 0x" << QString::number(incomingMessage.data()->messageType, 16).toStdString().c_str();
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
    destination.yaw = Util::euclideanMod(Util::degreesToRadians(notchian_yaw), Util::two_pi);
    destination.pitch = Util::euclideanMod(Util::degreesToRadians(notchian_pitch) + Util::pi, Util::two_pi) - Util::pi;
}

void Server::toNotchianYawPitch(const EntityPosition &source, float &destination_notchian_yaw, float &destination_notchian_pitch)
{
    destination_notchian_yaw = Util::radiansToDegrees(source.yaw);
    destination_notchian_pitch = Util::radiansToDegrees(source.pitch);
}

void Server::updateNextPlayerPosition(EntityPosition next_player_position)
{
    if (QThread::currentThread() == m_socket_thread) {
        internalUpdateNextPlayerPosition(next_player_position);
    } else {
        bool success = QMetaObject::invokeMethod(this, "internalUpdateNextPlayerPosition", Qt::QueuedConnection, Q_ARG(EntityPosition, next_player_position));
        Q_ASSERT(success);
    }
}
void Server::internalUpdateNextPlayerPosition(EntityPosition next_player_position)
{
    m_next_player_position = next_player_position;
    sendPosition();
}

void Server::gotFirstPlayerPositionAndLookResponse()
{
    m_canonical_player_position.dx = 0;
    m_canonical_player_position.dy = 0;
    m_canonical_player_position.dz = 0;
    m_canonical_player_position.roll = 0;

    m_next_player_position = m_canonical_player_position;
    sendPosition();

    delete m_position_update_timer;
    m_position_update_timer = new QTimer;
    m_position_update_timer->setInterval(200);

    bool success;
    success = connect(m_position_update_timer, SIGNAL(timeout()), this, SLOT(sendPosition()));
    Q_ASSERT(success);

    m_position_update_timer->start();

    delete m_physics_timer;
    m_physics_timer = new QTimer;
    m_physics_timer->setInterval(1000 / c_physics_fps);

    success = connect(m_physics_timer, SIGNAL(timeout()), this, SLOT(doPhysics()));
    Q_ASSERT(success);

    m_physics_timer->start();

    changeLoginState(Success);
}

void Server::sendPosition()
{
    PlayerPositionAndLookRequest * request = new PlayerPositionAndLookRequest;
    toNotchianXyz(m_next_player_position, request->x, request->y, request->z);
    request->stance = m_next_player_position.stance;
    toNotchianYawPitch(m_next_player_position, request->yaw, request->pitch);
    request->on_ground = m_next_player_position.on_ground;
    sendMessage(QSharedPointer<OutgoingRequest>(request));
}

void Server::doPhysics()
{
//    if (m_canonical_player_position.on_ground) {
//        qDebug() << "standing";
//        m_canonical_player_position.dz = 0;
//    } else {
//        m_canonical_player_position.z += m_canonical_player_position.dz;
//        m_canonical_player_position.dz += c_gravity / (c_physics_fps * c_physics_fps);
//    }
//    m_next_player_position.z = m_canonical_player_position.z;
//    emit playerPositionUpdated(m_canonical_player_position);
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
