#include "Server.h"

#include <QDir>
#include <QCoreApplication>

Server::Server(ConnectionSettings connection_info) :
    m_connection_info(connection_info),
    m_socket_thread(NULL),
    m_parser(NULL),
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
    m_socket->connectToHost(m_connection_info.hostname, m_connection_info.port);
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

void Server::sendMessage(QSharedPointer<OutgoingMessage> msg)
{
    if (QThread::currentThread() != m_socket_thread) {
        bool success = QMetaObject::invokeMethod(this, "sendMessage", Qt::QueuedConnection, QGenericReturnArgument(), Q_ARG(QSharedPointer<OutgoingMessage>, msg));
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

void Server::handleConnected()
{
    delete m_parser;
    m_parser = new IncomingMessageParser(m_socket);

    bool success;
    success = connect(m_parser, SIGNAL(messageReceived(QSharedPointer<IncomingMessage>)), this, SLOT(processIncomingMessage(QSharedPointer<IncomingMessage>)));
    Q_ASSERT(success);

    changeLoginState(WaitingForHandshakeResponse);
    sendMessage(QSharedPointer<OutgoingMessage>(new HandshakeRequestMessage(m_connection_info.username)));
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

void Server::processIncomingMessage(QSharedPointer<IncomingMessage> msg)
{
    // possibly handle the message (only for the initial setup)
    qDebug() << ("Received message of type: 0x" + QString::number(msg.data()->messageType, 16)).toStdString().c_str();
    switch (msg.data()->messageType) {
        case Message::Handshake: {
            HandshakeResponseMessage * message = (HandshakeResponseMessage *)msg.data();
            // we don't support authenticated logging in yet.
            Q_ASSERT_X(message->connectionHash == HandshakeResponseMessage::AuthenticationNotRequired, "",
                       (QString("unexpected connection hash: ") + message->connectionHash).toStdString().c_str());
            changeLoginState(WaitingForLoginResponse);
            sendMessage(QSharedPointer<OutgoingMessage>(new LoginRequestMessage(m_connection_info.username, m_connection_info.password)));
            break;
        }
        case Message::DisconnectOrKick: {
            // TODO: use the reason somehow
            finishWritingAndDisconnect();
            break;
        }
        default: {
            // emit it if we didn't handle it
            emit messageReceived(msg);
            break;
        }
    }
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
    this->sendMessage(QSharedPointer<OutgoingMessage>(new DummyDisconnectMessage()));
}

Server::LoginStatus Server::loginStatus()
{
    return m_login_state;
}
