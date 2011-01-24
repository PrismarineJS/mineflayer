#ifndef MESSAGE_HANDLER_H
#define MESSAGE_HANDLER_H

#include "ConnectionSettings.h"
#include "Messages.h"
#include "IncomingMessageParser.h"

#include <QObject>
#include <QThread>
#include <QTcpSocket>
#include <QSharedPointer>

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
        WaitingForHandshakeResponse,
        WaitingForLoginResponse,
        ServerIsBogus,
        LoginIsInvalid,
        InsufficientPrivileges,
        Success,
        SocketError,
    };


    explicit Server(ConnectionSettings connection_info);
    ~Server();

    void setUsername(QString username);

    // returns the ConnectionResultMessage that the server gave upon connection
    QSharedPointer<IncomingResponse> connectionResultMessage() const { return m_connection_result; }

    const ConnectionSettings * connectionSettings() const { return &m_connection_info; }

signals:
    // use this signal to listen for incoming messages
    void messageReceived(QSharedPointer<IncomingResponse> message);

    void loginStatusUpdated(LoginStatus status);
    void socketDisconnected();

public slots:
    void sendMessage(QSharedPointer<OutgoingRequest> message);

    // use this to actually connect to the server
    void socketConnect();

    // disconnects immediately, without finishing writing or reading messages.
    void socketDisconnect();

    // finishes up the outgoing message queue and then performs socketDisconnect.
    void finishWritingAndDisconnect();

public:
    LoginStatus loginStatus();

private:
    ConnectionSettings m_connection_info;

    QThread * m_socket_thread;
    QTcpSocket * m_socket;
    IncomingMessageParser * m_parser;

    LoginStatus m_login_state;

    QSharedPointer<IncomingResponse> m_connection_result;

private:
    void changeLoginState(LoginStatus state);

private slots:
    void initialize();
    void terminate();
    void handleConnected();
    void cleanUpAfterDisconnect();
    void processIncomingMessage(QSharedPointer<IncomingResponse>);
    void handleSocketError(QAbstractSocket::SocketError);
};


#endif
