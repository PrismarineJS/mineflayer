#include "Server.h"

#include "Util.h"

#include <QDir>
#include <QCoreApplication>

const float Server::c_walking_speed = 4.27;
const int Server::c_notchian_tick_ms = 200;
const int Server::c_physics_fps = 60;
const float Server::c_gravity = -9.81;

const QString Server::c_auth_server = "www.minecraft.net";

const Message::BlockFaceDirection Server::c_to_notch_face[] = {
    Message::NoDirection,
    Message::PositiveX,
    Message::NegativeX,
    Message::NegativeY,
    Message::PositiveY,
    Message::NegativeZ,
    Message::PositiveZ,
};

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
        Q_UNUSED(success);
        return;
    }
    Q_ASSERT(m_socket);

    changeLoginState(Connecting);
    m_socket->connectToHost(m_connection_info.host(), m_connection_info.port(25565));
}

void Server::finishWritingAndDisconnect()
{
    // put a dummy message on the queue
    this->sendMessage(QSharedPointer<OutgoingRequest>(new DummyDisconnectMessage()));
}

void Server::sendMessage(QSharedPointer<OutgoingRequest> msg)
{
    if (QThread::currentThread() != m_socket_thread) {
        bool success = QMetaObject::invokeMethod(this, "sendMessage", Qt::QueuedConnection, Q_ARG(QSharedPointer<OutgoingRequest>, msg));
        Q_ASSERT(success);
        Q_UNUSED(success);
        return;
    }

    if (m_socket->isOpen()) {
        if (msg.data()->messageType == Message::DummyDisconnect) {
            m_socket->disconnectFromHost();
            return;
        }

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
    Int3D notchian_coord = toNotchianIntMeters(coord);
    sendMessage(QSharedPointer<OutgoingRequest>(new PlayerDiggingRequest(status, notchian_coord.x, notchian_coord.y, notchian_coord.z, Message::PositiveY)));
}

void Server::sendBlockPlacement(const Int3D &coord, Message::BlockFaceDirection face, Item block)
{
    Int3D notchian_coord = toNotchianIntMeters(coord);
    Message::BlockFaceDirection notchian_face = toNotchianFace(face);
    sendMessage(QSharedPointer<OutgoingRequest>(new PlayerBlockPlacementRequest(notchian_coord.x, notchian_coord.y, notchian_coord.z, notchian_face, block)));
}

void Server::sendClickEntity(int self_entity_id, int target_entity_id, bool right_click)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new UseEntityRequest(self_entity_id, target_entity_id, !right_click)));
}

void Server::sendWindowClick(qint8 window_id, qint16 slot, bool is_right_click, qint16 action_id, Item item)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new WindowClickRequest(window_id, slot, is_right_click, action_id, item)));
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

    changeLoginState(WaitingForHandshakeResponse);
    sendMessage(QSharedPointer<OutgoingRequest>(new HandshakeRequest(m_connection_info.userName())));
}

