#include "Server.h"

#include "Util.h"

#include <QDir>

const float Server::c_walking_speed = 4.27;
const int Server::c_notchian_tick_ms = 200;
const int Server::c_physics_fps = 60;
const float Server::c_gravity = -9.81;

const QString Server::c_auth_server = "www.minecraft.net";

Server::Server(QUrl connection_info) :
    m_connection_info(connection_info),
    m_thread(NULL),
    m_parser(NULL),
    m_network(NULL),
    m_physics_timer(NULL),
    m_login_state(mineflayer_DisconnectedStatus)
{
    // we run in m_thread
    m_thread = new QThread(this);
    m_thread->start();
    this->moveToThread(m_thread);

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
    Q_ASSERT(QThread::currentThread() == m_thread);

    bool success;

    m_socket = new QTcpSocket(this);
    success = connect(m_socket, SIGNAL(connected()), this, SLOT(handleConnected()));
    Q_ASSERT(success);
    success = connect(m_socket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(handleSocketError(QAbstractSocket::SocketError)));
    Q_ASSERT(success);

    m_network = new QNetworkAccessManager(this);
    success = connect(m_network, SIGNAL(finished(QNetworkReply*)), this, SLOT(handleFinishedRequest(QNetworkReply*)));
    Q_ASSERT(success);
}

void Server::socketConnect()
{
    if (QThread::currentThread() != m_thread) {
        bool success = QMetaObject::invokeMethod(this, "socketConnect", Qt::QueuedConnection);
        Q_ASSERT(success);
        Q_UNUSED(success);
        return;
    }
    Q_ASSERT(m_socket);

    changeLoginState(mineflayer_ConnectingStatus);
    m_socket->connectToHost(m_connection_info.host(), m_connection_info.port(25565));
}

void Server::sendMessage(QSharedPointer<OutgoingRequest> msg)
{
    if (QThread::currentThread() != m_thread) {
        bool success = QMetaObject::invokeMethod(this, "sendMessage", Qt::QueuedConnection, Q_ARG(QSharedPointer<OutgoingRequest>, msg));
        Q_ASSERT(success);
        Q_UNUSED(success);
        return;
    }

    if (!m_socket->isOpen())
        return;
    QDataStream stream(m_socket);
    msg.data()->writeToStream(stream);
}

void Server::sendChat(QString message)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new ChatRequest(message)));
}
void Server::sendRespawnRequest(int world)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new RespawnRequest(world)));
}
void Server::sendDiggingStatus(Message::DiggingStatus status, const Int3D &coord)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new PlayerDiggingRequest(status, coord.x, coord.y, coord.z, mineflayer_PositiveY)));
}

void Server::sendBlockPlacement(const Int3D &coord, mineflayer_BlockFaceDirection face, Item block)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new PlayerBlockPlacementRequest(coord.x, coord.y, coord.z, face, block)));
}

void Server::sendClickEntity(int self_entity_id, int target_entity_id, bool right_click)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new UseEntityRequest(self_entity_id, target_entity_id, !right_click)));
}
void Server::sendAnimation(int entity_id, mineflayer_AnimationType animation_type)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new AnimationRequest(entity_id, animation_type)));
}

void Server::sendWindowClick(qint8 window_id, qint16 slot, bool is_right_click, qint16 action_id, bool is_shift, Item item)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new WindowClickRequest(window_id, slot, is_right_click, action_id, is_shift, item)));
}

void Server::sendHoldingChange(qint16 slot)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new HoldingChangeRequest(slot)));
}

void Server::handleConnected()
{
    delete m_parser;
    m_parser = new IncomingMessageParser(m_socket);

    bool success;
    success = connect(m_parser, SIGNAL(messageReceived(QSharedPointer<IncomingResponse>)), this, SLOT(processIncomingMessage(QSharedPointer<IncomingResponse>)));
    Q_ASSERT(success);

    changeLoginState(mineflayer_WaitingForHandshakeResponseStatus);
    sendMessage(QSharedPointer<OutgoingRequest>(new HandshakeRequest(m_connection_info.userName())));
}

