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

// use it to send messages and connect to it to hear it emit incoming messages.
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
        WaitingForLoginResponse,
        WaitingForPlayerPositionAndLook,
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
    void loginStatusUpdated(LoginStatus status);
    void socketDisconnected();

    void chatReceived(QString message);
    void mapChunkUpdated(QSharedPointer<Chunk> chunk);
    void unloadChunk(Int3D coord);
    void playerPositionUpdated(Server::EntityPosition position);
    void inventoryUpdated(QVector<Message::Item> inventory);

public slots:
    // use this to actually connect to the server
    void socketConnect();

    // disconnects immediately, without finishing writing or reading messages.
    void socketDisconnect();

    // finishes up the outgoing message queue and then performs socketDisconnect.
    void finishWritingAndDisconnect();

    // sends a chat
    void sendChat(QString message);
public:
    LoginStatus loginStatus();
    void updateNextPlayerPosition(EntityPosition next_player_position);

private:
    QUrl m_connection_info;

    QThread * m_socket_thread;
    QTcpSocket * m_socket;
    IncomingMessageParser * m_parser;
    QTimer * m_position_update_timer;

    static const int c_physics_fps;
    static const float c_gravity; // m/s^2
    QTimer * m_physics_timer;

    LoginStatus m_login_state;

    EntityPosition m_canonical_player_position;
    EntityPosition m_next_player_position;

private:
    void changeLoginState(LoginStatus state);
    void gotFirstPlayerPositionAndLookResponse();
    void sendMessage(QSharedPointer<OutgoingRequest> message);


    static void fromNotchianXyz(EntityPosition & destination, double notchian_x, double notchian_y, double notchian_z);
    static Int3D fromNotchianXyz(int notchian_x, int notchian_y, int notchian_z);
    static Int3D fromNotchianXyz(Int3D notchian_xyz);
    static void toNotchianXyz(const EntityPosition &source, double & destination_notchian_x, double & destination_notchian_y, double & destination_notchian_z);
    static void fromNotchianYawPitch(EntityPosition & destination, float notchian_yaw, float notchian_pitch);
    static void toNotchianYawPitch(const EntityPosition &source, float & destination_notchian_yaw, float & destination_notchian_pitch);

private slots:
    void initialize();
    void terminate();
    void handleConnected();
    void cleanUpAfterDisconnect();
    void processIncomingMessage(QSharedPointer<IncomingResponse>);
    void handleSocketError(QAbstractSocket::SocketError);
    void sendPosition();
    void doPhysics();
    void internalUpdateNextPlayerPosition(EntityPosition next_player_position);
};


#endif