void Server::cleanUpAfterDisconnect()
{
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
            LoginResponse * message = (LoginResponse *)incomingMessage.data();
            Q_ASSERT(m_login_state == WaitingForLoginResponse);
            changeLoginState(Success);
            emit loginCompleted((int)message->entity_id);
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
            EntityPosition position;
            fromNotchianDoubleMeters(position, Double3D(message->x, message->y, message->z));
            position.height = message->stance - position.pos.z;
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
            EntityPosition position;
            fromNotchianIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            emit namedPlayerSpawned(message->entity_id, message->player_name, position, message->held_item);
            break;
        }
        case Message::PickupSpawn: {
            PickupSpawnResponse * message = (PickupSpawnResponse *) incomingMessage.data();
            EntityPosition position;
            fromNotchianIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            // ignore roll
            emit pickupSpawned(message->entity_id, message->item, position);
            break;
        }
        case Message::MobSpawn: {
            MobSpawnResponse * message = (MobSpawnResponse *) incomingMessage.data();
            EntityPosition position;
            fromNotchianIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
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
            EntityPosition movement;
            fromNotchianIntPixels(movement, Int3D(message->pixels_dx, message->pixels_dy, message->pixels_dz));
            emit entityMovedRelatively(message->entity_id, movement);
            break;
        }
        case Message::EntityLook: {
            EntityLookResponse * message = (EntityLookResponse *) incomingMessage.data();
            EntityPosition look;
            fromNotchianYawPitchBytes(look, message->yaw_out_of_256, message->pitch_out_of_256);
            emit entityLooked(message->entity_id, look);
            break;
        }
        case Message::EntityLookAndRelativeMove: {
            EntityLookAndRelativeMoveResponse * message = (EntityLookAndRelativeMoveResponse *) incomingMessage.data();
            EntityPosition position;
            fromNotchianIntPixels(position, Int3D(message->pixels_dx, message->pixels_dy, message->pixels_dz));
            fromNotchianYawPitchBytes(position, message->yaw_out_of_256, message->pitch_out_of_256);
            emit entityLookedAndMovedRelatively(message->entity_id, position);
            break;
        }
        case Message::EntityTeleport: {
            EntityTeleportResponse * message = (EntityTeleportResponse *) incomingMessage.data();
            EntityPosition position;
            fromNotchianIntPixels(position, Int3D(message->pixels_x, message->pixels_y, message->pixels_z));
            emit entityMoved(message->entity_id, position);
            break;
        }
        case Message::PreChunk: {
            PreChunkResponse * message = (PreChunkResponse *) incomingMessage.data();
            if (message->mode == PreChunkResponse::Unload) {
                emit unloadChunk(fromNotchianChunk(message->x, message->z));
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
            Int3D rotated_size = fromNotchianIntMetersWithoutOffByOneCorrection(notchian_size);
            Int3D positive_size;
            positive_size.x = Util::abs(rotated_size.x);
            positive_size.y = Util::abs(rotated_size.y);
            positive_size.z = Util::abs(rotated_size.z);
            int volume = positive_size.x * positive_size.y * positive_size.z;

            // determin the position of the chunk
            Int3D rotated_size_minus_positive_size = rotated_size - positive_size;
            Int3D notchian_pos(message->x, message->y, message->z);
            Int3D rotated_position = fromNotchianIntMetersWithoutOffByOneCorrection(notchian_pos);
            Int3D position = rotated_position + rotated_size_minus_positive_size / 2;

            // decompress the data
            QByteArray uncrompressable_data = message->compressed_data;
            // prepend a guess of the final size. we know the final size is volume * 2.5;
            qint32 decompressed_size = volume * 5 / 2;
            QByteArray decompressed_size_array;
            QDataStream(&decompressed_size_array, QIODevice::WriteOnly) << decompressed_size;
            uncrompressable_data.prepend(decompressed_size_array);
            QByteArray decompressed = qUncompress(uncrompressable_data);
            if (decompressed.size() != decompressed_size) {
                qWarning() << "ignoring corrupt map chunk update";
                return;
            }

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
                        block.setType((Item::ItemType)decompressed.at(array_index));
                        block.setMetadata((decompressed.at( metadata_offset + array_index / 2) >> nibble_shifter) & 0xf);
                        block.setLight(   (decompressed.at(    light_offset + array_index / 2) >> nibble_shifter) & 0xf);
                        block.setSkyLight((decompressed.at(sky_light_offest + array_index / 2) >> nibble_shifter) & 0xf);

                        array_index++;
                        nibble_shifter = 4 - nibble_shifter; // toggle between 0 and 4.

                        Int3D notchian_absolute_pos = notchian_pos + notchian_relative_pos;
                        Int3D absolute_pos = fromNotchianIntMeters(notchian_absolute_pos);
                        Int3D relative_pos = absolute_pos - position;
                        chunk->setBlock(relative_pos, block);
                    }
                }
            }
            emit mapChunkUpdated(QSharedPointer<Chunk>(chunk));
            break;
        }
        case Message::MultiBlockChange: {
            MultiBlockChangeResponse * message = (MultiBlockChangeResponse *) incomingMessage.data();
            Int3D notchian_chunk_corner(message->chunk_x, 0, message->chunk_z);
            Int3D chunk_corner = fromNotchianChunk(message->chunk_x, message->chunk_z);
            QHash<Int3D, Block> new_blocks;
            for (int i = 0; i < message->block_coords.size(); i++) {
                Int3D absolute_location = fromNotchianIntMeters(notchian_chunk_corner + message->block_coords.at(i));
                Block block(message->new_block_types.at(i), message->new_block_metadatas.at(i), 0, 0);
                new_blocks.insert(absolute_location, block);
            }
            emit multiBlockUpdate(chunk_corner, new_blocks);
            break;
        }
        case Message::BlockChange: {
            BlockChangeResponse * message = (BlockChangeResponse *) incomingMessage.data();
            Int3D coord = fromNotchianIntMeters(Int3D(message->x, message->y, message->z));
            Block block(message->new_block_type, message->metadata, 0, 0);
            emit blockUpdate(coord, block);
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
        default: {
//            qDebug() << "ignoring message type: 0x" << QString::number(incomingMessage.data()->messageType, 16).toStdString().c_str();
            break;
        }
    }
}