void Server::cleanup()
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    sendMessage(QSharedPointer<OutgoingRequest>(new DisconnectRequest));
    if (m_socket->state() != QAbstractSocket::UnconnectedState) {
        // flush and disconnect
        m_socket->waitForBytesWritten(1000);
        m_socket->disconnectFromHost();
    }

    m_thread->exit();
    changeLoginState(mineflayer_DisconnectedStatus);
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
    if (m_login_state == mineflayer_WaitingForSessionIdStatus) {
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
        changeLoginState(mineflayer_WaitingForNameVerificationStatus);
    } else if (m_login_state == mineflayer_WaitingForNameVerificationStatus) {
        QByteArray data = reply->readAll();
        QString response = QString::fromUtf8(data.constData(), data.size());
        if (response != "OK") {
            qWarning() << "Error authenticating with minecraft.net:" << response;
            return;
        }

        qDebug() << "Authentication success. sending login request.";
        changeLoginState(mineflayer_WaitingForLoginResponseStatus);
        sendMessage(QSharedPointer<OutgoingRequest>(new LoginRequest(m_connection_info.userName())));
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
            LoginResponse * message = (LoginResponse *)incomingMessage.data();
            Q_ASSERT(m_login_state == mineflayer_WaitingForLoginResponseStatus);
            changeLoginState(mineflayer_SuccessStatus);
            emit loginCompleted((int)message->entity_id);
            break;
        }
        case Message::Handshake: {
            HandshakeResponse * message = (HandshakeResponse *)incomingMessage.data();
            m_connection_hash = message->connectionHash;
            Q_ASSERT(m_login_state == mineflayer_WaitingForHandshakeResponseStatus);
            if (m_connection_hash == HandshakeResponse::AuthenticationNotRequired ||
                m_connection_hash == HandshakeResponse::PasswordAuthenticationRequired)
            {
                // no minecraf.net authentication required
                changeLoginState(mineflayer_WaitingForLoginResponseStatus);
                sendMessage(QSharedPointer<OutgoingRequest>(new LoginRequest(m_connection_info.userName())));
            } else {
                // authentication with minecraft.net required
                QUrl request_url(QString("http://") + c_auth_server + QString("/game/getversion.jsp"));
                request_url.addEncodedQueryItem("user", notchUrlEncode(m_connection_info.userName()));
                request_url.addEncodedQueryItem("password", notchUrlEncode(m_connection_info.password()));
                request_url.addEncodedQueryItem("version", "12");
                qDebug() << "Sending authentication request: " << request_url.toString();
                m_network->get(QNetworkRequest(request_url));
                changeLoginState(mineflayer_WaitingForSessionIdStatus);
            }
            break;
        }
        case Message::Chat: {
            ChatResponse * message = (ChatResponse *)incomingMessage.data();
            emit chatReceived(message->content);
            break;
        }
        case Message::TimeUpdate: {
            TimeUpdateResponse * message = (TimeUpdateResponse *)incomingMessage.data();
            emit timeUpdated(Util::euclideanMod(message->game_time_in_twentieths_of_a_second / 20.0, 1200.0));
            break;
        }
        case Message::UpdateHealth: {
            UpdateHealthResponse * message = (UpdateHealthResponse*) incomingMessage.data();
            emit playerHealthUpdated(message->health);
            break;
        }
        case Message::PlayerPositionAndLook: {
            PlayerPositionAndLookResponse * message = (PlayerPositionAndLookResponse *) incomingMessage.data();
            mineflayer_EntityPosition position;
            position.pos.x = message->x;
            position.pos.y = message->y;
            position.pos.z = message->z;
            position.height = message->stance - position.pos.y;
            fromNotchianYawPitch(position, message->yaw, message->pitch);
            position.on_ground = message->on_ground;
            emit playerPositionAndLookUpdated(position);
            break;
        }
        case Message::Animation: {
            AnimationResponse * message = (AnimationResponse *) incomingMessage.data();
            emit animation(message->entity_id, message->animation_type);
            break;
        }
        case Message::NamedEntitySpawn: {
            NamedEntitySpawnResponse * message = (NamedEntitySpawnResponse *) incomingMessage.data();
            mineflayer_EntityPosition position;
            fromIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            emit namedPlayerSpawned(message->entity_id, message->player_name, position, message->held_item);
            break;
        }
        case Message::PickupSpawn: {
            PickupSpawnResponse * message = (PickupSpawnResponse *) incomingMessage.data();
            mineflayer_EntityPosition position;
            fromIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            // ignore roll
            emit pickupSpawned(message->entity_id, message->item, position);
            break;
        }
        case Message::MobSpawn: {
            MobSpawnResponse * message = (MobSpawnResponse *) incomingMessage.data();
            mineflayer_EntityPosition position;
            fromIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            emit mobSpawned(message->entity_id, message->mob_type, position);
            break;
        }
        case Message::DestroyEntity: {
            DestroyEntityResponse * message = (DestroyEntityResponse *) incomingMessage.data();
            emit entityDestroyed(message->entity_id);
            break;
        }
        case Message::EntityRelativeMove: {
            EntityRelativeMoveResponse * message = (EntityRelativeMoveResponse *) incomingMessage.data();
            mineflayer_EntityPosition movement;
            fromIntPixels(movement, Int3D(message->pixels_dx, message->pixels_dy, message->pixels_dz));
            emit entityMovedRelatively(message->entity_id, movement);
            break;
        }
        case Message::EntityLook: {
            EntityLookResponse * message = (EntityLookResponse *) incomingMessage.data();
            mineflayer_EntityPosition look;
            fromNotchianYawPitchBytes(look, message->yaw_out_of_256, message->pitch_out_of_256);
            emit entityLooked(message->entity_id, look);
            break;
        }
        case Message::EntityLookAndRelativeMove: {
            EntityLookAndRelativeMoveResponse * message = (EntityLookAndRelativeMoveResponse *) incomingMessage.data();
            mineflayer_EntityPosition position;
            fromIntPixels(position, Int3D(message->pixels_dx, message->pixels_dy, message->pixels_dz));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            emit entityLookedAndMovedRelatively(message->entity_id, position);
            break;
        }
        case Message::EntityTeleport: {
            EntityTeleportResponse * message = (EntityTeleportResponse *) incomingMessage.data();
            mineflayer_EntityPosition position;
            fromIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            emit entityMoved(message->entity_id, position);
            break;
        }
        case Message::EntityStatus: {
            EntityStatusResponse * message = (EntityStatusResponse *) incomingMessage.data();
            switch (message->status) {
                case 2: // enum this?
                    emit animation(message->entity_id, mineflayer_DamageAnimation);
                    break;
                case 3:
                    emit animation(message->entity_id, mineflayer_DeathAnimation);
                    break;
            }
            break;
        }
        case Message::EntityAction: {
            EntityActionResponse * message = (EntityActionResponse *) incomingMessage.data();
            switch (message->entity_action_type) {
                case EntityActionResponse::Crouch:
                    emit animation(message->entity_id, mineflayer_CrouchAnimation);
                    break;
                case EntityActionResponse::Uncrouch:
                    emit animation(message->entity_id, mineflayer_UncrouchAnimation);
                    break;
            }
            break;
        }
        case Message::PreChunk: {
            PreChunkResponse * message = (PreChunkResponse *) incomingMessage.data();
            if (message->mode == PreChunkResponse::Unload) {
                emit unloadChunk(fromChunkCoordinates(message->x, message->z));
            } else {
                // don't care about Load Chunk messages
            }
            break;
        }
        case Message::MapChunk: {
            MapChunkResponse * message = (MapChunkResponse *) incomingMessage.data();

            Int3D position(message->x, message->y, message->z);
            Int3D size(message->size_x_minus_one + 1, message->size_y_minus_one + 1, message->size_z_minus_one + 1);

            // decompress the data
            QByteArray uncrompressable_data = message->compressed_data;
            // prepend a guess of the final size. we know the final size is volume * 2.5;
            qint32 decompressed_size = (size.x * size.y * size.z) * 5 / 2;
            QByteArray decompressed_size_array;
            QDataStream(&decompressed_size_array, QIODevice::WriteOnly) << decompressed_size;
            uncrompressable_data.prepend(decompressed_size_array);
            // decompress
            QByteArray decompressed = qUncompress(uncrompressable_data);
            if (decompressed.size() != decompressed_size) {
                qWarning() << "ignoring corrupt map chunk update with start" <<
                        position.x << position.y << position.z << "and supposed size" <<
                        size.x << size.y << size.z << "but decompressed size of" <<
                        decompressed.size() << "instead of" << decompressed_size;
                return;
            }

            emit mapChunkUpdated(QSharedPointer<Chunk>(new Chunk(position, size, decompressed)));
            break;
        }
        case Message::MultiBlockChange: {
            MultiBlockChangeResponse * message = (MultiBlockChangeResponse *) incomingMessage.data();
            Int3D chunk_corner = fromChunkCoordinates(message->chunk_x, message->chunk_z);
            QHash<Int3D, Block> new_blocks;
            for (int i = 0; i < message->block_coords.size(); i++) {
                Int3D absolute_location = chunk_corner + message->block_coords.at(i);
                Block block(message->new_block_types.at(i), message->new_block_metadatas.at(i), 0, 0);
                new_blocks.insert(absolute_location, block);
            }
            emit multiBlockUpdate(chunk_corner, new_blocks);
            break;
        }
        case Message::BlockChange: {
            BlockChangeResponse * message = (BlockChangeResponse *) incomingMessage.data();
            Int3D position(message->x, message->y, message->z);
            Block block(message->new_block_type, message->metadata, 0, 0);
            emit blockUpdate(position, block);
            break;
        }
        case Message::SetSlot: {
            SetSlotResponse * message = (SetSlotResponse *) incomingMessage.data();
            emit windowSlotUpdated(message->window_id, message->slot, message->item);
            break;
        }
        case Message::WindowItems: {
            WindowItemsResponse * message = (WindowItemsResponse *) incomingMessage.data();
            emit windowItemsUpdated(message->window_id, message->items);
            break;
        }
        case Message::DisconnectOrKick: {
            DisconnectOrKickResponse * message = (DisconnectOrKickResponse *)incomingMessage.data();
            qDebug() << "got disconnected: " << message->reason;
            if (m_socket->isOpen())
                m_socket->disconnectFromHost();
            break;
        }
        case Message::HoldingChange: {
            HoldingChangeResponse * message = (HoldingChangeResponse *) incomingMessage.data();
            emit holdingChange(message->slot);
            break;
        }
        case Message::Transaction: {
            TransactionResponse * message = (TransactionResponse *) incomingMessage.data();
            emit transaction(message->window_id, message->action_id, message->is_accepted);
            break;
        }
        case Message::OpenWindow: {
            OpenWindowResponse * message = (OpenWindowResponse *) incomingMessage.data();
            emit openWindow(message->window_id, message->inventory_type, message->number_of_slots);
            break;
        }
        case Message::UpdateSign: {
            UpdateSignResponse * message = (UpdateSignResponse *) incomingMessage.data();
            Int3D position(message->meters_x, message->meters_y, message->meters_z);
            QString text = message->line_1 + "\n" + message->line_2 + "\n" + message->line_3 + "\n" + message->line_4;
            emit signUpdated(position, text);
            break;
        }
        case Message::Respawn: {
            RespawnResponse * message = (RespawnResponse *) incomingMessage.data();
            emit respawned(message->world);
            break;
        }
        default: {
//            qDebug() << "ignoring message type: 0x" << QString::number(incomingMessage.data()->messageType, 16).toStdString().c_str();
            break;
        }
    }
}

