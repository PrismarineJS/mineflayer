#include "Server.h"

#include "Util.h"

#include <QDir>
#include <QCoreApplication>

const float Server::c_walking_speed = 4.27;
const int Server::c_notchian_tick_ms = 200;
const int Server::c_physics_fps = 60;
const float Server::c_gravity = -9.81;

const QString Server::c_auth_server = "www.minecraft.net";

Server::Server(QUrl connection_info) :
    m_connection_info(connection_info),
    m_socket_thread(NULL),
    m_parser(NULL),
    m_network(NULL),
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
}

void Server::initialize()
{
    Q_ASSERT(QThread::currentThread() == m_socket_thread);

    bool success;

    m_socket = new QTcpSocket(this);
    success = connect(m_socket, SIGNAL(connected()), this, SLOT(handleConnected()));
    Q_ASSERT(success);
    success = connect(m_socket, SIGNAL(disconnected()), this, SLOT(cleanUpAfterDisconnect()));
    Q_ASSERT(success);
    success = connect(m_socket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(handleSocketError(QAbstractSocket::SocketError)));
    Q_ASSERT(success);

    m_network = new QNetworkAccessManager(this);
    success = connect(m_network, SIGNAL(finished(QNetworkReply*)), this, SLOT(handleFinishedRequest(QNetworkReply*)));
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

void Server::sendMessage(QSharedPointer<OutgoingRequest> msg)
{
    if (QThread::currentThread() != m_socket_thread) {
        bool success = QMetaObject::invokeMethod(this, "sendMessage", Qt::QueuedConnection, Q_ARG(QSharedPointer<OutgoingRequest>, msg));
        Q_ASSERT(success);
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
void Server::sendRespawnRequest()
{
    sendMessage(QSharedPointer<OutgoingRequest>(new RespawnRequest));
}
void Server::sendDiggingStatus(Message::DiggingStatus status, const Int3D &coord)
{
    Int3D notchian_coord = toNotchianXyz(coord);
    sendMessage(QSharedPointer<OutgoingRequest>(new PlayerDiggingRequest(status, notchian_coord.x, notchian_coord.y, notchian_coord.z, Message::PositiveY)));
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

void Server::handleFinishedRequest(QNetworkReply * reply)
{
    QString new_url = reply->attribute(QNetworkRequest::RedirectionTargetAttribute).toString();
    if (! new_url.isEmpty()) {
        // redirect
        qDebug() << "Redirecting to" << new_url;
        m_network->get(QNetworkRequest(QUrl(new_url)));
        return;
    }
    if (m_login_state == WaitingForSessionId) {
        QByteArray data = reply->readAll();
        QString response = QString::fromUtf8(data.constData(), data.size());
        if(response == "Old Version") {
            qWarning() << "Minecraft.net says our version of the launcher is old.";
            return;
        }
        QStringList values = response.split(':', QString::SkipEmptyParts);
        if (values.size() != 4) {
            qWarning() << "Minecraft.net gave unexpected response:" << response;
            return;
        }
        m_connection_info.setUserName(values.at(2));
        QString session_id = values.at(3);

        QUrl request_url(QString("http://") + c_auth_server + QString("/game/joinserver.jsp"));
        request_url.addEncodedQueryItem("user", notchUrlEncode(m_connection_info.userName()));
        request_url.addEncodedQueryItem("sessionId", notchUrlEncode(session_id));
        request_url.addEncodedQueryItem("serverId", notchUrlEncode(m_connection_hash));
        qDebug() << "sending joinserver: " << request_url.toString();
        m_network->get(QNetworkRequest(request_url));
        changeLoginState(WaitingForNameVerification);
    } else if (m_login_state == WaitingForNameVerification) {
        QByteArray data = reply->readAll();
        QString response = QString::fromUtf8(data.constData(), data.size());
        if (response != "OK") {
            qWarning() << "Error authenticating with minecraft.net:" << response;
            return;
        }

        qDebug() << "Authentication success. sending login request.";
        changeLoginState(WaitingForLoginResponse);
        sendMessage(QSharedPointer<OutgoingRequest>(new LoginRequest(m_connection_info.userName(), m_connection_info.password())));
    }
}

QByteArray Server::notchUrlEncode(QString param)
{
    return QUrl::toPercentEncoding(param, QByteArray(), QByteArray("-._~"));
}

void Server::processIncomingMessage(QSharedPointer<IncomingResponse> incomingMessage)
{
    switch (incomingMessage.data()->messageType) {
        case Message::Login: {
            Q_ASSERT(m_login_state == WaitingForLoginResponse);
            changeLoginState(Success);
            break;
        }
        case Message::Handshake: {
            HandshakeResponse * message = (HandshakeResponse *)incomingMessage.data();
            m_connection_hash = message->connectionHash;
            Q_ASSERT(m_login_state == WaitingForHandshakeResponse);
            if (m_connection_hash == HandshakeResponse::AuthenticationNotRequired ||
                m_connection_hash == HandshakeResponse::PasswordAuthenticationRequired)
            {
                // no minecraf.net authentication required
                changeLoginState(WaitingForLoginResponse);
                sendMessage(QSharedPointer<OutgoingRequest>(new LoginRequest(m_connection_info.userName(), m_connection_info.password())));
            } else {
                // authentication with minecraft.net required
                QUrl request_url(QString("http://") + c_auth_server + QString("/game/getversion.jsp"));
                request_url.addEncodedQueryItem("user", notchUrlEncode(m_connection_info.userName()));
                request_url.addEncodedQueryItem("password", notchUrlEncode(m_connection_info.password()));
                request_url.addEncodedQueryItem("version", "12");
                qDebug() << "Sending authentication request: " << request_url.toString();
                m_network->get(QNetworkRequest(request_url));
                changeLoginState(WaitingForSessionId);
            }
            break;
        }
        case Message::Chat: {
            ChatResponse * message = (ChatResponse *)incomingMessage.data();
            emit chatReceived(message->content);
            break;
        }
        case Message::UpdateHealth: {
            UpdateHealthResponse * message = (UpdateHealthResponse*) incomingMessage.data();
            emit playerHealthUpdated(message->health);
            break;
        }
        case Message::PlayerPositionAndLook: {
            PlayerPositionAndLookResponse * message = (PlayerPositionAndLookResponse *) incomingMessage.data();
            EntityPosition player_position;
            fromNotchianXyz(player_position, message->x, message->y, message->z);
            player_position.height = message->stance - player_position.z;
            fromNotchianYawPitch(player_position, message->yaw, message->pitch);
            player_position.on_ground = message->on_ground;
            emit playerPositionAndLookUpdated(player_position);
            break;
        }
        case Message::PreChunk: {
            PreChunkResponse * message = (PreChunkResponse *) incomingMessage.data();
            if (message->mode == PreChunkResponse::Unload) {
                emit unloadChunk(fromNotchianXyz(message->x*16, 0, message->z*16));
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
            int metadata_offset = volume * 2 / 2;
            int light_offset = volume * 3 / 2;
            int sky_light_offest = volume * 4 / 2;
            int array_index = 0;
            int nibble_shifter = 0; // start with low nibble
            Int3D notchian_relative_pos;
            // traversal order is x,z,y in notchian coordinates
            for (notchian_relative_pos.x = 0; notchian_relative_pos.x < notchian_size.x; notchian_relative_pos.x++) {
                for (notchian_relative_pos.z = 0; notchian_relative_pos.z < notchian_size.z; notchian_relative_pos.z++) {
                    for (notchian_relative_pos.y = 0; notchian_relative_pos.y < notchian_size.y; notchian_relative_pos.y++) {
                        // grab all the fields for each block at once even though they're strewn accross the data structure.
                        Block block;
                        block.setType((Block::ItemType)decompressed.at(array_index));
                        block.setMetadata((decompressed.at( metadata_offset + array_index / 2) >> nibble_shifter) & 0xf);
                        block.setLight(   (decompressed.at(    light_offset + array_index / 2) >> nibble_shifter) & 0xf);
                        block.setSkyLight((decompressed.at(sky_light_offest + array_index / 2) >> nibble_shifter) & 0xf);


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
            if (m_socket->isOpen())
                m_socket->disconnectFromHost();
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
    destination.x = -notchian_z;
    // north
    destination.y = -notchian_x;
    // up
    destination.z = notchian_y;
}
Int3D Server::fromNotchianXyz(int notchian_x, int notchian_y, int notchian_z)
{
    Int3D result;
    // east
    result.x = -notchian_z;
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
    destination_notchian_z = -source.x;
    // north
    destination_notchian_x = -source.y;
    // up
    destination_notchian_y = source.z;
}
Int3D Server::toNotchianXyz(const Int3D &source)
{
    Int3D notchian;
    // east
    notchian.z = -source.x;
    // north
    notchian.x = -source.y;
    // up
    notchian.y = source.z;
    return notchian;
}

void Server::fromNotchianYawPitch(EntityPosition &destination, float notchian_yaw, float notchian_pitch)
{
    destination.yaw = Util::euclideanMod(Util::pi - Util::degreesToRadians(notchian_yaw), Util::two_pi);
    destination.pitch = Util::euclideanMod(Util::degreesToRadians(-notchian_pitch) + Util::pi, Util::two_pi) - Util::pi;
}

void Server::toNotchianYawPitch(const EntityPosition &source, float &destination_notchian_yaw, float &destination_notchian_pitch)
{
    destination_notchian_yaw = Util::radiansToDegrees(Util::pi - source.yaw);
    destination_notchian_pitch = Util::radiansToDegrees(-source.pitch);
}

void Server::sendPositionAndLook(EntityPosition positionAndLook)
{
    PlayerPositionAndLookRequest * request = new PlayerPositionAndLookRequest;
    toNotchianXyz(positionAndLook, request->x, request->y, request->z);
    request->stance = positionAndLook.height + positionAndLook.z;
    toNotchianYawPitch(positionAndLook, request->yaw, request->pitch);
    request->on_ground = positionAndLook.on_ground;
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