void Server::fromNotchianDoubleMeters(EntityPosition &destination, Double3D notchian)
{
    // east
    destination.pos.x = -notchian.z;
    // north
    destination.pos.y = -notchian.x;
    // up
    destination.pos.z = notchian.y;
}
void Server::fromNotchianIntPixels(EntityPosition &destination, Int3D pixels)
{
    fromNotchianDoubleMeters(destination, Double3D(pixels.x / 32.0, pixels.y / 32.0, pixels.z / 32.0));
}

Int3D Server::fromNotchianChunk(int notchian_chunk_x, int notchian_chunk_z)
{
    // 4 * 32 = 128
    return fromNotchianIntMeters(Int3D(notchian_chunk_x, 4, notchian_chunk_z)) * 32;
}
Int3D Server::fromNotchianIntMeters(Int3D notchian_xyz)
{
    Int3D result;
    // east
    result.x = -notchian_xyz.z - 1;
    // north
    result.y = -notchian_xyz.x - 1;
    // up
    result.z = notchian_xyz.y;
    return result;
}
Int3D Server::fromNotchianIntMetersWithoutOffByOneCorrection(Int3D notchian_xyz)
{
    Int3D result;
    // east
    result.x = -notchian_xyz.z;
    // north
    result.y = -notchian_xyz.x;
    // up
    result.z = notchian_xyz.y;
    return result;
}

void Server::toNotchianDoubleMeters(const EntityPosition &source, double &destination_notchian_x, double &destination_notchian_y, double &destination_notchian_z)
{
    // east
    destination_notchian_z = -source.pos.x;
    // north
    destination_notchian_x = -source.pos.y;
    // up
    destination_notchian_y = source.pos.z;
}
Int3D Server::toNotchianIntMeters(const Int3D &source)
{
    Int3D notchian;
    // east
    notchian.z = -source.x - 1;
    // north
    notchian.x = -source.y - 1;
    // up
    notchian.y = source.z;
    return notchian;
}

void Server::fromNotchianYawPitch(EntityPosition &destination, float notchian_yaw, float notchian_pitch)
{
    destination.yaw = Util::euclideanMod(Util::pi - Util::degreesToRadians(notchian_yaw), Util::two_pi);
    destination.pitch = Util::euclideanMod(Util::degreesToRadians(-notchian_pitch) + Util::pi, Util::two_pi) - Util::pi;
}
void Server::fromNotchianYawPitchBytes(EntityPosition &destination, qint8 yaw_out_of_255, qint8 pitch_out_of_255)
{
    fromNotchianYawPitch(destination, yaw_out_of_255 * 360.0 / 256.0, pitch_out_of_255 * 360.0 / 256.0);
}

void Server::toNotchianYawPitch(const EntityPosition &source, float &destination_notchian_yaw, float &destination_notchian_pitch)
{
    destination_notchian_yaw = Util::radiansToDegrees(Util::pi - source.yaw);
    destination_notchian_pitch = Util::radiansToDegrees(-source.pitch);
}

Message::BlockFaceDirection Server::toNotchianFace(Message::BlockFaceDirection face) {
    Q_ASSERT(face >= -1 && face < 6);
    return (Message::BlockFaceDirection) c_to_notch_face[face+1];
}

void Server::sendPositionAndLook(EntityPosition positionAndLook)
{
    PlayerPositionAndLookRequest * request = new PlayerPositionAndLookRequest;
    toNotchianDoubleMeters(positionAndLook, request->x, request->y, request->z);
    request->stance = positionAndLook.height + positionAndLook.pos.z;
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
    switch (error) {
    case QAbstractSocket::ConnectionRefusedError:
    case QAbstractSocket::HostNotFoundError:
    case QAbstractSocket::SocketAccessError:
    case QAbstractSocket::ProxyConnectionRefusedError:
    case QAbstractSocket::ProxyNotFoundError:
        qDebug() << "Could not make connection: " << error;
        changeLoginState(SocketError);
        break;
    default:;
    }
}

void Server::sendCloseWindow(qint8 window_id)
{
    sendMessage(QSharedPointer<OutgoingRequest>(new CloseWindowRequest(window_id)));
}