void Server::fromIntPixels(mineflayer_EntityPosition &destination, Int3D pixels)
{
    destination.pos.x = pixels.x / 32.0;
    destination.pos.y = pixels.y / 32.0;
    destination.pos.z = pixels.z / 32.0;
}

Int3D Server::fromChunkCoordinates(int chunk_x, int chunk_z)
{
    return Int3D(chunk_x * 32, 0, chunk_z * 32);
}

void Server::fromNotchianYawPitch(mineflayer_EntityPosition &destination, float notchian_yaw, float notchian_pitch)
{
    destination.yaw = Util::euclideanMod(Util::pi - Util::degreesToRadians(notchian_yaw), Util::two_pi);
    destination.pitch = Util::euclideanMod(Util::degreesToRadians(-notchian_pitch) + Util::pi, Util::two_pi) - Util::pi;
}
void Server::fromNotchianYawPitchBytes(mineflayer_EntityPosition &destination, qint8 yaw_out_of_255, qint8 pitch_out_of_255)
{
    fromNotchianYawPitch(destination, yaw_out_of_255 * 360.0 / 256.0, pitch_out_of_255 * 360.0 / 256.0);
}

void Server::toNotchianYawPitch(const mineflayer_EntityPosition &source, float &destination_notchian_yaw, float &destination_notchian_pitch)
{
    destination_notchian_yaw = Util::radiansToDegrees(Util::pi - source.yaw);
    destination_notchian_pitch = Util::radiansToDegrees(-source.pitch);
}

