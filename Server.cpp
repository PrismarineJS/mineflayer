#include "Server.h"

#include <QDir>
#include <QCoreApplication>

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
            // TODO: check north/south/east/west
            player_position.x = message->x;
            player_position.y = message->z;
            player_position.z = message->y;
            player_position.stance = message->stance;
            // TODO: rotate yaw
            player_position.yaw = message->yaw;
            // TODO: check pitch
            player_position.pitch = message->pitch;
            player_position.roll = 0.0f;
            player_position.on_ground = message->on_ground;
            if (m_login_state == WaitingForPlayerPositionAndLook)
                gotFirstPlayerPositionAndLookResponse();
            break;
        }
        case Message::MapChunk: {
            MapChunkResponse * message = (MapChunkResponse *) incomingMessage.data();

            // remember to swap y and z
            QByteArray tmp = message->compressed_data;
            // prepend a guess at the final size... or just 0.
            tmp.prepend(QByteArray("\0\0\0\0", 4));
            QByteArray decompressed = qUncompress(tmp);

            // determine the chunk corner
            Chunk::Coord position;
            position.x = message->x;
            position.y = message->z;
            position.z = message->y;
            Chunk::Coord size;
            size.x = message->size_x_minus_one + 1;
            size.y = message->size_z_minus_one + 1;
            size.z = message->size_y_minus_one + 1;

            QSharedPointer<Chunk> chunk = QSharedPointer<Chunk>(new Chunk(position, size));

            int array_index = 0;
            Chunk::Coord relative_pos;
            for (relative_pos.x = 0; relative_pos.x < size.x; relative_pos.x++) {
                for (relative_pos.y = 0; relative_pos.y < size.y; relative_pos.y++) {
                    for (relative_pos.z = 0; relative_pos.z < size.z; relative_pos.z++) {
                        int block_type = decompressed.at(array_index++);
                        chunk.data()->getBlock(relative_pos).data()->type = block_type;
                    }
                }
            }
            emit mapChunkUpdated(chunk);
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

void Server::gotFirstPlayerPositionAndLookResponse()
{
    delete m_position_update_timer;
    m_position_update_timer = new QTimer();
    m_position_update_timer->setInterval(200);

    bool success;
    success = connect(m_position_update_timer, SIGNAL(timeout()), this, SLOT(timeToSendPosition()));
    Q_ASSERT(success);

    m_position_update_timer->start();

    changeLoginState(Success);
}

void Server::timeToSendPosition()
{
    qDebug() << "time to send position";
    sendPosition();
}

void Server::sendPosition()
{
    PlayerPositionAndLookRequest * request = new PlayerPositionAndLookRequest;
    // TODO: check everything
    request->x = player_position.x;
    request->z = player_position.y;
    request->y = player_position.z;
    request->stance = player_position.stance;
    request->yaw = player_position.yaw;
    request->pitch = player_position.pitch;
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
