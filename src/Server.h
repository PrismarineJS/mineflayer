#ifndef MESSAGE_HANDLER_H
#define MESSAGE_HANDLER_H

#include "Messages.h"
#include "IncomingMessageParser.h"

#include <QObject>
#include <QThread>
#include <QTcpSocket>
#include <QSharedPointer>
#include <QUrl>
#include <QTimer>
#include <QNetworkAccessManager>
#include <QNetworkReply>

// sends and receives messages and translates to/from notch's data formats and coordinate system.
// abstracts data format, but not semantics and policies.
// you have to know how often to send a player position and look, but you don't need to how the data is stored in the message.
// this object runs in its own thread which it manages for you.
class Server : public QObject
{
    Q_OBJECT
public:
    enum LoginStatus
    {
        Disconnected,
        Connecting,
        WaitingForHandshakeResponse,
        WaitingForSessionId,
        WaitingForNameVerification,
        WaitingForLoginResponse,
        Success,
        SocketError,
    };

    struct EntityPosition
    {
        double x; // east
        double y; // north
        double z; // up
        double dx;
        double dy;
        double dz;
        double stance; // [0.1, 1.65] how tall you are.
        float yaw; // [0, 2pi] rotation around z axis. 0 is +x. pi/2 is +y. pi is -x. 3pi/2 is -y.
        float pitch; // [-pi/2, pi/2] 0 is parallel to the ground. pi/2 is up. -pi/2 is down.
        float roll; // [-pi, pi] usually ignored. 0 is level. pi/2 is left ear pointing downward.
        bool on_ground;
    };


    explicit Server(QUrl connection_info);
    ~Server();

signals:
    void loginStatusUpdated(Server::LoginStatus status);
    void socketDisconnected();

    void chatReceived(QString content);
    void mapChunkUpdated(QSharedPointer<Chunk> chunk);
    void unloadChunk(Int3D coord);
    void playerPositionAndLookUpdated(Server::EntityPosition position);
    void inventoryUpdated(QVector<Message::Item> inventory);

public slots:
    // actually connect to the server
    void socketConnect();

public:
    void sendPositionAndLook(EntityPosition positionAndLook);
    // sends a chat message. can start with '/' to be a command.
    void sendChat(QString message);

private:
    static const QString c_auth_server;
    QUrl m_connection_info;

    QThread * m_socket_thread;
    QTcpSocket * m_socket;
    IncomingMessageParser * m_parser;
    QTimer * m_position_update_timer;
    QNetworkAccessManager * m_network;

    static const float c_walking_speed; // m/s
    static const int c_notchian_tick_ms;
    static const int c_physics_fps;
    static const float c_gravity; // m/s^2
    QTimer * m_physics_timer;

    LoginStatus m_login_state;


    QString m_connection_hash;

private:
    void changeLoginState(LoginStatus state);

    static void fromNotchianXyz(EntityPosition & destination, double notchian_x, double notchian_y, double notchian_z);
    static Int3D fromNotchianXyz(int notchian_x, int notchian_y, int notchian_z);
    static Int3D fromNotchianXyz(Int3D notchian_xyz);
    static void toNotchianXyz(const EntityPosition &source, double & destination_notchian_x, double & destination_notchian_y, double & destination_notchian_z);
    static void fromNotchianYawPitch(EntityPosition & destination, float notchian_yaw, float notchian_pitch);
    static void toNotchianYawPitch(const EntityPosition &source, float & destination_notchian_yaw, float & destination_notchian_pitch);
    QByteArray notchUrlEncode(QString param);

private slots:
    void initialize();
    void terminate();
    void handleConnected();
    void cleanUpAfterDisconnect();
    void processIncomingMessage(QSharedPointer<IncomingResponse>);
    void handleSocketError(QAbstractSocket::SocketError);
    void sendMessage(QSharedPointer<OutgoingRequest> message);
    void handleFinishedRequest(QNetworkReply *);
};


#endif
