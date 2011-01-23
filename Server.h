#ifndef MESSAGE_HANDLER_H
#define MESSAGE_HANDLER_H

#include "ConnectionSettings.h"
#include "Messages.h"

#include <QObject>
#include <QThread>
#include <QTcpSocket>
#include <QSharedPointer>

// MessageHandler has a QTcpSocket to talk to the server.
// use it to send messages and connect to it to hear it emit incoming messages.
// this object runs in its own thread which it manages for you, but you must
// never call a slot directly.
class Server : public QObject
{
    Q_OBJECT
public:
    enum LoginStatus
    {
        Disconnected,
        Connecting,
        WaitingForMagicalResponse,
        WaitingForConnectionResult,
        ServerIsBogus,
        LoginIsInvalid,
        InsufficientPrivileges,
        Success,
        SocketError,
    };


    explicit Server(ConnectionSettings connection_info, QString password = QString(), bool hardware = false);
    ~Server();

    void setPassword(QString password);
    void setUsername(QString username);
    void setNeedHardware(bool need_hardware);

    // returns the ConnectionResultMessage that the server gave upon connection
    QSharedPointer<IncomingMessage> connectionResultMessage() const { return m_connection_result; }

    const ConnectionSettings * connectionSettings() const { return &m_connection_info; }

signals:
    // use this signal to listen for incoming messages
    void messageReceived(QSharedPointer<IncomingMessage> message);

    void loginStatusUpdated(LoginStatus status);
    void socketDisconnected();

    // gives you progress of incoming messages.
    // don't try to access the data of message because it will be garbage. do that in
    // messageReceived. use it only to tell messages apart. You are, however, guaranteed
    // ability to read message->type.
    void progress(qint64 bytesTransferred, qint64 bytesTotal, IncomingMessage * message);

    void pingComputed(int ms);

public slots:
    void sendMessage(QSharedPointer<OutgoingMessage> message);

    // use this to actually connect to the server
    void socketConnect();

    // disconnects immediately, without finishing writing or reading messages.
    void socketDisconnect();

    // finishes up the outgoing message queue and then performs socketDisconnect.
    void finishWritingAndDisconnect();

public:
    LoginStatus loginStatus();

private:
    static const int c_client_major_version;
    static const int c_client_minor_version;
    static const int c_client_build_version;
    static const int c_server_major_version;
    static const int c_server_minor_version;
    static const int c_server_build_version;

    ConnectionSettings m_connection_info;
    QString m_password;
    bool m_hardware;

    QThread * m_socket_thread;
    QTcpSocket * m_socket;

    LoginStatus m_login_state;

    QSharedPointer<IncomingMessage> m_connection_result;

private:
    void changeLoginState(LoginStatus state);

private slots:
    void initialize();
    void terminate();
    void handleConnected();
    void cleanUpAfterDisconnect();
    void processIncomingMessage(QSharedPointer<IncomingMessage>);
    void handleSocketError(QAbstractSocket::SocketError);
};


#endif