void Server::sendPositionAndLook(mineflayer_EntityPosition positionAndLook)
{
    PlayerPositionAndLookRequest * request = new PlayerPositionAndLookRequest;
    request->x = positionAndLook.pos.x;
    request->y = positionAndLook.pos.y;
    request->z = positionAndLook.pos.z;
    request->stance = positionAndLook.height + positionAndLook.pos.y;
    toNotchianYawPitch(positionAndLook, request->yaw, request->pitch);
    request->on_ground = positionAndLook.on_ground;
    sendMessage(QSharedPointer<OutgoingRequest>(request));
}

void Server::changeLoginState(mineflayer_LoginStatus state)
{
    m_login_state = state;
    emit loginStatusUpdated(state);
}

void Server::handleSocketError(QAbstractSocket::SocketError error)
{
    switch (error) {
    case QAbstractSocket::ConnectionRefusedError:
    case QAbstractSocket::HostNotFoundError:
    case QAbstractSocket::SocketAccessError:
    case QAbstractSocket::ProxyConnectionRefusedError:
    case QAbstractSocket::ProxyNotFoundError:
        qDebug() << "Could not make connection: " << error;
        changeLoginState(mineflayer_SocketErrorStatus);
        break;
    default:;
    }
}

void Server::sendCloseWindow(qint8 window_id)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new CloseWindowRequest(window_id)));
}
