#include "Server.h"

#include <QDir>
#include <QCoreApplication>

Server::Server(ConnectionSettings connection_info, QString password, bool hardware) :
    m_connection_info(connection_info),
    m_password(password),
    m_hardware(hardware),
    m_socket_thread(NULL),
    m_socket(NULL)
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
    m_socket->connectToHost(m_connection_info.host, m_connection_info.port);
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

    if (dynamic_cast<DummyDisconnectMessage *>(msg.data()) != NULL) {
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
    changeLoginState(WaitingForMagicalResponse);
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
    if (msg.isNull()) {
        // end the connection
        qDebug() << "null message, socket disconnect";
        socketDisconnect();
        return;
    }

    // emit it if we didn't handle it
    emit messageReceived(msg);
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

void Server::setPassword(QString password)
{
    m_password = password;
}

void Server::setUsername(QString username)
{
    m_connection_info.username = username;
}

void Server::setNeedHardware(bool need_hardware)
{
    m_hardware = need_hardware;
}
